import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import CommandComponent from "../salad_ui/components/command.js";
import { installDom, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

function buildCommand({ includeInput = true, includeEmpty = true } = {}) {
  document.body.innerHTML = `
    <div id="command" data-component="command" data-part="root">
      ${includeInput ? '<input data-part="input" />' : ""}
      ${includeEmpty ? '<div data-part="empty" data-visible="false">No results</div>' : ""}
      <div data-part="list" role="listbox">
        <div data-part="group">
          <button data-part="item">Calendar</button>
          <button data-part="item" disabled>Disabled</button>
        </div>
      </div>
    </div>
  `;

  const el = document.getElementById("command");
  const component = new CommandComponent(el, null);
  component.setupEvents();

  return {
    component,
    el,
    input: el.querySelector('[data-part="input"]'),
    empty: el.querySelector('[data-part="empty"]'),
    items: [...el.querySelectorAll('[data-part="item"]')],
  };
}

test("constructor tolerates missing optional input and empty parts", () => {
  const { component, items } = buildCommand({
    includeInput: false,
    includeEmpty: false,
  });

  assert.equal(items[0].getAttribute("data-selected"), "true");

  component.destroy();
});

test("search clears selection when no enabled item matches", () => {
  const { component, el, input, empty, items } = buildCommand();
  let clicks = 0;
  items[0].addEventListener("click", () => clicks++);

  input.value = "missing";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  const event = new window.KeyboardEvent("keydown", {
    key: "Enter",
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(event);

  assert.equal(component.currentItemIdx, -1);
  assert.equal(items[0].getAttribute("data-selected"), "false");
  assert.equal(empty.getAttribute("data-visible"), "true");
  assert.equal(clicks, 0);
  assert.equal(event.defaultPrevented, true);

  component.destroy();
});

test("Enter selects current item and prevents parent form submit", () => {
  const { component, el, items } = buildCommand();
  let clicks = 0;
  items[0].addEventListener("click", () => clicks++);

  const event = new window.KeyboardEvent("keydown", {
    key: "Enter",
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(event);

  assert.equal(clicks, 1);
  assert.equal(event.defaultPrevented, true);

  component.destroy();
});
