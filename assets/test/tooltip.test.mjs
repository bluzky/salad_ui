import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import "../salad_ui/components/tooltip.js";
import { registry } from "../salad_ui/core/factory.js";
import { installDom, setRect, uninstallDom, wait } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());
afterEach(() => {
  document.body.innerHTML = "";
});

function buildTooltip({
  openDelay = 1,
  closeDelay = 5,
  fallback = false,
} = {}) {
  const options = JSON.stringify({ openDelay, closeDelay });
  const triggerMarkup = fallback
    ? '<button type="button">Help</button>'
    : '<div data-part="trigger"><button type="button">Help</button></div>';

  document.body.innerHTML = `
    <div id="tooltip-1" data-component="tooltip" data-state="closed"
         data-options='${options}'
         data-event-mappings='{"open":"opened","close":"closed"}'
         data-part="root">
      ${triggerMarkup}
      <div data-part="content" data-side="top" data-align="center"
           data-side-offset="12" data-align-offset="0" hidden>
        Tooltip details
      </div>
    </div>
  `;

  const el = document.getElementById("tooltip-1");
  const trigger = fallback
    ? el.querySelector("button")
    : el.querySelector('[data-part="trigger"]');
  const button = trigger.matches("button")
    ? trigger
    : trigger.querySelector("button");
  const content = el.querySelector('[data-part="content"]');

  setRect(trigger, {
    top: 10,
    right: 150,
    bottom: 30,
    left: 50,
    width: 100,
    height: 20,
  });
  setRect(content, { width: 80, height: 40 });

  const pushed = [];
  const hookContext = {
    pushEventTo: (target, event, payload) =>
      pushed.push({ target, event, payload }),
    liveSocket: { execJS: () => {} },
  };

  return { el, trigger, button, content, pushed, hookContext };
}

function mouseEvent(type, target, relatedTarget = null) {
  target.dispatchEvent(
    new window.MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      relatedTarget,
    }),
  );
}

function focusEvent(type, target) {
  target.dispatchEvent(new window.Event(type, { bubbles: true }));
}

test("construction applies closed state visibility and ARIA attributes", () => {
  const { el, trigger, content, hookContext } = buildTooltip();
  const component = registry.create("tooltip", el, hookContext);

  assert.equal(component.state, "closed");
  assert.equal(content.hidden, true);
  assert.equal(content.getAttribute("role"), "tooltip");
  assert.equal(trigger.getAttribute("aria-describedby"), "tooltip-1-content");
  assert.equal(content.id, "tooltip-1-content");

  component.destroy();
});

test("focusin from trigger child opens, positions, flips side, and pushes open", async () => {
  const { el, button, content, pushed, hookContext } = buildTooltip();
  const component = registry.create("tooltip", el, hookContext);

  focusEvent("focusin", button);
  await wait(10);

  assert.equal(component.state, "open");
  assert.equal(content.hidden, false);
  assert.equal(content.style.position, "fixed");
  assert.equal(content.style.top, "42px");
  assert.equal(content.style.left, "60px");
  assert.equal(content.dataset.placement, "bottom");
  assert.equal(content.dataset.side, "bottom");
  assert.deepEqual(pushed, [
    {
      target: el,
      event: "opened",
      payload: {
        componentId: "tooltip-1",
        component: "tooltip",
      },
    },
  ]);

  component.destroy();
});

test("fallback first child trigger receives events and ARIA", async () => {
  const { button, content, hookContext } = buildTooltip({ fallback: true });
  const component = registry.create(
    "tooltip",
    document.getElementById("tooltip-1"),
    hookContext,
  );

  assert.equal(button.dataset.part, "trigger");
  assert.equal(button.getAttribute("aria-describedby"), "tooltip-1-content");

  mouseEvent("mouseover", button);
  await wait(10);

  assert.equal(component.state, "open");
  assert.equal(content.hidden, false);

  component.destroy();
});

test("mouseout within trigger does not start close", async () => {
  const { trigger, button, content, hookContext } = buildTooltip();
  const component = registry.create(
    "tooltip",
    document.getElementById("tooltip-1"),
    hookContext,
  );

  mouseEvent("mouseover", button);
  await wait(10);
  assert.equal(component.state, "open");

  mouseEvent("mouseout", button, trigger);
  await wait(10);

  assert.equal(component.state, "open");
  assert.equal(content.hidden, false);

  component.destroy();
});

test("content hover cancels pending close, then mouseleave closes after animation", async () => {
  const { el, trigger, content, pushed, hookContext } = buildTooltip();
  const component = registry.create("tooltip", el, hookContext);

  mouseEvent("mouseover", trigger);
  await wait(10);
  assert.equal(component.state, "open");

  mouseEvent("mouseout", trigger, content);
  mouseEvent("mouseover", content, trigger);
  await wait(10);

  assert.equal(component.state, "open");
  assert.equal(content.hidden, false);

  mouseEvent("mouseout", content);
  await wait(160);

  assert.equal(component.state, "closed");
  assert.equal(content.hidden, true);
  assert.equal(component.positionedElement, null);
  assert.equal(pushed.at(-1).event, "closed");
  assert.deepEqual(pushed.at(-1).payload, {
    componentId: "tooltip-1",
    component: "tooltip",
  });
  assert.equal(pushed.at(-1).target, el);

  component.destroy();
});
