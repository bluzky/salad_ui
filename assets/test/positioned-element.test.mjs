import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import Portal from "../salad_ui/core/portal.js";
import PositionedElement from "../salad_ui/core/positioned-element.js";
import { installDom, setRect, uninstallDom, wait } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

function buildDom() {
  document.body.innerHTML = `
    <div id="container">
      <button id="reference">ref</button>
      <div id="positioned"><button id="focusable">content</button></div>
    </div>
  `;
  const container = document.getElementById("container");
  const reference = document.getElementById("reference");
  const element = document.getElementById("positioned");

  setRect(reference, {
    top: 100,
    bottom: 140,
    left: 200,
    right: 300,
    width: 100,
    height: 40,
  });
  setRect(element, { width: 50, height: 20 });

  return { container, reference, element };
}

function click(el) {
  el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
}

test("activate() positions the element against the reference in place when usePortal is false", () => {
  const { container, reference, element } = buildDom();
  const pe = new PositionedElement(element, reference, {
    placement: "bottom",
    alignment: "center",
  });

  pe.activate();

  assert.equal(element.parentElement, container);
  assert.equal(element.style.position, "fixed");
  assert.equal(element.getAttribute("data-placement"), "bottom");
  assert.equal(
    element.style.getPropertyValue("--salad-reference-width"),
    "100px",
  );
  assert.equal(
    element.style.getPropertyValue("--salad-reference-height"),
    "40px",
  );
  assert.equal(pe.active, true);

  pe.destroy();
});

test("activate()/deactivate() with usePortal moves the element to the portal container and restores it on deactivate (regression)", () => {
  const { container, reference, element } = buildDom();
  const pe = new PositionedElement(element, reference, { usePortal: true });

  pe.activate();
  assert.equal(element.parentElement, document.body);
  assert.equal(Portal.isInPortal(element), true);

  pe.deactivate();

  assert.equal(element.parentElement, container);
  assert.equal(Portal.isInPortal(element), false);
});

test("activate() is idempotent and deactivate() before activate() is a no-op", () => {
  const { reference, element } = buildDom();
  const pe = new PositionedElement(element, reference, {});

  assert.doesNotThrow(() => pe.deactivate());
  assert.equal(pe.active, false);

  pe.activate();
  pe.activate();
  assert.equal(pe.active, true);

  pe.destroy();
});

test("onOutsideClick fires only for clicks outside both the element and its reference", () => {
  const { reference, element } = buildDom();
  const calls = [];
  const pe = new PositionedElement(element, reference, {
    onOutsideClick: () => calls.push(true),
  });

  pe.activate();

  click(document.getElementById("focusable"));
  click(reference);
  assert.equal(calls.length, 0);

  click(document.body);
  assert.equal(calls.length, 1);

  pe.destroy();
});

test("update() recalculates position while active and is a no-op while inactive", () => {
  const { reference, element } = buildDom();
  const pe = new PositionedElement(element, reference, {
    placement: "bottom",
    alignment: "center",
  });

  pe.update(); // inactive: no-op, must not throw
  assert.equal(element.style.position, "");

  pe.activate();
  const initialLeft = element.style.left;

  setRect(reference, {
    top: 100,
    bottom: 140,
    left: 400,
    right: 500,
    width: 100,
    height: 40,
  });
  pe.update();

  assert.notEqual(element.style.left, initialLeft);

  pe.destroy();
});

test("updateReference() repositions against the new reference and updates the click-outside monitor", () => {
  const { element, reference } = buildDom();
  const newReference = document.createElement("button");
  document.body.appendChild(newReference);
  setRect(newReference, {
    top: 300,
    bottom: 340,
    left: 10,
    right: 60,
    width: 50,
    height: 40,
  });

  const calls = [];
  const pe = new PositionedElement(element, reference, {
    onOutsideClick: () => calls.push(true),
  });
  pe.activate();

  pe.updateReference(newReference);

  click(reference); // the old reference no longer exempts a click from "outside"
  assert.equal(calls.length, 1);

  click(newReference); // the new reference does
  assert.equal(calls.length, 1);

  pe.destroy();
});

test("destroy() deactivates, tears down sub-modules, and clears references", () => {
  const { element, reference } = buildDom();
  const pe = new PositionedElement(element, reference, {});
  pe.activate();

  pe.destroy();

  assert.equal(pe.element, null);
  assert.equal(pe.reference, null);
  assert.equal(pe.focusTrap, null);
  assert.equal(pe.scrollManager, null);
});

test("activate() with trapFocus moves focus into the element, deactivate() restores it", async () => {
  const { element, reference } = buildDom();

  const outsideTrigger = document.createElement("button");
  outsideTrigger.id = "outside-trigger";
  document.body.appendChild(outsideTrigger);
  outsideTrigger.focus();

  const pe = new PositionedElement(element, reference, { trapFocus: true });

  pe.activate();
  await wait(60); // FocusTrap's internal initial-focus delay

  assert.equal(document.activeElement.id, "focusable");

  pe.deactivate();
  await wait(10); // FocusTrap's internal restore-focus delay

  assert.equal(document.activeElement.id, "outside-trigger");

  pe.destroy();
});
