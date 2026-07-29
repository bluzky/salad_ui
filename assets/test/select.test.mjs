import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { registry } from "../salad_ui/core/factory.js";
import "../salad_ui/components/select.js"; // self-registers "select"
import { installDom, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

function itemMarkup({
  value,
  label = value,
  disabled = false,
  ariaDisabled = false,
  dataDisabled,
}) {
  const dataDisabledAttr =
    dataDisabled !== undefined
      ? `data-disabled="${dataDisabled}"`
      : disabled
        ? 'data-disabled="true"'
        : "";
  return `
    <div data-part="item" data-value="${value}" ${dataDisabledAttr} ${ariaDisabled ? 'aria-disabled="true"' : ""} tabindex="${disabled ? "-1" : "0"}">
      <span data-part="item-indicator" hidden></span>
      <span data-part="item-text">${label}</span>
    </div>
  `;
}

function buildSelect({
  id = "select-1",
  name = "fruit",
  multiple = false,
  value = null,
  defaultValue = null,
  items = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "orange", label: "Orange" },
  ],
  inForm = false,
  extraHidden = false,
  disabled = false,
} = {}) {
  const options = { name, multiple, value, defaultValue, usePortal: false };
  const root = `
    <div id="${id}" data-component="select" data-state="closed"
         data-disabled="${disabled}"
         data-options='${JSON.stringify(options)}'
         data-event-mappings='{"value-changed":"value_changed"}'
         data-part="root">
      <button type="button" data-part="trigger" ${disabled ? "disabled" : ""}>
        <span data-part="value" data-placeholder="Choose one">Choose one</span>
      </button>
      <div data-part="content" hidden>
        ${items.map(itemMarkup).join("")}
      </div>
      ${extraHidden ? '<input type="hidden" name="csrf_token" value="keep-me">' : ""}
    </div>
  `;

  document.body.innerHTML = inForm ? `<form id="form">${root}</form>` : root;

  const el = document.getElementById(id);
  const pushed = [];
  const hookContext = {
    pushEventTo: (target, event, payload) =>
      pushed.push({ target, event, payload }),
    liveSocket: { execJS: () => {} },
  };

  const component = registry.create("select", el, hookContext);

  return {
    component,
    el,
    form: document.getElementById("form"),
    pushed,
    trigger: el.querySelector('[data-part="trigger"]'),
    content: el.querySelector('[data-part="content"]'),
    valueDisplay: el.querySelector('[data-part="value"]'),
    item: (value) =>
      el.querySelector(`[data-part="item"][data-value="${value}"]`),
    hiddenInputs: () =>
      Array.from(
        el.querySelectorAll(
          'input[type="hidden"][data-salad-ui-select-input="true"]',
        ),
      ),
  };
}

function click(el) {
  el.dispatchEvent(
    new window.MouseEvent("click", { bubbles: true, cancelable: true }),
  );
}

function keydown(el, key) {
  const event = new window.KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(event);
  return event;
}

test("trigger keyboard opens select and focuses the selected item", () => {
  const { content, item, trigger } = buildSelect({ value: "banana" });

  keydown(trigger, "ArrowDown");

  assert.equal(content.hidden, false);
  assert.equal(document.activeElement, item("banana"));
});

test("trigger click toggles an open select closed and restores trigger focus", () => {
  const { content, trigger } = buildSelect();

  click(trigger);
  assert.equal(content.hidden, false);

  click(trigger);
  assert.equal(content.hidden, true);
  assert.equal(document.activeElement, trigger);
});

test("trigger click does nothing when select is disabled", () => {
  const { content, hiddenInputs, pushed, trigger, valueDisplay } = buildSelect({
    disabled: true,
  });

  const hiddenBefore = hiddenInputs().map((input) => [input.name, input.value]);

  click(trigger);

  assert.equal(content.hidden, true);
  assert.equal(valueDisplay.textContent, "Choose one");
  assert.deepEqual(
    hiddenInputs().map((input) => [input.name, input.value]),
    hiddenBefore,
  );
  assert.deepEqual(pushed, []);
});

test("trigger keydown does nothing when select is disabled", () => {
  const { content, trigger } = buildSelect({ disabled: true });

  keydown(trigger, "ArrowDown");

  assert.equal(content.hidden, true);
});

test("items with aria-disabled=true cannot be selected", () => {
  const { content, item, pushed, trigger, valueDisplay } = buildSelect({
    items: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana", ariaDisabled: true },
      { value: "orange", label: "Orange" },
    ],
  });

  click(trigger);
  assert.equal(content.hidden, false);

  click(item("banana"));

  assert.equal(content.hidden, false);
  assert.equal(valueDisplay.textContent, "Choose one");
  assert.deepEqual(pushed, []);
});

test('items with data-disabled="false" behave as enabled', () => {
  const { item, trigger, valueDisplay } = buildSelect({
    items: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana", dataDisabled: "false" },
      { value: "orange", label: "Orange" },
    ],
  });

  click(trigger);
  click(item("banana"));

  assert.equal(valueDisplay.textContent, "Banana");
});

test("arrow keys navigate and prevent page scroll when open trigger keeps focus", () => {
  const { content, item, trigger } = buildSelect();
  document.body.insertAdjacentHTML("afterbegin", '<input id="before-select">');
  const before = document.getElementById("before-select");

  before.focus();
  click(trigger);
  trigger.focus();

  const event = keydown(trigger, "ArrowDown");

  assert.equal(content.hidden, false);
  assert.equal(event.defaultPrevented, true);
  assert.equal(document.activeElement, item("banana"));
});

test("selecting an item updates readable text, hidden input, and LiveView form events", () => {
  const { form, hiddenInputs, item, pushed, valueDisplay } = buildSelect({
    inForm: true,
  });
  const events = [];
  form.addEventListener("change", () => events.push("change"));

  click(item("banana"));

  assert.equal(valueDisplay.textContent, "Banana");
  assert.deepEqual(
    hiddenInputs().map((input) => [input.name, input.value]),
    [["fruit", "banana"]],
  );
  assert.deepEqual(events, ["change"]);
  assert.equal(pushed.at(-1).event, "value_changed");
  assert.equal(pushed.at(-1).payload.value, "banana");
});

test("multiple select dispatches form change from the select root", () => {
  const { el, form, hiddenInputs, item } = buildSelect({
    inForm: true,
    multiple: true,
  });
  const targets = [];
  form.addEventListener("change", (event) => targets.push(event.target));

  click(item("banana"));

  assert.deepEqual(targets, [el]);
  assert.deepEqual(
    hiddenInputs().map((input) => [input.name, input.value]),
    [["fruit[]", "banana"]],
  );
});

test("multiple select normalizes hidden input names and highlights first selected value", () => {
  const { hiddenInputs, item, trigger } = buildSelect({
    name: "skills",
    multiple: true,
    value: ["banana", "orange"],
  });

  assert.deepEqual(
    hiddenInputs().map((input) => [input.name, input.value]),
    [
      ["skills[]", "banana"],
      ["skills[]", "orange"],
    ],
  );

  keydown(trigger, "ArrowDown");
  assert.equal(document.activeElement, item("banana"));
});

test("multiple select preserves an already-bracketed name without doubling it", () => {
  const { hiddenInputs } = buildSelect({
    name: "skills[]",
    multiple: true,
    value: ["banana", "orange"],
  });

  assert.deepEqual(
    hiddenInputs().map((input) => [input.name, input.value]),
    [
      ["skills[]", "banana"],
      ["skills[]", "orange"],
    ],
  );
});

test("hidden input sync only replaces select-owned inputs", () => {
  const { el, item } = buildSelect({ extraHidden: true });

  click(item("orange"));

  const csrf = el.querySelector('input[name="csrf_token"]');
  assert.equal(csrf?.value, "keep-me");
});
