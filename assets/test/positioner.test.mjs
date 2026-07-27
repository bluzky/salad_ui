import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import Positioner from "../salad_ui/core/positioner.js";
import { installDom, setRect, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

let element;
let reference;

beforeEach(() => {
  document.body.innerHTML = "";
  element = document.createElement("div");
  reference = document.createElement("div");
  document.body.append(element, reference);
});

test("calculate(): bottom/center placement sits below and centered on the reference", () => {
  setRect(reference, {
    top: 100,
    bottom: 140,
    left: 200,
    right: 300,
    width: 100,
  });
  setRect(element, { width: 50, height: 20 });

  const position = Positioner.calculate(element, reference, {
    placement: "bottom",
    alignment: "center",
  });

  assert.deepEqual(position, { x: 225, y: 148, placement: "bottom" });
});

test("calculate(): start/end alignment position against the reference edges", () => {
  setRect(reference, {
    top: 100,
    bottom: 140,
    left: 200,
    right: 300,
    width: 100,
  });
  setRect(element, { width: 50, height: 20 });

  const start = Positioner.calculate(element, reference, {
    placement: "bottom",
    alignment: "start",
  });
  const end = Positioner.calculate(element, reference, {
    placement: "bottom",
    alignment: "end",
  });

  assert.equal(start.x, 200);
  assert.equal(end.x, 250);
});

test("calculate(): right/left placement offsets horizontally and centers vertically", () => {
  setRect(reference, {
    top: 100,
    bottom: 140,
    left: 200,
    right: 300,
    height: 40,
  });
  setRect(element, { width: 50, height: 20 });

  const right = Positioner.calculate(element, reference, {
    placement: "right",
    alignment: "center",
  });
  const left = Positioner.calculate(element, reference, {
    placement: "left",
    alignment: "center",
  });

  assert.deepEqual(right, { x: 308, y: 110, placement: "right" });
  assert.deepEqual(left, { x: 142, y: 110, placement: "left" });
});

test("calculate(): flips top to bottom when the element would overflow above the viewport", () => {
  setRect(reference, { top: 5, bottom: 45, left: 200, right: 300, width: 100 });
  setRect(element, { width: 50, height: 20 });

  const position = Positioner.calculate(element, reference, {
    placement: "top",
    alignment: "center",
  });

  assert.equal(position.placement, "bottom");
  assert.equal(position.y, 53);
});

test("calculate(): flip: false keeps the requested placement even when it overflows", () => {
  setRect(reference, { top: 5, bottom: 45, left: 200, right: 300, width: 100 });
  setRect(element, { width: 50, height: 20 });

  const position = Positioner.calculate(element, reference, {
    placement: "top",
    alignment: "center",
    flip: false,
  });

  assert.equal(position.placement, "top");
  assert.equal(position.y, -23);
});

test("applyPosition(): sets fixed positioning at the given coordinates", () => {
  Positioner.applyPosition(element, 12, 34);

  assert.equal(element.style.position, "fixed");
  assert.equal(element.style.top, "34px");
  assert.equal(element.style.left, "12px");
  assert.equal(element.style.margin, "0px"); // jsdom normalizes the "0" shorthand
});

test("findScrollableParents(): collects only overflow-scrollable ancestors, plus window", () => {
  document.body.innerHTML = `
    <div id="scrollable-outer" style="overflow-y: auto;">
      <div id="static-middle">
        <div id="scrollable-inner" style="overflow-x: scroll;">
          <span id="leaf"></span>
        </div>
      </div>
    </div>
  `;
  const leaf = document.getElementById("leaf");

  const parents = Positioner.findScrollableParents(leaf);

  assert.deepEqual(
    parents.slice(0, -1).map((el) => el.id),
    ["scrollable-inner", "scrollable-outer"],
  );
  assert.equal(parents[parents.length - 1], window);
});
