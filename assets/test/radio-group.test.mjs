import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { registry } from "../salad_ui/core/factory.js";
import "../salad_ui/components/radio_group.js"; // self-registers "radio-group"
import { installDom, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

function buildRadioGroup({
  id = "plan",
  name = "subscription",
  initialValue = "monthly",
} = {}) {
  document.body.innerHTML = `
    <div id="${id}" data-component="radio-group" data-state="idle"
         data-options='${JSON.stringify({ name, initialValue })}'
         data-event-mappings='{"value-changed":"plan_changed"}'
         data-part="root">
      <div data-part="item" data-value="monthly" data-state="unchecked" data-disabled="false" tabindex="-1">
        <input type="radio" id="monthly" value="monthly" class="sr-only" tabindex="-1" />
      </div>
      <label for="monthly">Monthly</label>
      <div data-part="item" data-value="yearly" data-state="unchecked" data-disabled="false" tabindex="-1">
        <input type="radio" id="yearly" value="yearly" class="sr-only" tabindex="-1" />
      </div>
      <label id="yearly-label" for="yearly">Yearly</label>
    </div>
  `;

  const el = document.getElementById(id);
  const pushed = [];
  const hookContext = {
    pushEventTo: (target, event, payload) =>
      pushed.push({ target, event, payload }),
    liveSocket: { execJS: () => {} },
  };

  const component = registry.create("radio-group", el, hookContext);

  return {
    component,
    el,
    pushed,
    item: (value) =>
      el.querySelector(`[data-part="item"][data-value="${value}"]`),
    input: (value) => el.querySelector(`input[value="${value}"]`),
  };
}

function click(el) {
  el.dispatchEvent(
    new window.MouseEvent("click", { bubbles: true, cancelable: true }),
  );
}

test("initialization applies radio names and accessible labels", () => {
  const { input, item } = buildRadioGroup();

  assert.equal(input("monthly").name, "subscription");
  assert.equal(input("yearly").name, "subscription");
  assert.equal(
    item("monthly").getAttribute("aria-labelledby"),
    "plan-item-monthly-label-0",
  );
  assert.equal(
    document.getElementById("plan-item-monthly-label-0").textContent,
    "Monthly",
  );
  assert.equal(item("yearly").getAttribute("aria-labelledby"), "yearly-label");
});

test("selecting item keeps name and emits value change", () => {
  const { input, item, pushed } = buildRadioGroup();

  click(item("yearly"));

  assert.equal(input("yearly").checked, true);
  assert.equal(input("yearly").name, "subscription");
  assert.deepEqual(pushed, [
    {
      target: document.getElementById("plan"),
      event: "plan_changed",
      payload: {
        value: "yearly",
        previousValue: "monthly",
        componentId: "plan",
        component: "radio-group",
      },
    },
  ]);
});
