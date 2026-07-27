import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import Component from "../salad_ui/core/component.js";
import { installDom, uninstallDom, wait } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

class TestComponent extends Component {
  entered = [];
  exited = [];
  setupEventsCount = 0;
  teardownEventsCount = 0;

  constructor(el, options) {
    super(el, options);
    this.config.preventDefaultKeys = ["Escape"];
  }

  getComponentConfig() {
    return {
      stateMachine: {
        closed: {
          enter: "onEnterClosed",
          exit: () => this.exited.push("closed"),
          transitions: { open: "open" },
        },
        open: {
          enter: () => this.entered.push("open"),
          exit: () => this.exited.push("open"),
          transitions: { close: "closed" },
        },
      },
      events: {
        open: {
          keyMap: { Escape: "close" },
        },
      },
      hiddenConfig: {
        closed: { content: true },
        open: { content: false },
      },
      ariaConfig: {
        trigger: {
          all: {
            expanded: () => (this.state === "open" ? "true" : "false"),
          },
        },
      },
    };
  }

  onEnterClosed() {
    this.entered.push("closed");
  }

  setupComponentEvents() {
    super.setupComponentEvents();
    this.setupEventsCount++;
  }

  teardownComponentEvents() {
    super.teardownComponentEvents();
    this.teardownEventsCount++;
  }
}

function buildComponent({
  ignoreItems = true,
  hookContext = null,
  animated = false,
} = {}) {
  const dataOptions = animated
    ? {
        animations: {
          closed_to_open: { animation: ["run", "start", "end"], duration: 5 },
        },
      }
    : {};
  const dataEventMappings = {
    opened: "handle_opened",
    closed: { kind: "exec" },
  };

  document.body.innerHTML = `
    <div id="test-1" data-component="test" data-part="root" data-state="closed"
         data-options='${JSON.stringify(dataOptions)}'
         data-event-mappings='${JSON.stringify(dataEventMappings)}'>
      <button data-part="trigger" data-action="open"></button>
      <button data-part="close-trigger" data-action="close"></button>
      <div data-part="content">content</div>
      <div data-part="item-1">item one</div>
      <div data-part="nested-root" phx-hook="SaladUI">
        <span data-part="inner-part"></span>
      </div>
    </div>
  `;

  const el = document.getElementById("test-1");
  const component = new TestComponent(el, { hookContext, ignoreItems });

  return {
    component,
    el,
    elements: {
      trigger: el.querySelector('[data-part="trigger"]'),
      closeTrigger: el.querySelector('[data-part="close-trigger"]'),
      content: el.querySelector('[data-part="content"]'),
      item: el.querySelector('[data-part="item-1"]'),
      innerPart: el.querySelector('[data-part="inner-part"]'),
    },
  };
}

function click(el) {
  el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
}

test("construction reads the initial state from data-state and applies data-state/hidden attributes", () => {
  const { component, el, elements } = buildComponent();

  assert.equal(component.state, "closed");
  assert.equal(el.getAttribute("data-state"), "closed");
  assert.equal(elements.content.getAttribute("data-state"), "closed");
  assert.equal(elements.content.hidden, true);
});

test("allParts excludes item parts by default but includes them with ignoreItems: false", () => {
  const withItemsIgnored = buildComponent({ ignoreItems: true });
  assert.equal(withItemsIgnored.component.getPart("item-1"), undefined);

  const withItemsIncluded = buildComponent({ ignoreItems: false });
  assert.ok(withItemsIncluded.component.getPart("item-1"));
});

test("queryParts() does not descend into nested phx-hook components", () => {
  const { component } = buildComponent();
  assert.equal(component.getPart("inner-part"), undefined);
});

test("transition() runs exit/enter handlers (including string-bound method references) and updates state", () => {
  const { component } = buildComponent();

  const result = component.transition("open");

  assert.equal(result, true);
  assert.equal(component.state, "open");
  assert.equal(component.previousState, "closed");
  assert.deepEqual(component.exited, ["closed"]);
  assert.deepEqual(component.entered, ["open"]);
});

test("updateUI()/updatePartsVisibility() reflect the new state on all parts after a transition", () => {
  const { component, el, elements } = buildComponent();

  component.transition("open");

  assert.equal(el.getAttribute("data-state"), "open");
  assert.equal(elements.content.getAttribute("data-state"), "open");
  assert.equal(elements.content.hidden, false);
});

test("ARIA attributes are (re)applied on every state change", () => {
  const { component, elements } = buildComponent();

  assert.equal(elements.trigger.getAttribute("aria-expanded"), "false");

  component.transition("open");

  assert.equal(elements.trigger.getAttribute("aria-expanded"), "true");
});

test("handleActionClick(): clicking a [data-action] element triggers the matching transition", () => {
  const { component, elements } = buildComponent();
  component.setupEvents();

  click(elements.trigger);
  assert.equal(component.state, "open");

  click(elements.closeTrigger);
  assert.equal(component.state, "closed");
});

test("setupEvents() does not accumulate duplicate click listeners across repeated calls (regression)", () => {
  const { component, elements } = buildComponent();
  const calls = [];
  const originalTransition = component.transition.bind(component);
  component.transition = (event, params) => {
    calls.push(event);
    return originalTransition(event, params);
  };

  // Several real components (Dialog, Menu, Select, Accordion) call setupEvents()
  // themselves in their constructor *and* have the factory call it again.
  component.setupEvents();
  component.setupEvents();

  click(elements.trigger);

  assert.deepEqual(calls, ["open"]);
  assert.equal(component.state, "open");
});

test("removeAllEvents() actually detaches the click listener (regression for a bind() identity mismatch)", () => {
  const { component, elements } = buildComponent();
  component.setupEvents();
  component.removeAllEvents();

  click(elements.trigger);

  assert.equal(component.state, "closed");
});

test("keydown handling: Escape triggers the mapped action for the current state and prevents default", () => {
  const { component, el } = buildComponent();
  component.setupEvents();
  component.transition("open");

  const event = new window.KeyboardEvent("keydown", {
    key: "Escape",
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(event);

  assert.equal(component.state, "closed");
  assert.equal(event.defaultPrevented, true);
});

test("onClientCommand(): a salad_ui:command custom event triggers the given command", () => {
  const { component, el } = buildComponent();
  component.setupEvents();

  el.dispatchEvent(
    new window.CustomEvent("salad_ui:command", {
      detail: { command: "open", params: {} },
    }),
  );

  assert.equal(component.state, "open");
});

test("pushEvent(): pushes a mapped string event to the server via the hook, with component metadata", () => {
  const calls = [];
  const hookContext = {
    pushEventTo: (el, event, payload) => calls.push({ el, event, payload }),
  };
  const { component, el } = buildComponent({ hookContext });

  component.pushEvent("opened", { foo: 1 });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].el, el);
  assert.equal(calls[0].event, "handle_opened");
  assert.deepEqual(calls[0].payload, {
    foo: 1,
    componentId: "test-1",
    component: "test",
  });
});

test("pushEvent(): a JS-command style mapping executes via hook.liveSocket.execJS instead of pushEventTo", () => {
  const execCalls = [];
  const hookContext = {
    pushEventTo: () =>
      assert.fail("pushEventTo should not be called for JS-command mappings"),
    liveSocket: { execJS: (el, json) => execCalls.push({ el, json }) },
  };
  const { component, el } = buildComponent({ hookContext });

  component.pushEvent("closed", {});

  assert.equal(execCalls.length, 1);
  assert.equal(execCalls[0].el, el);
  assert.equal(execCalls[0].json, JSON.stringify({ kind: "exec" }));
});

test("pushEvent() is a no-op without a hook (or without a mapping for the event)", () => {
  const { component } = buildComponent();
  assert.doesNotThrow(() => component.pushEvent("opened", {}));
  assert.doesNotThrow(() => component.pushEvent("no-such-event", {}));
});

test("onStateChanged() defers visibility updates for animated transitions, and discards stale updates superseded by a later transition (regression)", async () => {
  const { component, elements } = buildComponent({ animated: true });

  component.transition("open");
  // Animation pending: visibility has not been updated to "open" yet.
  assert.equal(elements.content.hidden, true);

  // Immediately reverse the transition before the "open" animation resolves.
  // "open" -> "closed" has no configured animation, so this applies synchronously.
  component.transition("close");
  assert.equal(elements.content.hidden, true);
  assert.equal(component.state, "closed");

  // Let the stale "open" animation's promise resolve. Its completion callback
  // must notice the state has since moved on and skip re-applying visibility.
  await wait(20);

  assert.equal(component.state, "closed");
  assert.equal(elements.content.hidden, true);
});

test("destroy() marks the component destroyed, makes transition()/handleActionClick a no-op, and does not throw", () => {
  const { component, elements } = buildComponent();
  component.setupEvents();

  component.destroy();

  assert.equal(component.destroyed, true);
  assert.equal(component.transition("open"), undefined);
  assert.doesNotThrow(() => click(elements.trigger));
});

test("setupEvents()/removeAllEvents() pair setupComponentEvents()/teardownComponentEvents()", () => {
  const { component } = buildComponent();

  assert.equal(component.setupEventsCount, 0);
  assert.equal(component.teardownEventsCount, 0);

  component.setupEvents();
  assert.equal(component.setupEventsCount, 1);
  assert.equal(component.teardownEventsCount, 0);

  component.setupEvents();
  assert.equal(component.setupEventsCount, 2);
  assert.equal(component.teardownEventsCount, 1);

  component.removeAllEvents();
  assert.equal(component.setupEventsCount, 2);
  assert.equal(component.teardownEventsCount, 2);

  component.removeAllEvents();
  assert.equal(component.setupEventsCount, 2);
  assert.equal(component.teardownEventsCount, 2);
});

test("destroy() tears down active component events once, even with multiple setupEvents() calls", () => {
  const { component } = buildComponent();

  component.setupEvents();
  component.setupEvents();

  assert.equal(component.setupEventsCount, 2);
  assert.equal(component.teardownEventsCount, 1);

  component.destroy();
  assert.equal(component.teardownEventsCount, 2);

  component.destroy();
  assert.equal(component.teardownEventsCount, 2);
});

test("getPartId() assigns and memoizes an id derived from the root element's id", () => {
  const { component, el, elements } = buildComponent();

  const id = component.getPartId("content");

  assert.equal(id, "test-1-content");
  assert.equal(elements.content.id, "test-1-content");
  assert.equal(component.getPartId("content"), id);
  assert.equal(el.id, "test-1");
});

test("parseOptions() falls back to an empty options object and logs an error on malformed JSON", () => {
  document.body.innerHTML = `
    <div id="broken" data-component="test" data-part="root" data-options="{not-json" data-state="closed">
      <button data-part="trigger" data-action="open"></button>
    </div>
  `;
  const originalError = console.error;
  const errors = [];
  console.error = (...args) => errors.push(args.join(" "));

  try {
    const component = new TestComponent(document.getElementById("broken"), {});
    assert.deepEqual(component.options, {});
    assert.ok(errors.some((message) => message.includes("options")));
  } finally {
    console.error = originalError;
  }
});
