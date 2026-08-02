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
    this.beforeUpdated = false;
    this.setupEventsCalled = false;
    this.commands = [];
  }

  setupEvents() {
    this.setupEventsCalled = true;
  }

  afterMount() {}

  beforeUpdate() {
    this.beforeUpdated = true;
  }

  skipReinitialize() {
    return this.constructor.nextSkipReinitialize;
  }

  handleCommand(command, params) {
    this.commands.push({ command, params });
  }

  destroy() {
    this.destroyed = true;
  }
}

FakeComponent.nextSkipReinitialize = false;

registry.register("hook-test", FakeComponent);

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

test("beforeUpdate() forwards LiveView's pre-patch lifecycle to the component", () => {
  const el = buildEl();
  const hook = createHookInstance(el);
  hook.mounted();

  hook.beforeUpdate();

  assert.equal(hook.component.beforeUpdated, true);
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

test("updated() keeps the current instance when the component reports skipReinitialize()", () => {
  const el = buildEl();
  const hook = createHookInstance(el);
  hook.mounted();

  const original = hook.component;
  FakeComponent.nextSkipReinitialize = true;
  try {
    hook.updated();
  } finally {
    FakeComponent.nextSkipReinitialize = false;
  }

  assert.equal(hook.component, original);
  assert.equal(original.destroyed, false);
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
