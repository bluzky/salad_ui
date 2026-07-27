import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import Portal from "../salad_ui/core/portal.js";
import { installDom, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

beforeEach(() => {
  document.body.innerHTML = `
    <div id="container">
      <div id="portal-el" style="position: static; z-index: 1;"></div>
    </div>
  `;
});

test("move() relocates the element into the container and applies portal styles", () => {
  const container = document.getElementById("container");
  const el = document.getElementById("portal-el");

  const result = Portal.move(el);

  assert.equal(result, true);
  assert.equal(el.parentElement, document.body);
  assert.equal(el.style.position, "absolute");
  assert.equal(el.style.zIndex, "9999");
  assert.equal(Portal.isInPortal(el), true);
  assert.equal(container.children.length, 0);
});

test("move() accepts a custom container", () => {
  const customContainer = document.createElement("div");
  document.body.appendChild(customContainer);
  const el = document.getElementById("portal-el");

  Portal.move(el, customContainer);

  assert.equal(el.parentElement, customContainer);
});

test("move() returns false for a missing element", () => {
  assert.equal(Portal.move(null), false);
});

test("restore() moves the element back and restores its original styles", () => {
  const container = document.getElementById("container");
  const el = document.getElementById("portal-el");

  Portal.move(el);
  const result = Portal.restore(el);

  assert.equal(result, true);
  assert.equal(el.parentElement, container);
  assert.equal(el.style.position, "static");
  assert.equal(el.style.zIndex, "1");
  assert.equal(Portal.isInPortal(el), false);
});

test("restore() returns false for an element that was never moved", () => {
  const el = document.getElementById("portal-el");
  assert.equal(Portal.restore(el), false);
});

test("isInPortal() is false for an element that was never moved", () => {
  const el = document.getElementById("portal-el");
  assert.equal(Portal.isInPortal(el), false);
  assert.equal(Portal.isInPortal(null), false);
});

test("setupScrollPassthrough() makes the element itself click-through but keeps scrollable descendants interactive", () => {
  const el = document.getElementById("portal-el");
  el.innerHTML = `<div id="scrollable" style="overflow-y: auto;"><div id="static-child"></div></div>`;
  const scrollable = document.getElementById("scrollable");
  Object.defineProperty(scrollable, "scrollHeight", { value: 500 });
  Object.defineProperty(scrollable, "clientHeight", { value: 100 });

  Portal.move(el);
  Portal.setupScrollPassthrough(el);

  assert.equal(el.style.pointerEvents, "none");
  assert.equal(scrollable.style.pointerEvents, "auto");
});

test("cleanupScrollPassthrough() restores the pointer-events value captured before setup", () => {
  const el = document.getElementById("portal-el");
  el.style.pointerEvents = "all";

  Portal.move(el);
  Portal.setupScrollPassthrough(el);
  assert.equal(el.style.pointerEvents, "none");

  Portal.cleanupScrollPassthrough(el);

  assert.equal(el.style.pointerEvents, "all");
});

test("updateScrollableContainer() stops descending once it finds a scrollable ancestor", () => {
  document.getElementById("portal-el").innerHTML = `
    <div id="outer-scrollable" style="overflow-y: auto;">
      <div id="inner" style="overflow-y: auto;"></div>
    </div>
  `;
  const outer = document.getElementById("outer-scrollable");
  const inner = document.getElementById("inner");
  Object.defineProperty(outer, "scrollHeight", { value: 500 });
  Object.defineProperty(outer, "clientHeight", { value: 100 });
  Object.defineProperty(inner, "scrollHeight", { value: 500 });
  Object.defineProperty(inner, "clientHeight", { value: 100 });

  Portal.updateScrollableContainer(
    document.getElementById("portal-el"),
    "auto",
  );

  assert.equal(outer.style.pointerEvents, "auto");
  assert.equal(inner.style.pointerEvents, ""); // traversal stopped at outer
});
