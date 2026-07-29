import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { registry } from "../salad_ui/core/factory.js";
import { SaladUIHook } from "../salad_ui/core/hook.js";
import { installDom, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());

let nextInstanceId = 0;

class FakeComponent {
  constructor(el, hookContext) {
    this.id = nextInstanceId++;
    this.el = el;
    this.hookContext = hookContext;
    this.destroyed = false;
    this.setupEventsCalled = false;
    this.commands = [];
  }

  setupEvents() {
    this.setupEventsCalled = true;
  }

  afterMount() {}

  handleCommand(command, params) {
    this.commands.push({ command, params });
  }

  destroy() {
    this.destroyed = true;
  }
}

registry.register("hook-test", FakeComponent);

class StatefulFakeComponent extends FakeComponent {
  constructor(el, hookContext, options) {
    super(el, hookContext);
    this.options = options;
  }

  getUpdateState() {
    return "active";
  }

  destroy(options) {
    this.destroyOptions = options;
    super.destroy();
  }
}

registry.register("stateful-hook-test", StatefulFakeComponent);

function createHookInstance(el) {
  const eventHandlers = {};

  return {
    ...SaladUIHook,
    el,
    pushEventTo() {},
    handleEvent(event, callback) {
      eventHandlers[event] = callback;
    },
    triggerServerEvent(event, payload) {
      eventHandlers[event]?.(payload);
    },
  };
}

function buildEl(componentType = "hook-test") {
  document.body.innerHTML = `<div id="hook-el" data-component="${componentType}"></div>`;
  return document.getElementById("hook-el");
}

test("mounted() creates the registered component via the factory and wires up server events", () => {
  const el = buildEl();
  const hook = createHookInstance(el);

  hook.mounted();

  assert.ok(hook.component instanceof FakeComponent);
  assert.equal(hook.component.el, el);
  assert.equal(hook.component.hookContext, hook);
  assert.equal(hook.component.setupEventsCalled, true);
});

test("mounted() logs an error and skips setup when data-component is missing", () => {
  document.body.innerHTML = `<div id="hook-el"></div>`;
  const el = document.getElementById("hook-el");
  const hook = createHookInstance(el);

  const originalError = console.error;
  const errors = [];
  console.error = (...args) => errors.push(args.join(" "));

  try {
    hook.mounted();
  } finally {
    console.error = originalError;
  }

  assert.equal(hook.component, undefined);
  assert.ok(errors.some((message) => message.includes("data-component")));
});

test("a saladui:command server event calls handleCommand on the component when there is no target or it matches", () => {
  const el = buildEl();
  const hook = createHookInstance(el);
  hook.mounted();

  hook.triggerServerEvent("saladui:command", {
    command: "open",
    params: { a: 1 },
  });
  hook.triggerServerEvent("saladui:command", {
    command: "close",
    target: "hook-el",
  });

  assert.deepEqual(hook.component.commands, [
    { command: "open", params: { a: 1 } },
    { command: "close", params: {} },
  ]);
});

test("a saladui:command server event is ignored when its target does not match this element's id", () => {
  const el = buildEl();
  const hook = createHookInstance(el);
  hook.mounted();

  hook.triggerServerEvent("saladui:command", {
    command: "open",
    target: "some-other-element",
  });

  assert.deepEqual(hook.component.commands, []);
});

test("updated() destroys the old component instance and mounts a fresh one", () => {
  const el = buildEl();
  const hook = createHookInstance(el);
  hook.mounted();

  const original = hook.component;
  hook.updated();

  assert.equal(original.destroyed, true);
  assert.notEqual(hook.component, original);
  assert.ok(hook.component instanceof FakeComponent);
  assert.equal(hook.component.destroyed, false);
});

test("updated() passes component update state into the replacement before mount", () => {
  const el = buildEl("stateful-hook-test");
  const hook = createHookInstance(el);
  hook.mounted();

  const original = hook.component;
  hook.updated();

  assert.deepEqual(original.destroyOptions, { preserveState: true });
  assert.equal(hook.component.options.initialStateOverride, "active");
});

test("destroyed() destroys the component and clears the reference", () => {
  const el = buildEl();
  const hook = createHookInstance(el);
  hook.mounted();
  const component = hook.component;

  hook.destroyed();

  assert.equal(component.destroyed, true);
  assert.equal(hook.component, null);
  assert.doesNotThrow(() => hook.destroyed());
});
