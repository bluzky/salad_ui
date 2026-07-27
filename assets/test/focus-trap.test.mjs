import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import FocusTrap from "../salad_ui/core/focus-trap.js";
import { installDom, uninstallDom, wait } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

// FocusTrap schedules its initial focus 50ms after activate(); waiting this
// long avoids leaving a pending timer that fires after a test (and its trap)
// has already been torn down.
const INITIAL_FOCUS_DELAY = 60;

// destroy() nulls out `previouslyFocused` synchronously, racing the restore-focus
// timer that a still-active trap's own deactivate() schedules. Deactivating (and
// waiting for that timer to run) before destroying avoids tripping that race.
async function teardown(trap) {
  trap.deactivate();
  await wait(10);
  trap.destroy();
}

test("activate() focuses the first focusable element by default", async () => {
  document.body.innerHTML = `
    <div id="trap">
      <button id="first">first</button>
      <button id="middle">middle</button>
      <button id="last">last</button>
    </div>
  `;
  const trap = new FocusTrap(document.getElementById("trap"));

  trap.activate();
  await wait(INITIAL_FOCUS_DELAY);

  assert.equal(document.activeElement.id, "first");

  await teardown(trap);
});

test("activate() prefers an element with the autofocus attribute", async () => {
  document.body.innerHTML = `
    <div id="trap">
      <button id="a">a</button>
      <button id="b" autofocus>b</button>
    </div>
  `;
  const trap = new FocusTrap(document.getElementById("trap"));

  trap.activate();
  await wait(INITIAL_FOCUS_DELAY);

  assert.equal(document.activeElement.id, "b");

  await teardown(trap);
});

test("activate() makes the trap element itself focusable when it has no focusable children", async () => {
  document.body.innerHTML = `<div id="trap"><span>no controls here</span></div>`;
  const trapEl = document.getElementById("trap");
  const trap = new FocusTrap(trapEl);

  trap.activate();
  await wait(INITIAL_FOCUS_DELAY);

  assert.equal(trapEl.getAttribute("tabindex"), "-1");
  assert.equal(document.activeElement, trapEl);

  await teardown(trap);
});

test("Tab wraps from the last element to the first, and Shift+Tab wraps from the first to the last", async () => {
  document.body.innerHTML = `
    <div id="trap">
      <button id="first">first</button>
      <button id="middle">middle</button>
      <button id="last">last</button>
    </div>
  `;
  const trapEl = document.getElementById("trap");
  const trap = new FocusTrap(trapEl);

  trap.activate();
  await wait(INITIAL_FOCUS_DELAY);

  const first = document.getElementById("first");
  const last = document.getElementById("last");

  last.focus();
  const tabEvent = new window.KeyboardEvent("keydown", {
    key: "Tab",
    bubbles: true,
    cancelable: true,
  });
  trapEl.dispatchEvent(tabEvent);

  assert.equal(document.activeElement.id, "first");
  assert.equal(tabEvent.defaultPrevented, true);

  first.focus();
  const shiftTabEvent = new window.KeyboardEvent("keydown", {
    key: "Tab",
    shiftKey: true,
    bubbles: true,
    cancelable: true,
  });
  trapEl.dispatchEvent(shiftTabEvent);

  assert.equal(document.activeElement.id, "last");

  await teardown(trap);
});

test("Tab in the middle of the trap does not get hijacked", async () => {
  document.body.innerHTML = `
    <div id="trap">
      <button id="first">first</button>
      <button id="middle">middle</button>
      <button id="last">last</button>
    </div>
  `;
  const trapEl = document.getElementById("trap");
  const trap = new FocusTrap(trapEl);

  trap.activate();
  await wait(INITIAL_FOCUS_DELAY);

  document.getElementById("middle").focus();
  const tabEvent = new window.KeyboardEvent("keydown", {
    key: "Tab",
    bubbles: true,
    cancelable: true,
  });
  trapEl.dispatchEvent(tabEvent);

  assert.equal(tabEvent.defaultPrevented, false);

  await teardown(trap);
});

test("deactivate() restores focus to the element that was focused before activate()", async () => {
  document.body.innerHTML = `
    <button id="outside-trigger">outside</button>
    <div id="trap"><button id="first">first</button></div>
  `;
  document.getElementById("outside-trigger").focus();
  assert.equal(document.activeElement.id, "outside-trigger");

  const trap = new FocusTrap(document.getElementById("trap"));
  trap.activate();
  await wait(INITIAL_FOCUS_DELAY);
  assert.equal(document.activeElement.id, "first");

  trap.deactivate();
  await wait(10);

  assert.equal(document.activeElement.id, "outside-trigger");
});

test("activate()/deactivate() are no-ops when called while already in that state", async () => {
  document.body.innerHTML = `<div id="trap"><button id="first">first</button></div>`;
  const trap = new FocusTrap(document.getElementById("trap"));

  trap.deactivate(); // not active yet: no-op, must not throw
  assert.equal(trap.active, false);

  trap.activate();
  trap.activate(); // already active: no-op
  await wait(INITIAL_FOCUS_DELAY);
  assert.equal(trap.active, true);

  await teardown(trap);
});

test("destroy() deactivates the trap and clears its references", async () => {
  document.body.innerHTML = `<div id="trap"><button id="first">first</button></div>`;
  const trap = new FocusTrap(document.getElementById("trap"));

  trap.activate();
  await wait(INITIAL_FOCUS_DELAY);

  await teardown(trap);

  assert.equal(trap.element, null);
  assert.equal(trap.active, false);
});
