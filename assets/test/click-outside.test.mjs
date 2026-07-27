import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import ClickOutsideMonitor from "../salad_ui/core/click-outside.js";
import { installDom, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

let inside;
let outside;

beforeEach(() => {
  document.body.innerHTML = `
    <div id="inside"><button id="inside-btn"></button></div>
    <div id="outside"></div>
  `;
  inside = document.getElementById("inside");
  outside = document.getElementById("outside");
});

function click(el) {
  el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
}

test("calls the callback when a click lands outside every monitored element", () => {
  const calls = [];
  const monitor = new ClickOutsideMonitor(inside, (event) => calls.push(event));
  monitor.start();

  click(outside);

  assert.equal(calls.length, 1);
});

test("does not call the callback for clicks inside a monitored element or its descendants", () => {
  const calls = [];
  const monitor = new ClickOutsideMonitor(inside, () => calls.push(true));
  monitor.start();

  click(document.getElementById("inside-btn"));
  click(inside);

  assert.equal(calls.length, 0);
});

test("accepts an array of elements to monitor", () => {
  const calls = [];
  const monitor = new ClickOutsideMonitor([inside, outside], () =>
    calls.push(true),
  );
  monitor.start();

  click(outside);
  click(inside);

  assert.equal(calls.length, 0);
});

test("stop() prevents further callbacks and start()/stop() are idempotent", () => {
  const calls = [];
  const monitor = new ClickOutsideMonitor(inside, () => calls.push(true));

  monitor.start();
  monitor.start(); // idempotent: should not double-register the listener
  click(outside);
  assert.equal(calls.length, 1);

  monitor.stop();
  monitor.stop(); // idempotent
  click(outside);
  assert.equal(calls.length, 1);
});

test("a filter function can suppress the callback", () => {
  const calls = [];
  const monitor = new ClickOutsideMonitor(inside, () => calls.push(true), {
    filter: () => false,
  });
  monitor.start();

  click(outside);

  assert.equal(calls.length, 0);
});

test("updateElements() changes which elements count as inside", () => {
  const calls = [];
  const monitor = new ClickOutsideMonitor(inside, () => calls.push(true));
  monitor.start();

  monitor.updateElements(outside);
  click(inside);

  assert.equal(calls.length, 1);
});

test("destroy() stops monitoring and clears references", () => {
  const calls = [];
  const monitor = new ClickOutsideMonitor(inside, () => calls.push(true));
  monitor.start();

  monitor.destroy();
  click(outside);

  assert.equal(calls.length, 0);
  assert.equal(monitor.elements, null);
  assert.equal(monitor.callback, null);
});
