import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import ScrollManager from "../salad_ui/core/scroll-manager.js";
import { installDom, uninstallDom, wait } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

let scrollable;
let ref;

beforeEach(() => {
  document.body.innerHTML = `
    <div id="scrollable" style="overflow-y: auto;">
      <div id="ref"></div>
    </div>
  `;
  scrollable = document.getElementById("scrollable");
  ref = document.getElementById("ref");
});

test("start() reacts to scroll events on scrollable ancestors, throttled via rAF", async () => {
  let calls = 0;
  const manager = new ScrollManager(() => calls++);
  manager.start(ref);

  scrollable.dispatchEvent(new window.Event("scroll"));
  assert.equal(calls, 0); // rAF-throttled: not synchronous

  await wait(10);
  assert.equal(calls, 1);

  manager.stop();
});

test("rapid scroll events within the same frame collapse into a single update", async () => {
  let calls = 0;
  const manager = new ScrollManager(() => calls++);
  manager.start(ref);

  scrollable.dispatchEvent(new window.Event("scroll"));
  scrollable.dispatchEvent(new window.Event("scroll"));
  scrollable.dispatchEvent(new window.Event("scroll"));
  await wait(10);

  assert.equal(calls, 1);

  manager.stop();
});

test("start() reacts to window resize events", async () => {
  let calls = 0;
  const manager = new ScrollManager(() => calls++);
  manager.start(null);

  window.dispatchEvent(new window.Event("resize"));
  await wait(10);

  assert.equal(calls, 1);

  manager.stop();
});

test("useRAF: false updates synchronously without throttling", () => {
  let calls = 0;
  const manager = new ScrollManager(() => calls++, { useRAF: false });
  manager.start(ref);

  scrollable.dispatchEvent(new window.Event("scroll"));

  assert.equal(calls, 1);

  manager.stop();
});

test("start() is idempotent: calling it again while active does not re-register listeners", async () => {
  let calls = 0;
  const manager = new ScrollManager(() => calls++);
  manager.start(ref);
  manager.start(ref);

  scrollable.dispatchEvent(new window.Event("scroll"));
  await wait(10);

  assert.equal(calls, 1);

  manager.stop();
});

test("stop() removes listeners so further scroll/resize events are ignored", async () => {
  let calls = 0;
  const manager = new ScrollManager(() => calls++);
  manager.start(ref);
  manager.stop();

  scrollable.dispatchEvent(new window.Event("scroll"));
  window.dispatchEvent(new window.Event("resize"));
  await wait(10);

  assert.equal(calls, 0);
});

test("start() observes the target and reference elements via ResizeObserver, stop() disconnects it", () => {
  class SpyResizeObserver {
    constructor(callback) {
      this.callback = callback;
      this.observed = [];
      this.disconnected = false;
    }
    observe(el) {
      this.observed.push(el);
    }
    unobserve(el) {
      this.observed = this.observed.filter((observed) => observed !== el);
    }
    disconnect() {
      this.disconnected = true;
    }
  }

  const originalResizeObserver = globalThis.ResizeObserver;
  globalThis.ResizeObserver = SpyResizeObserver;

  try {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const manager = new ScrollManager(() => {});
    manager.start(ref, target);

    assert.ok(manager.resizeObserver instanceof SpyResizeObserver);
    assert.deepEqual(manager.resizeObserver.observed, [target, ref]);

    manager.stop();

    assert.equal(manager.resizeObserver, null);
  } finally {
    globalThis.ResizeObserver = originalResizeObserver;
  }
});
