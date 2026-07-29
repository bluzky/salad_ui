import assert from "node:assert/strict";
import test from "node:test";

import Collection, {
  CollectionRegistry,
  RovingFocus,
  Selection,
} from "../salad_ui/core/collection.js";

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

test("CollectionRegistry: first/last/next/prev skip disabled items and loop by default", () => {
  const registry = new CollectionRegistry();
  const a = registry.add(new FakeItem("a"));
  registry.add(new FakeItem("b", { disabled: true }));
  const c = registry.add(new FakeItem("c"));

  assert.equal(registry.getItem("first"), a);
  assert.equal(registry.getItem("last"), c);
  assert.equal(registry.getItem("next", a), c);
  assert.equal(registry.getItem("next", c), a);
  assert.equal(registry.getItem("prev", a), c);
});

test("CollectionRegistry: next/prev without loop returns null at the boundary", () => {
  const registry = new CollectionRegistry();
  const a = registry.add(new FakeItem("a"));
  const b = registry.add(new FakeItem("b"));

  assert.equal(registry.getItem("next", b, false), null);
  assert.equal(registry.getItem("prev", a, false), null);
});

test("CollectionRegistry: remove() drops the item and getItemByValue no longer finds it", () => {
  const registry = new CollectionRegistry();
  const a = registry.add(new FakeItem("a"));
  const c = registry.add(new FakeItem("c"));

  assert.deepEqual(
    registry.enabledItems().map((item) => item.value),
    ["a", "c"],
  );
  assert.equal(registry.getItem("next", a), c);
  assert.equal(registry.remove(a.instance), a);
  assert.equal(registry.getItemByValue("a"), null);
});

test("RovingFocus: focus() clears the previous focused item and notifies both items", () => {
  const registry = new CollectionRegistry();
  const focus = new RovingFocus(registry);
  const a = registry.add(new FakeItem("a"));
  const b = registry.add(new FakeItem("b"));

  focus.focus(a);
  assert.equal(a.focused, true);
  assert.equal(focus.focusedItem, a);

  focus.focus(b);
  assert.equal(a.focused, false);
  assert.equal(b.focused, true);
  assert.deepEqual(a.instance.events, ["focus", "blur"]);
  assert.deepEqual(b.instance.events, ["focus"]);
});

test("RovingFocus: focus() on the already focused item is a no-op (regression)", () => {
  const registry = new CollectionRegistry();
  const focus = new RovingFocus(registry);
  const a = registry.add(new FakeItem("a"));

  focus.focus(a);
  focus.focus(a);

  assert.equal(a.focused, true);
  assert.deepEqual(a.instance.events, ["focus"]);
});

test("RovingFocus: remove() clears focusedItem when the focused item is removed", () => {
  const registry = new CollectionRegistry();
  const focus = new RovingFocus(registry);
  const a = registry.add(new FakeItem("a"));
  focus.focus(a);

  registry.remove(a.instance);
  focus.remove(a);

  assert.equal(focus.focusedItem, null);
});

test("Selection: single type unselects the previous item when a new one is selected", () => {
  const registry = new CollectionRegistry();
  const selection = new Selection(registry, { type: "single" });
  const a = registry.add(new FakeItem("a"));
  const b = registry.add(new FakeItem("b"));

  selection.select(a);
  assert.equal(a.selected, true);
  assert.equal(selection.getValue(), "a");

  selection.select(b);
  assert.equal(a.selected, false);
  assert.equal(b.selected, true);
  assert.equal(selection.getValue(), "b");
  assert.deepEqual(a.instance.events, ["select", "unselect"]);
  assert.deepEqual(b.instance.events, ["select"]);
});

test("Selection: single type re-selecting the only selected item keeps it selected", () => {
  const registry = new CollectionRegistry();
  const selection = new Selection(registry, { type: "single" });
  const a = registry.add(new FakeItem("a"));

  selection.select(a);
  selection.select(a);

  assert.equal(a.selected, true);
  assert.equal(selection.getValue(), "a");
});

test("Selection: multiple type toggles independently and getValue(true) returns an array", () => {
  const registry = new CollectionRegistry();
  const selection = new Selection(registry, { type: "multiple" });
  const a = registry.add(new FakeItem("a"));
  const b = registry.add(new FakeItem("b"));

  selection.select(a);
  selection.select(b);
  assert.deepEqual(selection.getValue(), ["a", "b"]);

  selection.select(a);
  assert.deepEqual(selection.getValue(), ["b"]);
  assert.equal(a.selected, false);
  assert.equal(b.selected, true);
});

test("Selection: select() is a no-op for disabled items", () => {
  const registry = new CollectionRegistry();
  const selection = new Selection(registry, { type: "single" });
  const disabled = registry.add(new FakeItem("a", { disabled: true }));

  const result = selection.select(disabled);

  assert.equal(result, false);
  assert.equal(disabled.selected, false);
  assert.deepEqual(selection.getValue(true), []);
});

test("Selection: initializeItem() marks items pre-selected via the initial value and fires select", () => {
  const registry = new CollectionRegistry();
  const selection = new Selection(registry, { type: "single", value: "b" });
  const a = registry.add(new FakeItem("a"));
  selection.initializeItem(a);
  const b = registry.add(new FakeItem("b"));
  selection.initializeItem(b);

  assert.equal(a.selected, false);
  assert.equal(b.selected, true);
  assert.deepEqual(b.instance.events, ["select"]);
});

test("Selection: setValues() updates selected state on existing items", () => {
  const registry = new CollectionRegistry();
  const selection = new Selection(registry, { type: "multiple" });
  const a = registry.add(new FakeItem("a"));
  const b = registry.add(new FakeItem("b"));

  selection.setValues(["b"]);

  assert.equal(a.selected, false);
  assert.equal(b.selected, true);
  assert.equal(selection.isValueSelected("b"), true);
  assert.equal(selection.isValueSelected("a"), false);
});

test("Selection: remove() drops the value when the selected item is removed", () => {
  const registry = new CollectionRegistry();
  const selection = new Selection(registry, { type: "single", value: "a" });
  const a = registry.add(new FakeItem("a"));
  selection.initializeItem(a);

  registry.remove(a.instance);
  selection.remove(a);

  assert.deepEqual(selection.getValue(true), []);
});

test("Collection default export preserves legacy combined API", () => {
  const collection = new Collection({ type: "single", value: "a" });
  const a = collection.add(new FakeItem("a"));
  const b = collection.add(new FakeItem("b"));

  assert.equal(a.selected, true);
  assert.equal(collection.getValue(), "a");

  collection.focus(a);
  collection.select(b);

  assert.equal(collection.focusedItem, a);
  assert.equal(a.selected, false);
  assert.equal(b.selected, true);
  assert.equal(collection.getItemByValue("b"), b);
});
