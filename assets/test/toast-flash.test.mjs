import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import "../salad_ui/components/toast-flash.js";
import { registry } from "../salad_ui/core/factory.js";
import { installDom, uninstallDom } from "./helpers/dom.mjs";

before(() => installDom());
after(() => uninstallDom());
afterEach(() => {
  document.body.innerHTML = "";
});

function buildBridge({
  id = "toast-flash-bridge",
  toaster = "toaster",
  entries = [],
} = {}) {
  document.body.innerHTML = `
    <div id="${toaster}"></div>
    <div id="${id}" data-component="toast-flash" data-toaster="${toaster}"
         data-entries='${JSON.stringify(entries)}' data-part="root" hidden>
    </div>
  `;

  const el = document.getElementById(id);
  const pushed = [];
  const hookContext = {
    pushEvent: (event, payload) => pushed.push({ event, payload }),
    pushEventTo: () => {},
    liveSocket: { execJS: () => {} },
  };

  const commands = [];
  document
    .getElementById(toaster)
    .addEventListener("salad_ui:command", (event) => {
      commands.push(event.detail);
    });

  const component = registry.create("toast-flash", el, hookContext);

  return { component, pushed, commands };
}

test("a LiveView patch to data-entries (hook re-mount) forwards the new entry, matching real put_flash usage", () => {
  // put_flash always arrives via a DOM patch to an *already-mounted*
  // bridge element, not a fresh page load — SaladUIHook.updated() reacts
  // to that patch by destroying and recreating the component in place
  // (see core/hook.js), which is what actually re-triggers afterMount().
  // Every other test here only calls registry.create() once, equivalent
  // to the initial mount — this is the one path that exercises the real
  // put_flash -> re-render -> toast flow end to end at the JS layer.
  const { component: first, commands } = buildBridge({ entries: [] });
  assert.equal(commands.length, 0);

  const el = document.getElementById("toast-flash-bridge");
  first.destroy();
  el.dataset.entries = JSON.stringify([
    { kind: "info", message: "This is a regular Phoenix flash message." },
  ]);

  registry.create("toast-flash", el, {
    pushEvent: () => {},
    pushEventTo: () => {},
    liveSocket: { execJS: () => {} },
  });

  assert.equal(commands.length, 1);
  assert.deepEqual(commands[0], {
    command: "add",
    params: {
      variant: "info",
      title: "This is a regular Phoenix flash message.",
    },
  });
});

test("forwards each flash entry to the toaster and clears it server-side", () => {
  const { commands, pushed } = buildBridge({
    entries: [
      { kind: "info", message: "Saved!" },
      { kind: "error", message: "Broke" },
    ],
  });

  assert.equal(commands.length, 2);
  assert.deepEqual(commands[0], {
    command: "add",
    params: { variant: "info", title: "Saved!" },
  });
  assert.deepEqual(commands[1], {
    command: "add",
    params: { variant: "error", title: "Broke" },
  });

  assert.deepEqual(
    pushed.map((entry) => entry.payload.key),
    ["info", "error"],
  );
  assert.ok(pushed.every((entry) => entry.event === "lv:clear-flash"));
});

test("unknown flash kinds fall back to the default variant", () => {
  const { commands } = buildBridge({
    entries: [{ kind: "notice", message: "Hi" }],
  });

  assert.equal(commands[0].params.variant, "default");
});

test("no entries means no commands or clears", () => {
  const { commands, pushed } = buildBridge({ entries: [] });

  assert.equal(commands.length, 0);
  assert.equal(pushed.length, 0);
});

test("missing toaster element is a safe no-op", () => {
  assert.doesNotThrow(() => {
    buildBridge({
      toaster: "does-not-exist",
      entries: [{ kind: "info", message: "Hi" }],
    });
  });
});

test("malformed entries JSON is a safe no-op", () => {
  document.body.innerHTML = `
    <div id="toaster"></div>
    <div id="toast-flash-bridge" data-component="toast-flash" data-toaster="toaster"
         data-entries='not json' data-part="root" hidden>
    </div>
  `;

  const el = document.getElementById("toast-flash-bridge");
  const hookContext = {
    pushEvent: () => {},
    pushEventTo: () => {},
    liveSocket: { execJS: () => {} },
  };

  const originalError = console.error;
  const errors = [];
  console.error = (...args) => errors.push(args.join(" "));

  try {
    assert.doesNotThrow(() => registry.create("toast-flash", el, hookContext));
    assert.ok(errors.some((message) => message.includes("entries")));
  } finally {
    console.error = originalError;
  }
});
