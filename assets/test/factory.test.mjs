import assert from "node:assert/strict";
import test from "node:test";

import { registry } from "../salad_ui/core/factory.js";

class FakeComponent {
  constructor(el, hookContext) {
    this.el = el;
    this.hookContext = hookContext;
    this.setupEventsCalled = false;
  }

  setupEvents() {
    this.setupEventsCalled = true;
  }

  afterMount() {
    this.afterMountCalled = true;
  }
}

test("create() returns null and logs an error for an unregistered type", () => {
  const originalError = console.error;
  const errors = [];
  console.error = (...args) => errors.push(args.join(" "));

  try {
    const instance = registry.create("does-not-exist", {}, {});
    assert.equal(instance, null);
    assert.match(errors[0], /does-not-exist/);
  } finally {
    console.error = originalError;
  }
});

test("create() instantiates the registered class and calls setupEvents then afterMount", () => {
  registry.register("fake", FakeComponent);

  const el = { id: "fake-1" };
  const hookContext = { pushEventTo() {} };
  const instance = registry.create("fake", el, hookContext);

  assert.ok(instance instanceof FakeComponent);
  assert.equal(instance.el, el);
  assert.equal(instance.hookContext, hookContext);
  assert.equal(instance.setupEventsCalled, true);
  assert.equal(instance.afterMountCalled, true);
});

test("register() returns the registry to allow chaining", () => {
  const result = registry.register("fake-chain", FakeComponent);
  assert.equal(result, registry);
});
