import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import SliderComponent from "../salad_ui/components/slider.js";
import { installDom, setRect, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

function buildSlider({
  value = 20,
  min = 10,
  max = 50,
  step = 5,
  disabled = false,
} = {}) {
  document.body.innerHTML = `
    <div
      id="slider"
      data-component="slider"
      data-state="idle"
      data-value="${value}"
      data-options='${JSON.stringify({ min, max, step, disabled })}'
      data-event-mappings='{"value-changed":"slider_changed"}'
      data-part="root"
      tabindex="${disabled ? "-1" : "0"}"
    >
      <div class="relative flex w-full touch-none select-none items-center">
        <div data-part="track">
          <div data-part="range"></div>
        </div>
        <div data-part="thumb"></div>
      </div>
      <input type="hidden" name="scale" value="${value}" />
    </div>
  `;

  const el = document.getElementById("slider");
  const track = el.querySelector('[data-part="track"]');
  const thumb = el.querySelector('[data-part="thumb"]');
  setRect(track, { left: 0, width: 100 });
  setRect(thumb, { width: 20 });

  const pushed = [];
  const hookContext = {
    pushEventTo(_el, event, payload) {
      pushed.push({ event, payload });
    },
  };

  const slider = new SliderComponent(el, hookContext);
  slider.setupEvents();

  return { el, slider, pushed };
}

test("initial ARIA applies only to slider root", () => {
  const { el } = buildSlider();
  const innerWrapper = el.firstElementChild;

  assert.equal(el.getAttribute("role"), "slider");
  assert.equal(el.getAttribute("aria-valuemin"), "10");
  assert.equal(el.getAttribute("aria-valuemax"), "50");
  assert.equal(el.getAttribute("aria-valuenow"), "20");
  assert.equal(innerWrapper.hasAttribute("role"), false);
});

test("pointer updates use min-relative step snapping and sync hidden input", () => {
  const { el, slider, pushed } = buildSlider({
    min: 10,
    max: 50,
    step: 7,
    value: 10,
  });

  slider.updateValueFromPointer(
    new window.MouseEvent("mousemove", { clientX: 50 }),
  );

  assert.equal(slider.value, 31);
  assert.equal(el.querySelector('input[type="hidden"]').value, "31");
  assert.equal(el.getAttribute("aria-valuenow"), "31");
  assert.equal(pushed.length, 0);
});

test("keyboard changes sync input, prevent default, and push value", () => {
  const { el, pushed } = buildSlider({ value: 20, step: 5 });
  const event = new window.KeyboardEvent("keydown", {
    key: "ArrowRight",
    bubbles: true,
    cancelable: true,
  });

  el.dispatchEvent(event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(el.querySelector('input[type="hidden"]').value, "25");
  assert.equal(pushed[0].event, "slider_changed");
  assert.equal(pushed[0].payload.value, 25);
});

test("Home and End preserve exact boundaries when step does not divide range", () => {
  const { el, pushed } = buildSlider({ min: 0, max: 10, step: 3, value: 6 });
  const endEvent = new window.KeyboardEvent("keydown", {
    key: "End",
    bubbles: true,
    cancelable: true,
  });
  const homeEvent = new window.KeyboardEvent("keydown", {
    key: "Home",
    bubbles: true,
    cancelable: true,
  });

  el.dispatchEvent(endEvent);

  assert.equal(endEvent.defaultPrevented, true);
  assert.equal(el.querySelector('input[type="hidden"]').value, "10");
  assert.equal(el.getAttribute("aria-valuenow"), "10");
  assert.equal(pushed.at(-1).payload.value, 10);

  el.dispatchEvent(homeEvent);

  assert.equal(homeEvent.defaultPrevented, true);
  assert.equal(el.querySelector('input[type="hidden"]').value, "0");
  assert.equal(el.getAttribute("aria-valuenow"), "0");
  assert.equal(pushed.at(-1).payload.value, 0);
});

test("disabled slider ignores keyboard and stays non-focusable", () => {
  const { el, pushed } = buildSlider({ disabled: true, value: 20 });
  const event = new window.KeyboardEvent("keydown", {
    key: "ArrowRight",
    bubbles: true,
    cancelable: true,
  });

  el.dispatchEvent(event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(el.getAttribute("tabindex"), "-1");
  assert.equal(el.querySelector('input[type="hidden"]').value, "20");
  assert.equal(pushed.length, 0);
});
