import assert from "node:assert/strict";
import test from "node:test";

import Collection from "../salad_ui/core/collection.js";

class FakeItem {
  constructor(value, { disabled = false } = {}) {
    this.value = value;
    this.disabled = disabled;
    this.events = [];
  }

  handleEvent(event) {
    this.events.push(event);
    return true;
  }
}

test("single selection: selecting a new item unselects the previous one", () => {
  const collection = new Collection({ type: "single" });
  const a = collection.add(new FakeItem("a"));
  const b = collection.add(new FakeItem("b"));

  collection.select(a);
  assert.equal(a.selected, true);
  assert.equal(collection.getValue(), "a");

  collection.select(b);
  assert.equal(a.selected, false);
  assert.equal(b.selected, true);
  assert.equal(collection.getValue(), "b");
  assert.deepEqual(a.instance.events, ["select", "unselect"]);
  assert.deepEqual(b.instance.events, ["select"]);
});

test("single selection: selecting the only selected item again keeps it selected", () => {
  const collection = new Collection({ type: "single" });
  const a = collection.add(new FakeItem("a"));

  collection.select(a);
  collection.select(a);

  assert.equal(a.selected, true);
  assert.equal(collection.getValue(), "a");
});

test("multiple selection: select toggles independently and getValue(true) returns an array", () => {
  const collection = new Collection({ type: "multiple" });
  const a = collection.add(new FakeItem("a"));
  const b = collection.add(new FakeItem("b"));

  collection.select(a);
  collection.select(b);
  assert.deepEqual(collection.getValue(), ["a", "b"]);

  collection.select(a);
  assert.deepEqual(collection.getValue(), ["b"]);
  assert.equal(a.selected, false);
  assert.equal(b.selected, true);
});

test("select() is a no-op for disabled items", () => {
  const collection = new Collection({ type: "single" });
  const disabled = collection.add(new FakeItem("a", { disabled: true }));

  const result = collection.select(disabled);

  assert.equal(result, false);
  assert.equal(disabled.selected, false);
  assert.deepEqual(collection.getValue(true), []);
});

test("add() marks items pre-selected via initial value and fires select", () => {
  const collection = new Collection({ type: "single", value: "b" });
  const a = collection.add(new FakeItem("a"));
  const b = collection.add(new FakeItem("b"));

  assert.equal(a.selected, false);
  assert.equal(b.selected, true);
  assert.deepEqual(b.instance.events, ["select"]);
});

test("getItem: first/last/next/prev skip disabled items and loop by default", () => {
  const collection = new Collection({ type: "single" });
  const a = collection.add(new FakeItem("a"));
  collection.add(new FakeItem("b", { disabled: true }));
  const c = collection.add(new FakeItem("c"));

  assert.equal(collection.getItem("first"), a);
  assert.equal(collection.getItem("last"), c);
  assert.equal(collection.getItem("next", a), c);
  assert.equal(collection.getItem("next", c), a);
  assert.equal(collection.getItem("prev", a), c);
});

test("getItem: next/prev without loop returns null at the boundary", () => {
  const collection = new Collection({ type: "single" });
  const a = collection.add(new FakeItem("a"));
  const b = collection.add(new FakeItem("b"));

  assert.equal(collection.getItem("next", b, false), null);
  assert.equal(collection.getItem("prev", a, false), null);
});

test("focus() clears the previous focused item and notifies both items", () => {
  const collection = new Collection({ type: "single" });
  const a = collection.add(new FakeItem("a"));
  const b = collection.add(new FakeItem("b"));

  collection.focus(a);
  assert.equal(a.focused, true);
  assert.equal(collection.focusedItem, a);

  collection.focus(b);
  assert.equal(a.focused, false);
  assert.equal(b.focused, true);
  assert.deepEqual(a.instance.events, ["focus", "blur"]);
  assert.deepEqual(b.instance.events, ["focus"]);
});

test("remove() clears focusedItem and selected value when the focused/selected item is removed", () => {
  const collection = new Collection({ type: "single", value: "a" });
  const a = collection.add(new FakeItem("a"));
  collection.focus(a);

  collection.remove(a.instance);

  assert.equal(collection.focusedItem, null);
  assert.deepEqual(collection.getValue(true), []);
  assert.equal(collection.getItemByValue("a"), null);
});

test("setValues() updates selected state on existing items", () => {
  const collection = new Collection({ type: "multiple" });
  const a = collection.add(new FakeItem("a"));
  const b = collection.add(new FakeItem("b"));

  collection.setValues(["b"]);

  assert.equal(a.selected, false);
  assert.equal(b.selected, true);
  assert.equal(collection.isValueSelected("b"), true);
  assert.equal(collection.isValueSelected("a"), false);
});

test("reset() clears items, values and focus back to defaultValue", () => {
  const collection = new Collection({ type: "single", defaultValue: "z" });
  collection.add(new FakeItem("a"));
  collection.focus(collection.items[0]);

  collection.reset();

  assert.deepEqual(collection.items, []);
  assert.equal(collection.focusedItem, null);
  assert.equal(collection.getValue(), "z");
});
