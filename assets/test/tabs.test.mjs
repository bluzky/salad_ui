import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { registry } from "../salad_ui/core/factory.js";
import "../salad_ui/components/tabs.js";
import { installDom, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

function triggerMarkup({ value, disabled = false }) {
  return `<button type="button" data-part="trigger" data-value="${value}" data-state="inactive" data-disabled="${disabled}"${disabled ? " disabled" : ""}>${value}</button>`;
}

function contentMarkup({ value }) {
  return `<div data-part="content" data-value="${value}" data-state="inactive" hidden>${value} content</div>`;
}

function buildTabs({
  id = "tabs-1",
  value = null,
  defaultValue = null,
  items = [{ value: "account" }, { value: "password" }, { value: "billing" }],
} = {}) {
  const options = { value, defaultValue };
  const eventMappings = { "tab-changed": "tab_changed" };

  document.body.innerHTML = `
    <div id="${id}" data-component="tabs" data-state="idle"
         data-options='${JSON.stringify(options)}'
         data-event-mappings='${JSON.stringify(eventMappings)}'
         data-part="root">
      <div data-part="list">
        ${items.map(triggerMarkup).join("")}
      </div>
      ${items.map(contentMarkup).join("")}
    </div>
  `;

  const el = document.getElementById(id);
  const pushed = [];
  const hookContext = {
    pushEventTo: (target, event, payload) =>
      pushed.push({ target, event, payload }),
    liveSocket: { execJS: () => {} },
  };

  const component = registry.create("tabs", el, hookContext);

  const getTrigger = (itemValue) =>
    el.querySelector(`[data-part="trigger"][data-value="${itemValue}"]`);
  const getContent = (itemValue) =>
    el.querySelector(`[data-part="content"][data-value="${itemValue}"]`);

  return { component, el, pushed, getTrigger, getContent };
}

function click(el) {
  el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
}

function keydown(el, key) {
  el.dispatchEvent(new window.KeyboardEvent("keydown", { key, bubbles: true }));
}

test("defaultValue selects matching tab on mount", () => {
  const { getTrigger, getContent } = buildTabs({ defaultValue: "password" });

  assert.equal(getTrigger("password").getAttribute("data-state"), "active");
  assert.equal(getTrigger("password").getAttribute("aria-selected"), "true");
  assert.equal(getTrigger("password").tabIndex, 0);
  assert.equal(getContent("password").hidden, false);

  assert.equal(getTrigger("account").getAttribute("data-state"), "inactive");
  assert.equal(getContent("account").hidden, true);
});

test("controlled value wins over defaultValue on mount", () => {
  const { getTrigger, getContent } = buildTabs({
    value: "billing",
    defaultValue: "account",
  });

  assert.equal(getTrigger("billing").getAttribute("data-state"), "active");
  assert.equal(getContent("billing").hidden, false);
  assert.equal(getTrigger("account").getAttribute("data-state"), "inactive");
});

test("invalid or disabled selected value falls back to first enabled tab", () => {
  const { getTrigger, getContent } = buildTabs({
    value: "missing",
    items: [
      { value: "disabled", disabled: true },
      { value: "account" },
      { value: "password" },
    ],
  });

  assert.equal(getTrigger("disabled").getAttribute("data-state"), "inactive");
  assert.equal(getTrigger("disabled").tabIndex, -1);
  assert.equal(getContent("disabled").hidden, true);

  assert.equal(getTrigger("account").getAttribute("data-state"), "active");
  assert.equal(getTrigger("account").tabIndex, 0);
  assert.equal(getContent("account").hidden, false);
});

test("clicking a trigger selects it and pushes tab-changed", () => {
  const { getTrigger, getContent, pushed } = buildTabs({
    defaultValue: "account",
  });

  click(getTrigger("password"));

  assert.equal(getTrigger("password").getAttribute("data-state"), "active");
  assert.equal(getContent("password").hidden, false);
  assert.equal(getTrigger("account").getAttribute("data-state"), "inactive");

  assert.equal(pushed.at(-1).event, "tab_changed");
  assert.deepEqual(pushed.at(-1).payload, {
    value: "password",
    tab: "password",
    componentId: "tabs-1",
    component: "tabs",
  });
});

test("keyboard navigation selects next enabled tab and skips disabled tabs", () => {
  const { getTrigger, getContent } = buildTabs({
    defaultValue: "account",
    items: [
      { value: "account" },
      { value: "disabled", disabled: true },
      { value: "password" },
    ],
  });

  getTrigger("account").focus();
  keydown(getTrigger("account"), "ArrowRight");

  assert.equal(document.activeElement, getTrigger("password"));
  assert.equal(getTrigger("password").getAttribute("data-state"), "active");
  assert.equal(getContent("password").hidden, false);
});
