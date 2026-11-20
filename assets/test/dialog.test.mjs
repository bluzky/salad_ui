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
  closeOnEscape = true,
  animations,
} = {}) {
  const initialState =
    state === undefined ? `data-open="${open}"` : `data-state="${state}"`;

  const options = JSON.stringify({
    closeOnOutsideClick,
    closeOnEscape,
    ...(animations ? { animations } : {}),
  });

  document.body.innerHTML = `
    <button id="outside-trigger" type="button">Launch</button>
    <div id="${id}" data-component="dialog" ${initialState}
         data-options='${options}'
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
    hookContext,
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
  const { component, content, panel, trigger, closeTrigger, pushed } =
    buildDialog();

  click(trigger);
  assert.equal(component.state, "open");
  assert.equal(content.hidden, false);
  assert.equal(panel.getAttribute("aria-modal"), "true");
  assert.equal(panel.getAttribute("aria-labelledby"), "dialog-1-title");
  assert.equal(panel.getAttribute("aria-describedby"), "dialog-1-description");
  assert.equal(pushed.at(-1).event, "open");

  click(closeTrigger);
  assert.equal(component.state, "closed");
  assert.equal(content.hidden, true);
  assert.equal(panel.getAttribute("role"), "dialog");
  assert.equal(panel.hasAttribute("aria-modal"), false);
  assert.equal(panel.hasAttribute("aria-labelledby"), false);
  assert.equal(panel.hasAttribute("aria-describedby"), false);
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

test("Escape does not close dialogs that disable closeOnEscape", () => {
  const { component, el, trigger } = buildDialog({ closeOnEscape: false });
  click(trigger);

  const event = new window.KeyboardEvent("keydown", {
    key: "Escape",
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(event);

  assert.equal(component.state, "open");
  assert.equal(event.defaultPrevented, false);
  component.destroy();
});

test("notifies close before an animated exit completes", () => {
  const { component, content, trigger, closeTrigger, pushed } = buildDialog({
    animations: {
      open_to_closed: { duration: 50, target_part: "content" },
    },
  });
  click(trigger);
  pushed.length = 0;

  click(closeTrigger);

  assert.equal(component.state, "closed");
  assert.equal(content.hidden, false);
  assert.equal(pushed.at(-1).event, "close");
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

test("SSR-open state initializes dialog without emitting open on remount", async () => {
  const { component, content, panel, el, hookContext, pushed } = buildDialog({
    state: "open",
  });

  await wait(60);
  assert.equal(component.state, "open");
  assert.equal(content.hidden, false);
  assert.equal(panel.getAttribute("role"), "dialog");
  assert.equal(panel.getAttribute("aria-modal"), "true");
  assert.equal(panel.getAttribute("aria-labelledby"), "dialog-1-title");
  assert.equal(panel.getAttribute("aria-describedby"), "dialog-1-description");
  assert.equal(pushed.filter(({ event }) => event === "open").length, 0);
  component.destroy();

  const remounted = registry.create("dialog", el, hookContext);
  await wait(60);

  assert.equal(remounted.state, "open");
  assert.equal(pushed.filter(({ event }) => event === "open").length, 0);
  remounted.destroy();
});

test("LiveView hook updates keep an open dialog when its server state is unchanged", () => {
  const { el, trigger } = buildDialog();
  const hook = createHookInstance(el);
  hook.mounted();
  click(trigger);

  const original = hook.component;
  const content = el.querySelector('[data-part="content"]');
  // What a patch without JS.ignore_attributes does to the parts.
  content.hidden = true;
  el.removeAttribute("data-state");
  content.removeAttribute("data-state");
  hook.updated();

  assert.equal(original.destroyed, false);
  assert.equal(hook.component, original);
  assert.equal(hook.component.state, "open");
  assert.equal(content.hidden, false);
  assert.equal(el.getAttribute("data-state"), "open");
  assert.equal(content.getAttribute("data-state"), "open");
  hook.destroyed();
});

test("LiveView hook updates apply the open state to parts a patch added", () => {
  const { el, trigger, panel } = buildDialog();
  const hook = createHookInstance(el);
  hook.mounted();
  click(trigger);

  panel.insertAdjacentHTML(
    "beforeend",
    '<div data-part="footer" id="added-footer"></div>',
  );
  hook.updated();

  assert.equal(
    document.getElementById("added-footer").getAttribute("data-state"),
    "open",
  );
  hook.destroyed();
});

test("dialog claims the attributes it sets so LiveView patches leave them alone", () => {
  const { el } = buildDialog();
  const claimed = new Map();
  const hook = {
    ...createHookInstance(el),
    js: () => ({
      ignoreAttributes: (part, attrs) => claimed.set(part.dataset.part, attrs),
    }),
  };
  hook.mounted();

  assert.deepEqual(claimed.get("root"), ["data-state"]);
  assert.ok(claimed.get("content").includes("hidden"));
  assert.ok(claimed.get("content").includes("data-state"));
  assert.ok(claimed.get("overlay").includes("data-state"));
  assert.ok(claimed.get("content-panel").includes("aria-modal"));
  hook.destroyed();
});

test("dialogs driven by a server-rendered data-state leave it to the server and rebuild on updates", () => {
  const { el, trigger } = buildDialog({ state: "closed" });
  const claimed = new Map();
  const hook = {
    ...createHookInstance(el),
    js: () => ({
      ignoreAttributes: (part, attrs) => claimed.set(part.dataset.part, attrs),
    }),
  };
  hook.mounted();
  assert.equal(claimed.has("root"), false);
  assert.ok(claimed.get("content").includes("hidden"));

  click(trigger);
  const original = hook.component;
  hook.updated();
  assert.equal(original.destroyed, true);
  assert.notEqual(hook.component, original);
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

function trackingHook(el) {
  const pushed = [];
  const hook = {
    ...createHookInstance(el),
    pushEventTo: (target, event) => pushed.push(event),
  };
  return { hook, pushed };
}

test("a patch that replaces the panel moves the focus trap and outside-click monitor to it", async () => {
  const { el, trigger } = buildDialog();
  const { hook } = trackingHook(el);
  hook.mounted();
  click(trigger);
  await wait(60);

  const oldPanel = el.querySelector('[data-part="content-panel"]');
  oldPanel.outerHTML = `
    <div data-part="content-panel">
      <button id="first" type="button">First</button>
      <button id="last" type="button">Last</button>
    </div>`;
  hook.updated();

  const panel = el.querySelector('[data-part="content-panel"]');
  assert.equal(hook.component.contentPanel, panel);

  document.getElementById("last").focus();
  const tab = new window.KeyboardEvent("keydown", {
    key: "Tab",
    bubbles: true,
    cancelable: true,
  });
  document.getElementById("last").dispatchEvent(tab);
  assert.equal(tab.defaultPrevented, true);
  assert.equal(document.activeElement, document.getElementById("first"));

  document
    .getElementById("first")
    .dispatchEvent(
      new window.MouseEvent("mousedown", { bubbles: true, cancelable: true }),
    );
  click(document.getElementById("first"));
  assert.equal(hook.component.state, "open");
  hook.destroyed();
});

test("a server-driven close or open after a rebuild is not pushed back to the server", () => {
  const { el } = buildDialog({ open: true });
  const { hook, pushed } = trackingHook(el);
  hook.mounted();
  pushed.length = 0;

  // The root's data-state is owned by the dialog, so the patch keeps it.
  el.dataset.open = "false";
  hook.updated();
  assert.equal(hook.component.state, "closed");
  assert.deepEqual(pushed, []);

  el.dataset.open = "true";
  hook.updated();
  assert.equal(hook.component.state, "open");
  assert.deepEqual(pushed, []);

  // What the user does still reaches the server.
  click(el.querySelector('[data-part="close-trigger"]'));
  assert.deepEqual(pushed, ["close"]);
  hook.destroyed();
});

test("a close control added by a patch works", () => {
  const { el, trigger, panel } = buildDialog();
  const { hook } = trackingHook(el);
  hook.mounted();
  click(trigger);

  panel.insertAdjacentHTML(
    "beforeend",
    '<button id="added-close" data-action="close" type="button">Done</button>',
  );
  hook.updated();

  click(document.getElementById("added-close"));
  assert.equal(hook.component.state, "closed");
  hook.destroyed();
});

test("a patch leaves the state of item parts inside the dialog alone", () => {
  const { el, trigger, panel } = buildDialog();
  const { hook } = trackingHook(el);
  hook.mounted();
  click(trigger);

  panel.insertAdjacentHTML(
    "beforeend",
    '<div id="an-item" data-part="checkbox-item" data-state="checked"></div>',
  );
  hook.updated();

  assert.equal(
    document.getElementById("an-item").getAttribute("data-state"),
    "checked",
  );
  hook.destroyed();
});

test("a patch during the close animation does not cut it short", async () => {
  const { el, trigger, content } = buildDialog({
    animations: {
      open_to_closed: { duration: 40, target_part: "content" },
    },
  });
  const { hook } = trackingHook(el);
  hook.mounted();
  click(trigger);

  hook.component.transition("close");
  hook.updated();
  assert.equal(content.hidden, false);

  await wait(120);
  assert.equal(content.hidden, true);
  hook.destroyed();
});
