import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import SwitchComponent from "../salad_ui/components/switch.js";
import { installDom, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

function buildSwitch({ checked = false, disabled = false } = {}) {
  const state = checked ? "checked" : "unchecked";

  document.body.innerHTML = `
    <div
      id="airplane-mode"
      data-component="switch"
      data-state="${state}"
      data-options='${JSON.stringify({ disabled })}'
      data-event-mappings='{"checked-changed":"switch_changed"}'
      data-part="root"
      tabindex="0"
    >
      <input type="checkbox" id="airplane-mode-input" value="true" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} data-part="input" />
      <span data-part="thumb" data-state="${state}"></span>
    </div>
  `;

  const el = document.getElementById("airplane-mode");
  const pushed = [];
  const hookContext = {
    pushEventTo(target, event, payload) {
      pushed.push({ target, event, payload });
    },
    liveSocket: { execJS: () => {} },
  };

  const component = new SwitchComponent(el, hookContext);
  component.setupEvents();

  return {
    component,
    el,
    pushed,
    input: el.querySelector('input[type="checkbox"]'),
    thumb: el.querySelector('[data-part="thumb"]'),
  };
}

function click(el) {
  el.dispatchEvent(
    new window.MouseEvent("click", { bubbles: true, cancelable: true }),
  );
}

test("initialization reflects state with role, aria, and data-state", () => {
  const { el, input, thumb } = buildSwitch({ checked: true });

  assert.equal(el.getAttribute("role"), "switch");
  assert.equal(el.getAttribute("aria-checked"), "true");
  assert.equal(el.getAttribute("data-state"), "checked");
  assert.equal(input.getAttribute("data-state"), "checked");
  assert.equal(thumb.getAttribute("data-state"), "checked");
  assert.equal(input.checked, true);
});

test("click toggles checkbox, aria, data-state, and pushes LiveView event", () => {
  const { el, input, pushed } = buildSwitch();

  click(el);

  assert.equal(input.checked, true);
  assert.equal(el.getAttribute("data-state"), "checked");
  assert.equal(el.getAttribute("aria-checked"), "true");
  assert.deepEqual(pushed, [
    {
      target: el,
      event: "switch_changed",
      payload: {
        value: true,
        componentId: "airplane-mode",
        component: "switch",
      },
    },
  ]);
});

test("Space toggles switch and prevents page scroll", () => {
  const { el, input, pushed } = buildSwitch();
  const event = new window.KeyboardEvent("keydown", {
    key: " ",
    bubbles: true,
    cancelable: true,
  });

  el.dispatchEvent(event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(input.checked, true);
  assert.equal(pushed[0].event, "switch_changed");
  assert.equal(pushed[0].payload.value, true);
});

test("disabled switch stays non-focusable and ignores interaction", () => {
  const { el, input, pushed } = buildSwitch({ disabled: true });
  const event = new window.KeyboardEvent("keydown", {
    key: "Enter",
    bubbles: true,
    cancelable: true,
  });

  click(el);
  el.dispatchEvent(event);

  assert.equal(el.getAttribute("tabindex"), "-1");
  assert.equal(el.getAttribute("data-state"), "unchecked");
  assert.equal(el.getAttribute("aria-checked"), "false");
  assert.equal(input.checked, false);
  assert.equal(pushed.length, 0);
});
