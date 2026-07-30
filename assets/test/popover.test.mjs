import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import "../salad_ui/components/popover.js";
import { registry } from "../salad_ui/core/factory.js";
import { SaladUIHook } from "../salad_ui/core/hook.js";
import { installDom, setRect, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());
afterEach(() => {
  document.body.innerHTML = "";
});

function buildPopover({ state = "closed", usePortal = false } = {}) {
  const options = JSON.stringify({
    portalContainer: "#portal",
    usePortal,
  });

  document.body.innerHTML = `
    <div id="portal"></div>
    <div id="popover-1" data-component="popover" data-state="${state}"
         data-options='${options}'
         data-event-mappings='{"open":"opened","close":"closed"}'
         data-part="root">
      <button data-part="trigger" data-action="toggle" type="button">Open</button>
      <div data-part="positioner" data-side="bottom" data-align="center"
           data-side-offset="8" data-align-offset="0" hidden>
        <div data-part="content"><button type="button">Content action</button></div>
      </div>
    </div>
  `;

  const el = document.getElementById("popover-1");
  const trigger = el.querySelector('[data-part="trigger"]');
  const positioner = el.querySelector('[data-part="positioner"]');
  const content = el.querySelector('[data-part="content"]');
  setRect(trigger, {
    top: 100,
    right: 200,
    bottom: 140,
    left: 100,
    width: 100,
    height: 40,
  });
  setRect(positioner, { width: 120, height: 80 });

  const pushed = [];
  const hookContext = {
    pushEventTo: (target, event, payload) =>
      pushed.push({ target, event, payload }),
    liveSocket: { execJS: () => {} },
  };

  return { el, trigger, positioner, content, pushed, hookContext };
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

test("SSR-open popover activates positioning without an open event", () => {
  const { el, positioner, content, pushed, hookContext } = buildPopover({
    state: "open",
  });
  const component = registry.create("popover", el, hookContext);

  assert.equal(component.state, "open");
  assert.equal(component.positionedElement.active, true);
  assert.equal(positioner.parentElement, el);
  assert.equal(positioner.hidden, false);
  assert.equal(content.getAttribute("role"), "dialog");
  assert.deepEqual(pushed, []);

  component.destroy();
});

test("Escape from portaled content closes popover", () => {
  const { el, trigger, positioner, content, hookContext } = buildPopover({
    usePortal: true,
  });
  const component = registry.create("popover", el, hookContext);

  click(trigger);
  assert.equal(positioner.parentElement.id, "portal");

  const event = new window.KeyboardEvent("keydown", {
    key: "Escape",
    bubbles: true,
    cancelable: true,
  });
  content.dispatchEvent(event);

  assert.equal(component.state, "closed");
  assert.equal(event.defaultPrevented, true);
  assert.equal(positioner.parentElement, el);
  component.destroy();
});

test("position callback synchronizes content side with flipped placement", () => {
  const { el, trigger, content, hookContext } = buildPopover();
  const component = registry.create("popover", el, hookContext);

  click(trigger);
  component.positionedElement.options.onPosition({ placement: "top" });

  assert.equal(content.dataset.side, "top");
  component.destroy();
});

test("LiveView pre-update restores portaled content before component recreation", () => {
  const { el, trigger, positioner } = buildPopover({ usePortal: true });
  const hook = createHookInstance(el);
  hook.mounted();

  click(trigger);
  assert.equal(positioner.parentElement.id, "portal");

  hook.beforeUpdate();
  assert.equal(positioner.parentElement, el);

  // Simulate LiveView replacing root children during its DOM patch.
  el.innerHTML = `
    <button data-part="trigger" data-action="toggle" type="button">Open</button>
    <div data-part="positioner" data-side="bottom" data-align="center"
         data-side-offset="8" data-align-offset="0" hidden>
      <div data-part="content"><button type="button">Content action</button></div>
    </div>
  `;
  const patchedTrigger = el.querySelector('[data-part="trigger"]');
  const patchedPositioner = el.querySelector('[data-part="positioner"]');
  setRect(patchedTrigger, {
    top: 100,
    right: 200,
    bottom: 140,
    left: 100,
    width: 100,
    height: 40,
  });
  setRect(patchedPositioner, { width: 120, height: 80 });

  const original = hook.component;
  hook.updated();

  assert.equal(original.destroyed, true);
  assert.notEqual(hook.component, original);
  assert.equal(document.querySelectorAll('[data-part="positioner"]').length, 1);
  assert.equal(patchedPositioner.parentElement.id, "portal");
  hook.destroyed();
});
