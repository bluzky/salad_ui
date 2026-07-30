import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import "../salad_ui/components/hover-card.js";
import { registry } from "../salad_ui/core/factory.js";
import { installDom, setRect, uninstallDom, wait } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());
afterEach(() => {
  document.body.innerHTML = "";
});

function buildHoverCard({ openDelay = 1, closeDelay = 5 } = {}) {
  const options = JSON.stringify({ openDelay, closeDelay });

  document.body.innerHTML = `
    <div id="hover-card-1" data-component="hover-card" data-state="closed"
         data-options='${options}'
         data-event-mappings='{"open":"opened","close":"closed"}'
         data-part="root">
      <div data-part="trigger"><button type="button">Profile</button></div>
      <div data-part="content" data-side="bottom" data-align="center"
           data-side-offset="12" data-align-offset="0" hidden>
        <div data-side="bottom" data-part="content-wrapper">Profile details</div>
      </div>
    </div>
  `;

  const el = document.getElementById("hover-card-1");
  const trigger = el.querySelector('[data-part="trigger"]');
  const button = trigger.querySelector("button");
  const content = el.querySelector('[data-part="content"]');
  const wrapper = el.querySelector('[data-part="content-wrapper"]');

  setRect(trigger, {
    top: 100,
    right: 150,
    bottom: 120,
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

  return { el, trigger, button, content, wrapper, pushed, hookContext };
}

function mouseEvent(type, target) {
  target.dispatchEvent(
    new window.MouseEvent(type, { bubbles: false, cancelable: true }),
  );
}

function focusEvent(type, target) {
  target.dispatchEvent(new window.Event(type, { bubbles: true }));
}

test("construction applies closed state visibility and ARIA attributes", () => {
  const { el, trigger, content, wrapper, hookContext } = buildHoverCard();
  const component = registry.create("hover-card", el, hookContext);

  assert.equal(component.state, "closed");
  assert.equal(content.hidden, true);
  assert.equal(trigger.getAttribute("aria-haspopup"), "dialog");
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(content.getAttribute("role"), "dialog");
  assert.equal(wrapper.dataset.side, "bottom");

  component.destroy();
});

test("focusin from trigger child opens after delay and positions content", async () => {
  const { el, button, content, pushed, hookContext } = buildHoverCard();
  const component = registry.create("hover-card", el, hookContext);

  focusEvent("focusin", button);
  await wait(10);

  assert.equal(component.state, "open");
  assert.equal(content.hidden, false);
  assert.equal(content.style.position, "fixed");
  assert.equal(content.style.top, "132px");
  assert.equal(content.style.left, "60px");
  assert.equal(content.dataset.placement, "bottom");
  assert.equal(component.positionedElement.active, true);
  assert.deepEqual(pushed, [
    {
      target: el,
      event: "opened",
      payload: {
        componentId: "hover-card-1",
        component: "hover-card",
      },
    },
  ]);

  component.destroy();
});

test("content hover cancels pending close, then mouseleave closes", async () => {
  const { el, trigger, content, pushed, hookContext } = buildHoverCard();
  const component = registry.create("hover-card", el, hookContext);

  mouseEvent("mouseenter", trigger);
  await wait(10);
  assert.equal(component.state, "open");

  mouseEvent("mouseleave", trigger);
  mouseEvent("mouseenter", content);
  await wait(10);

  assert.equal(component.state, "open");
  assert.equal(content.hidden, false);

  mouseEvent("mouseleave", content);
  await wait(10);

  assert.equal(component.state, "closed");
  assert.equal(content.hidden, true);
  assert.equal(component.positionedElement.active, false);
  assert.equal(pushed.at(-1).event, "closed");
  assert.deepEqual(pushed.at(-1).payload, {
    componentId: "hover-card-1",
    component: "hover-card",
  });
  assert.equal(pushed.at(-1).target, el);

  component.destroy();
});
