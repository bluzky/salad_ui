import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import "../salad_ui/components/dialog.js";
import { registry } from "../salad_ui/core/factory.js";
import { SaladUIHook } from "../salad_ui/core/hook.js";
import { installDom, uninstallDom, wait } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());
afterEach(() => {
  document.body.innerHTML = "";
});

function buildDialog({
  id = "dialog-1",
  open = false,
  state,
  closeOnOutsideClick = true,
} = {}) {
  const initialState =
    state === undefined ? `data-open="${open}"` : `data-state="${state}"`;

  document.body.innerHTML = `
    <button id="outside-trigger" type="button">Launch</button>
    <div id="${id}" data-component="dialog" ${initialState}
         data-options='{"closeOnOutsideClick":${closeOnOutsideClick}}'
         data-event-mappings='{"open":"open","close":"close"}'
         data-part="root">
      <button data-part="trigger" data-action="open" type="button">Open</button>
      <div data-part="content" hidden>
        <div data-part="overlay"></div>
        <div data-part="content-panel">
          <h2 data-part="title">Dialog title</h2>
          <p data-part="description">Dialog description</p>
          <button data-part="close-trigger" data-action="close" type="button">Close</button>
          <button id="dialog-action" type="button">Action</button>
        </div>
      </div>
    </div>
  `;

  const el = document.getElementById(id);
  const pushed = [];
  const hookContext = {
    pushEventTo: (target, event, payload) =>
      pushed.push({ target, event, payload }),
    liveSocket: { execJS: () => {} },
  };

  return {
    component: registry.create("dialog", el, hookContext),
    el,
    content: el.querySelector('[data-part="content"]'),
    panel: el.querySelector('[data-part="content-panel"]'),
    trigger: el.querySelector('[data-part="trigger"]'),
    overlay: el.querySelector('[data-part="overlay"]'),
    closeTrigger: el.querySelector('[data-part="close-trigger"]'),
    outsideTrigger: document.getElementById("outside-trigger"),
    pushed,
  };
}

function click(el) {
  el.dispatchEvent(
    new window.MouseEvent("click", { bubbles: true, cancelable: true }),
  );
}

function createHookInstance(el) {
  return {
    ...SaladUIHook,
    el,
    pushEventTo() {},
    handleEvent() {},
  };
}

test("opens from trigger and closes from close trigger", () => {
  const { component, content, trigger, closeTrigger, pushed } = buildDialog();

  click(trigger);
  assert.equal(component.state, "open");
  assert.equal(content.hidden, false);
  assert.equal(pushed.at(-1).event, "open");

  click(closeTrigger);
  assert.equal(component.state, "closed");
  assert.equal(content.hidden, true);
  assert.equal(pushed.at(-1).event, "close");

  component.destroy();
});

test("Escape closes dialog and prevents browser default", () => {
  const { component, el, trigger } = buildDialog();
  click(trigger);

  const event = new window.KeyboardEvent("keydown", {
    key: "Escape",
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(event);

  assert.equal(component.state, "closed");
  assert.equal(event.defaultPrevented, true);
  component.destroy();
});

test("overlay closes only when outside-click dismissal is enabled", () => {
  const enabled = buildDialog({ closeOnOutsideClick: true });
  click(enabled.trigger);
  click(enabled.overlay);
  assert.equal(enabled.component.state, "closed");
  enabled.component.destroy();

  const disabled = buildDialog({ closeOnOutsideClick: false });
  click(disabled.trigger);
  click(disabled.overlay);
  assert.equal(disabled.component.state, "open");
  disabled.component.destroy();
});

test("focuses first dialog control and restores prior focus on close", async () => {
  const { component, trigger, closeTrigger, outsideTrigger } = buildDialog();
  outsideTrigger.focus();
  click(trigger);

  await wait(60);
  assert.equal(document.activeElement, closeTrigger);

  component.transition("close");
  await wait(10);
  assert.equal(document.activeElement, outsideTrigger);
  component.destroy();
});

test("SSR-open state activates dialog and wires accessible labels", async () => {
  const { component, content, panel } = buildDialog({ state: "open" });

  await wait(60);
  assert.equal(component.state, "open");
  assert.equal(content.hidden, false);
  assert.equal(panel.getAttribute("role"), "dialog");
  assert.equal(panel.getAttribute("aria-modal"), "true");
  assert.equal(panel.getAttribute("aria-labelledby"), "dialog-1-title");
  assert.equal(panel.getAttribute("aria-describedby"), "dialog-1-description");
  component.destroy();
});

test("LiveView hook updates remount dialog from server-rendered state", () => {
  const { el, trigger } = buildDialog();
  const hook = createHookInstance(el);
  hook.mounted();
  click(trigger);

  const original = hook.component;
  hook.updated();

  assert.equal(original.destroyed, true);
  assert.notEqual(hook.component, original);
  assert.equal(hook.component.state, "closed");
  assert.equal(el.querySelector('[data-part="content"]').hidden, true);
  hook.destroyed();
});

test("LiveView hook updates honor changed server dialog state", () => {
  const { el } = buildDialog({ open: true });
  const hook = createHookInstance(el);
  hook.mounted();

  el.dataset.open = "false";
  hook.updated();

  assert.equal(hook.component.state, "closed");
  assert.equal(el.querySelector('[data-part="content"]').hidden, true);
  hook.destroyed();
});
