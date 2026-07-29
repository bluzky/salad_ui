import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { registry } from "../salad_ui/core/factory.js";
import "../salad_ui/components/dropdown_menu.js"; // self-registers "dropdown-menu"
import { installDom, setRect, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());
afterEach(() => {
  document.body.innerHTML = "";
});

function buildDropdown({ id = "dropdown-1", state = "closed" } = {}) {
  document.body.innerHTML = `
    <div id="${id}" data-component="dropdown-menu" data-state="${state}"
         data-options='{"usePortal":false}'
         data-event-mappings='{"opened":"opened","closed":"closed"}'
         data-part="root">
      <button type="button" data-part="trigger" tabindex="0">Open</button>
      <div data-part="positioner" data-side="bottom" data-align="start"
           data-side-offset="4" data-align-offset="0" hidden>
        <div data-part="content" data-side="bottom" data-align="start">
          <div data-part="item" data-value="profile" tabindex="0"
               data-event-mappings='{"item-selected":"selected"}'>Profile</div>
          <div data-part="item" data-value="settings" tabindex="0"
               data-event-mappings='{"item-selected":"selected"}'>Settings</div>
          <div data-part="checkbox-item" data-value="bold" data-state="checked"
               data-checked="true" tabindex="0"
               data-event-mappings='{"checked-changed":"checked","item-selected":"selected"}'>
            <span data-part="item-indicator">✓</span>
            Bold
          </div>
        </div>
      </div>
    </div>
  `;

  const el = document.getElementById(id);
  const trigger = el.querySelector('[data-part="trigger"]');
  const positioner = el.querySelector('[data-part="positioner"]');
  const content = el.querySelector('[data-part="content"]');
  const profile = el.querySelector('[data-value="profile"]');
  const settings = el.querySelector('[data-value="settings"]');
  const checkbox = el.querySelector('[data-part="checkbox-item"]');
  const pushed = [];

  setRect(trigger, {
    top: 10,
    left: 10,
    bottom: 30,
    right: 110,
    width: 100,
    height: 20,
  });
  setRect(positioner, { width: 160, height: 80 });
  setRect(content, { width: 160, height: 80 });

  const hookContext = {
    pushEventTo: (target, event, payload) =>
      pushed.push({ target, event, payload }),
    liveSocket: { execJS: () => {} },
  };

  const component = registry.create("dropdown-menu", el, hookContext);

  return {
    component,
    el,
    trigger,
    positioner,
    content,
    profile,
    settings,
    checkbox,
    pushed,
  };
}

function click(el) {
  el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
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

test("trigger click opens then closes dropdown", () => {
  const { component, positioner, pushed, trigger } = buildDropdown();

  click(trigger);
  assert.equal(positioner.hidden, false);
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(pushed.at(-1).event, "opened");

  click(trigger);
  assert.equal(positioner.hidden, true);
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(pushed.at(-1).event, "closed");
  assert.equal(document.activeElement, trigger);

  component.destroy();
});

test("opening another dropdown closes currently open dropdown", () => {
  document.body.innerHTML = `
    <div id="dropdown-1" data-component="dropdown-menu" data-state="closed"
         data-options='{"usePortal":false}' data-event-mappings='{}' data-part="root">
      <button type="button" data-part="trigger" tabindex="0">Open 1</button>
      <div data-part="positioner" data-side="bottom" data-align="start"
           data-side-offset="4" data-align-offset="0" hidden>
        <div data-part="content" data-side="bottom" data-align="start">
          <div data-part="item" data-value="one" tabindex="0">One</div>
        </div>
      </div>
    </div>
    <div id="dropdown-2" data-component="dropdown-menu" data-state="closed"
         data-options='{"usePortal":false}' data-event-mappings='{}' data-part="root">
      <button type="button" data-part="trigger" tabindex="0">Open 2</button>
      <div data-part="positioner" data-side="bottom" data-align="start"
           data-side-offset="4" data-align-offset="0" hidden>
        <div data-part="content" data-side="bottom" data-align="start">
          <div data-part="item" data-value="two" tabindex="0">Two</div>
        </div>
      </div>
    </div>
  `;

  const hookContext = {
    pushEventTo: () => {},
    liveSocket: { execJS: () => {} },
  };
  const firstEl = document.getElementById("dropdown-1");
  const secondEl = document.getElementById("dropdown-2");
  const first = registry.create("dropdown-menu", firstEl, hookContext);
  const second = registry.create("dropdown-menu", secondEl, hookContext);
  const firstTrigger = firstEl.querySelector('[data-part="trigger"]');
  const secondTrigger = secondEl.querySelector('[data-part="trigger"]');
  const firstPositioner = firstEl.querySelector('[data-part="positioner"]');
  const secondPositioner = secondEl.querySelector('[data-part="positioner"]');

  [firstEl, secondEl].forEach((el) => {
    setRect(el.querySelector('[data-part="trigger"]'), {
      top: 10,
      left: 10,
      bottom: 30,
      right: 110,
      width: 100,
      height: 20,
    });
    setRect(el.querySelector('[data-part="positioner"]'), {
      width: 160,
      height: 80,
    });
  });

  click(firstTrigger);
  assert.equal(firstPositioner.hidden, false);

  click(secondTrigger);
  assert.equal(firstPositioner.hidden, true);
  assert.equal(secondPositioner.hidden, false);
  assert.notEqual(document.activeElement, firstTrigger);
  assert.equal(secondEl.contains(document.activeElement), true);

  first.destroy();
  second.destroy();
});

test("initial open state activates positioning and ARIA controls", () => {
  const { component, content, positioner, pushed, trigger } = buildDropdown({
    state: "open",
  });

  assert.equal(positioner.hidden, false);
  assert.equal(component.positionedElement.active, true);
  assert.equal(content.id, "dropdown-1-content");
  assert.equal(trigger.getAttribute("aria-controls"), content.id);
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(pushed.length, 0);

  component.destroy();
});

test("Enter on focused item selects without reopening and focusing first item", () => {
  const { component, positioner, profile, pushed, settings, trigger } =
    buildDropdown();

  click(trigger);
  assert.equal(document.activeElement, profile);

  keydown(profile, "ArrowDown");
  assert.equal(document.activeElement, settings);

  keydown(settings, "Enter");
  assert.equal(component.state, "closed");
  assert.equal(positioner.hidden, true);
  assert.equal(document.activeElement, trigger);
  assert.deepEqual(
    pushed.map(({ event }) => event),
    ["opened", "selected", "closed"],
  );

  component.destroy();
});

test("arrow keys navigate and prevent page scroll when open trigger keeps focus", () => {
  const { component, positioner, profile, settings, trigger } = buildDropdown();

  click(trigger);
  trigger.focus();

  const event = keydown(trigger, "ArrowDown");

  assert.equal(positioner.hidden, false);
  assert.equal(event.defaultPrevented, true);
  assert.equal(document.activeElement, settings);
  assert.notEqual(document.activeElement, profile);

  component.destroy();
});

test("checkbox item starts checked and exposes menuitemcheckbox ARIA", () => {
  const { checkbox, component, pushed, trigger } = buildDropdown();

  click(trigger);
  assert.equal(checkbox.getAttribute("role"), "menuitemcheckbox");
  assert.equal(checkbox.getAttribute("aria-checked"), "true");

  click(checkbox);
  assert.equal(checkbox.getAttribute("data-state"), "unchecked");
  assert.equal(checkbox.getAttribute("aria-checked"), "false");
  assert.equal(pushed.at(-1).event, "checked");
  assert.deepEqual(pushed.at(-1).payload, {
    value: "bold",
    checked: false,
    componentId: "dropdown-1",
    component: "dropdown-menu",
  });
  // Toggling a checkbox item keeps the menu open (regression).
  assert.equal(component.state, "open");

  component.destroy();
});
