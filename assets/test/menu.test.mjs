import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import Menu from "../salad_ui/components/menu.js";
import { installDom, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());
afterEach(() => {
  document.body.innerHTML = "";
});

function buildMenu() {
  document.body.innerHTML = `
    <div id="menu-root" data-component="dropdown-menu">
      <div id="menu-content" data-part="content">
        <div data-part="item" data-value="profile" data-disabled="false" tabindex="0"
             data-event-mappings='{"item-selected":"selected"}'>Profile</div>
        <div data-part="item" data-value="disabled" data-disabled tabindex="-1"
             data-event-mappings='{"item-selected":"selected"}'>Disabled</div>
        <div data-part="item" data-value="settings" tabindex="0"
             data-event-mappings='{"item-selected":"selected"}'>Settings</div>
        <a href="#profile" data-part="item" data-value="profile-link" tabindex="0"
             data-event-mappings='{"item-selected":"selected"}'>Profile Link</a>
        <div data-part="checkbox-item" data-value="bold" data-checked="true" tabindex="0"
             data-event-mappings='{"item-selected":"selected","checked-changed":"checked"}'>
          <span data-part="item-indicator">✓</span>
          Bold
        </div>
      </div>
    </div>
  `;

  const rootEl = document.getElementById("menu-root");
  const content = document.getElementById("menu-content");
  const pushed = [];
  const selected = [];
  const hookContext = {
    pushEventTo: (target, event, payload) =>
      pushed.push({ target, event, payload }),
    liveSocket: { execJS: () => {} },
  };

  const menu = new Menu(content, {
    hookContext,
    rootEl,
    onItemSelect: (item) => selected.push(item.value),
  });

  return {
    menu,
    rootEl,
    content,
    pushed,
    selected,
    profile: content.querySelector('[data-value="profile"]'),
    disabled: content.querySelector('[data-value="disabled"]'),
    settings: content.querySelector('[data-value="settings"]'),
    link: content.querySelector('[data-value="profile-link"]'),
    checkbox: content.querySelector('[data-value="bold"]'),
  };
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

test("activate focuses first enabled item and arrow navigation skips disabled", () => {
  const { menu, profile, settings } = buildMenu();

  menu.activate();
  assert.equal(document.activeElement, profile);

  keydown(profile, "ArrowDown");
  assert.equal(document.activeElement, settings);

  keydown(settings, "ArrowUp");
  assert.equal(document.activeElement, profile);

  menu.destroy();
});

test("Enter on regular item selects and stops key event propagation", () => {
  const { content, menu, pushed, selected, settings } = buildMenu();
  let bubbled = false;
  content.addEventListener("keydown", () => {
    bubbled = true;
  });

  const event = keydown(settings, "Enter");

  assert.equal(event.defaultPrevented, true);
  assert.equal(bubbled, false);
  assert.deepEqual(selected, ["settings"]);
  assert.equal(pushed.length, 1);
  assert.equal(pushed[0].event, "selected");
  assert.deepEqual(pushed[0].payload, {
    value: "settings",
    componentId: "menu-root",
    component: "dropdown-menu",
  });

  menu.destroy();
});

test("checkbox item exposes ARIA, toggles on Enter, and stops propagation", () => {
  const { checkbox, content, menu, pushed, selected } = buildMenu();
  let bubbled = false;
  content.addEventListener("keydown", () => {
    bubbled = true;
  });

  assert.equal(checkbox.getAttribute("role"), "menuitemcheckbox");
  assert.equal(checkbox.getAttribute("aria-checked"), "true");

  const event = keydown(checkbox, "Enter");

  assert.equal(event.defaultPrevented, true);
  assert.equal(bubbled, false);
  assert.equal(checkbox.getAttribute("data-state"), "unchecked");
  assert.equal(checkbox.getAttribute("aria-checked"), "false");
  // Toggling a checkbox item does not call parent.selectItem() (which would
  // close the menu) — only the regular-item test exercises that path.
  assert.deepEqual(selected, []);
  assert.deepEqual(
    pushed.map(({ event: eventName }) => eventName),
    ["selected", "checked"],
  );
  assert.deepEqual(pushed.at(-1).payload, {
    value: "bold",
    checked: false,
    componentId: "menu-root",
    component: "dropdown-menu",
  });

  menu.destroy();
});

test("click on link item preserves native link behavior", () => {
  const { content, link, menu, pushed, selected } = buildMenu();
  let bubbled = false;
  content.addEventListener("click", () => {
    bubbled = true;
  });

  const event = new window.MouseEvent("click", {
    bubbles: true,
    cancelable: true,
  });
  link.dispatchEvent(event);

  assert.equal(event.defaultPrevented, false);
  assert.equal(bubbled, true);
  assert.deepEqual(selected, ["profile-link"]);
  assert.equal(pushed[0].event, "selected");

  menu.destroy();
});
