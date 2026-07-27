import assert from "node:assert/strict";
import test from "node:test";

import StateMachine from "../salad_ui/core/state-machine.js";

const createMachine = (overrides = {}, options) =>
  new StateMachine(
    {
      idle: {
        transitions: { open: "open", ...overrides.idle?.transitions },
        ...overrides.idle,
      },
      open: {
        transitions: { close: "idle", ...overrides.open?.transitions },
        ...overrides.open,
      },
      blocked: {
        transitions: {},
        ...overrides.blocked,
      },
    },
    "idle",
    options,
  );

test("transitions without validCheck option", () => {
  const events = [];
  const machine = createMachine({
    idle: { exit: () => events.push("exit:idle") },
    open: { enter: () => events.push("enter:open") },
  });

  assert.equal(machine.transition("open"), true);
  assert.equal(machine.state, "open");
  assert.deepEqual(events, ["exit:idle", "enter:open"]);
});

test("returns false when validCheck blocks transition", () => {
  const machine = createMachine(
    {
      idle: { exit: () => assert.fail("exit handler should not run") },
    },
    { validCheck: () => false },
  );

  assert.equal(machine.transition("open"), false);
  assert.equal(machine.state, "idle");
  assert.equal(machine.previousState, null);
});

test("ignores stale async enter handlers", async () => {
  const enters = [];
  let resolveOpenAnimation;

  const machine = createMachine(
    {
      open: { enter: () => enters.push("open") },
      idle: { enter: () => enters.push("idle") },
    },
    {
      onStateChanged: (_prevState, nextState) => {
        if (nextState === "open") {
          return new Promise((resolve) => {
            resolveOpenAnimation = resolve;
          });
        }

        return null;
      },
    },
  );

  assert.equal(machine.transition("open"), true);
  assert.equal(machine.transition("close"), true);
  assert.deepEqual(enters, ["idle"]);

  resolveOpenAnimation();
  await Promise.resolve();

  assert.equal(machine.state, "idle");
  assert.deepEqual(enters, ["idle"]);
});

test("skips async enter handlers when validCheck becomes false before resolution", async () => {
  const enters = [];
  let valid = true;
  let resolveOpenAnimation;

  const machine = createMachine(
    {
      open: { enter: () => enters.push("open") },
    },
    {
      validCheck: () => valid,
      onStateChanged: (_prevState, nextState) => {
        if (nextState === "open") {
          return new Promise((resolve) => {
            resolveOpenAnimation = resolve;
          });
        }

        return null;
      },
    },
  );

  assert.equal(machine.transition("open"), true);
  assert.equal(machine.state, "open");
  assert.deepEqual(enters, []);

  valid = false;
  resolveOpenAnimation();
  await Promise.resolve();

  assert.equal(machine.state, "open");
  assert.deepEqual(enters, []);
});
