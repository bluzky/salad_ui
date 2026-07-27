import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import {
  addOrRemoveClasses,
  animateTransition,
  queryDOM,
} from "../salad_ui/core/utils.js";
import { installDom, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

function buildTree() {
  document.body.innerHTML = `
    <div id="root">
      <div id="a" data-filter="select"></div>
      <div id="b" data-filter="ignore">
        <div id="b1" data-filter="select"></div>
      </div>
      <div id="c" data-filter="skip">
        <div id="c1" data-filter="select"></div>
      </div>
    </div>
  `;
  return document.getElementById("root");
}

function filterByDataAttribute(node) {
  const kind = node.getAttribute("data-filter");
  if (kind === "select") return 1;
  if (kind === "skip") return -1;
  return 0;
}

test("queryDOM selects matching nodes, keeps traversing ignored branches, and skips filtered-out branches entirely", () => {
  const root = buildTree();

  const result = queryDOM(root, filterByDataAttribute);

  assert.deepEqual(
    result.map((el) => el.id),
    ["a", "b1"],
  );
});

test("queryDOM breadth-first vs depth-first traversal order differ", () => {
  const breadthFirst = queryDOM(buildTree(), filterByDataAttribute, {
    breadthFirst: true,
  }).map((el) => el.id);

  const depthFirst = queryDOM(buildTree(), filterByDataAttribute, {
    breadthFirst: false,
  }).map((el) => el.id);

  assert.deepEqual(breadthFirst, ["a", "b1"]);
  assert.deepEqual(depthFirst, ["b1", "a"]);
});

test("queryDOM throws for a non-Node root or non-function filter", () => {
  const root = buildTree();

  assert.throws(() => queryDOM({}, filterByDataAttribute), TypeError);
  assert.throws(() => queryDOM(root, "not-a-function"), TypeError);
});

test("addOrRemoveClasses adds and removes classes, ignoring falsy entries", () => {
  const el = document.createElement("div");
  el.classList.add("keep");

  addOrRemoveClasses(el, ["a", "", null], ["keep"]);

  assert.equal(el.classList.contains("a"), true);
  assert.equal(el.classList.contains("keep"), false);
});

test("addOrRemoveClasses is a no-op when the target element is missing", () => {
  assert.doesNotThrow(() => addOrRemoveClasses(null, ["a"], ["b"]));
});

test("animateTransition resolves immediately without an animConfig or targetElement", async () => {
  await assert.doesNotReject(
    animateTransition(null, document.createElement("div")),
  );
  await assert.doesNotReject(animateTransition({ animation: [] }, null));
});

test("animateTransition applies the start class synchronously and clears all transition classes once complete", async () => {
  const el = document.createElement("div");
  // animation classes are ordered [run, start, end], mirroring executeAnimation's
  // `let [transitionRun, transitionStart, transitionEnd] = animation` destructuring.
  const animConfig = {
    animation: ["run-class", "start-class", "end-class"],
    duration: 5,
  };

  const promise = animateTransition(animConfig, el);

  assert.equal(el.classList.contains("start-class"), true);

  await promise;

  assert.equal(el.classList.contains("start-class"), false);
  assert.equal(el.classList.contains("run-class"), false);
  assert.equal(el.classList.contains("end-class"), false);
});
