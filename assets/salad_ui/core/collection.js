// saladui/core/collection.js
/**
 * Collection primitives for item-based components.
 *
 * CollectionRegistry owns item order and disabled filtering.
 * RovingFocus owns focused-item bookkeeping.
 * Selection owns selected value state.
 */

class CollectionRegistry {
  constructor(options = {}) {
    this.options = {
      getItemValue: (item) => item.value,
      isItemDisabled: (item) => item.disabled,
      ...options,
    };
    this.items = [];
  }

  isDisabled(item) {
    return this.options.isItemDisabled(item.instance);
  }

  add(item) {
    const collectionItem = {
      instance: item,
      value: this.options.getItemValue(item),
      focused: false,
      selected: false,
    };

    this.items.push(collectionItem);
    return collectionItem;
  }

  remove(itemInstance) {
    const index = this.items.findIndex(
      (item) => item.instance === itemInstance,
    );
    if (index < 0) return null;

    const [removedItem] = this.items.splice(index, 1);
    return removedItem;
  }

  clear() {
    this.items = [];
  }

  enabledItems() {
    return this.items.filter((item) => !this.isDisabled(item));
  }

  getItemByInstance(itemInstance) {
    return this.items.find((item) => item.instance === itemInstance) || null;
  }

  getItemByValue(value) {
    return this.items.find((item) => item.value === value) || null;
  }

  getItem(direction, referenceItem = null, loop = true) {
    const enabledItems = this.enabledItems();
    if (enabledItems.length === 0) return null;

    switch (direction) {
      case "first":
        return enabledItems[0];

      case "last":
        return enabledItems[enabledItems.length - 1];

      case "next": {
        if (!referenceItem) return this.getItem("first");

        const nextIndex = enabledItems.indexOf(referenceItem) + 1;
        if (nextIndex >= enabledItems.length) {
          return loop ? enabledItems[0] : null;
        }
        return enabledItems[nextIndex];
      }

      case "prev":
      case "previous": {
        if (!referenceItem) return this.getItem("last");

        const currentIndex = enabledItems.indexOf(referenceItem);
        if (currentIndex === -1) return enabledItems[enabledItems.length - 1];

        const prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
          return loop ? enabledItems[enabledItems.length - 1] : null;
        }
        return enabledItems[prevIndex];
      }

      default:
        return null;
    }
  }

  each(callback) {
    this.items.forEach((item) => callback(item.instance));
  }
}

class RovingFocus {
  constructor(registry) {
    this.registry = registry;
    this.focusedItem = null;
  }

  reset() {
    this.focusedItem = null;
  }

  remove(item) {
    if (this.focusedItem === item) {
      this.focusedItem = null;
    }
  }

  focus(item) {
    if (!item || this.registry.isDisabled(item)) return false;
    if (this.focusedItem === item) return true;

    if (this.focusedItem) {
      this.focusedItem.focused = false;
      if (typeof this.focusedItem.instance.handleEvent === "function") {
        this.focusedItem.instance.handleEvent("blur");
      }
    }

    this.focusedItem = item;
    item.focused = true;

    if (typeof item.instance.handleEvent === "function") {
      return item.instance.handleEvent("focus") !== false;
    }

    return true;
  }
}

class Selection {
  constructor(registry, options = {}) {
    this.registry = registry;
    this.options = {
      type: "single",
      defaultValue: null,
      value: null,
      ...options,
    };

    this.values = [];
    if (this.options.value !== null && this.options.value !== undefined) {
      this.setValues(this.options.value);
    } else if (
      this.options.defaultValue !== null &&
      this.options.defaultValue !== undefined
    ) {
      this.setValues(this.options.defaultValue);
    }
  }

  reset() {
    this.values = this.normalizeValues(this.options.defaultValue);
  }

  remove(item) {
    if (item?.selected) {
      this.values = this.values.filter((value) => value !== item.value);
    }
  }

  normalizeValues(values) {
    if (values === undefined || values === null) return [];

    if (this.options.type === "single") {
      return Array.isArray(values) ? [values[0]] : [values];
    }

    return Array.isArray(values) ? [...values] : [values];
  }

  setValues(values) {
    this.values = this.normalizeValues(values ?? this.options.defaultValue);
    this.updateSelectedStates();
  }

  getValue(asArray = false) {
    if (this.options.type === "multiple" || asArray) {
      return [...this.values];
    }
    return this.values.length > 0 ? this.values[0] : null;
  }

  initializeItem(item) {
    item.selected = this.values.includes(item.value);

    if (item.selected && typeof item.instance.handleEvent === "function") {
      item.instance.handleEvent("select");
    }
  }

  select(item) {
    if (!item || this.registry.isDisabled(item)) return false;

    const isMultiple = this.options.type === "multiple";

    if (!isMultiple && item.selected && this.values.length === 1) {
      return true;
    }

    if (!isMultiple) {
      this.registry.items.forEach((existingItem) => {
        if (existingItem !== item && existingItem.selected) {
          existingItem.selected = false;
          if (typeof existingItem.instance.handleEvent === "function") {
            existingItem.instance.handleEvent("unselect");
          }
        }
      });
      this.values = [];
    }

    if (item.selected) {
      item.selected = false;
      this.values = this.values.filter((value) => value !== item.value);

      if (typeof item.instance.handleEvent === "function") {
        return item.instance.handleEvent("unselect") !== false;
      }
    } else {
      item.selected = true;
      this.values.push(item.value);

      if (typeof item.instance.handleEvent === "function") {
        return item.instance.handleEvent("select") !== false;
      }
    }

    return true;
  }

  updateSelectedStates() {
    this.registry.items.forEach((item) => {
      const shouldBeSelected = this.values.includes(item.value);

      if (item.selected !== shouldBeSelected) {
        item.selected = shouldBeSelected;

        if (typeof item.instance.handleEvent === "function") {
          item.instance.handleEvent(shouldBeSelected ? "select" : "unselect");
        }
      }
    });
  }

  isValueSelected(value) {
    return this.values.includes(value);
  }
}

class Collection {
  constructor(options = {}) {
    this.registry = new CollectionRegistry(options);
    this.rovingFocus = new RovingFocus(this.registry);
    this.selection = new Selection(this.registry, options);
  }

  get items() {
    return this.registry.items;
  }

  get focusedItem() {
    return this.rovingFocus.focusedItem;
  }

  get values() {
    return this.selection.values;
  }

  reset() {
    this.registry.clear();
    this.rovingFocus.reset();
    this.selection.reset();
  }

  setValues(values) {
    this.selection.setValues(values);
  }

  getValue(asArray = false) {
    return this.selection.getValue(asArray);
  }

  add(item) {
    const collectionItem = this.registry.add(item);
    this.selection.initializeItem(collectionItem);
    return collectionItem;
  }

  remove(itemInstance) {
    const removedItem = this.registry.remove(itemInstance);
    this.rovingFocus.remove(removedItem);
    this.selection.remove(removedItem);
    return removedItem;
  }

  clear() {
    this.registry.clear();
    this.rovingFocus.reset();
  }

  getItemByInstance(itemInstance) {
    return this.registry.getItemByInstance(itemInstance);
  }

  getItemByValue(value) {
    return this.registry.getItemByValue(value);
  }

  getItem(direction, referenceItem = null, loop = true) {
    return this.registry.getItem(direction, referenceItem, loop);
  }

  focus(item) {
    return this.rovingFocus.focus(item);
  }

  select(item) {
    return this.selection.select(item);
  }

  updateSelectedStates() {
    return this.selection.updateSelectedStates();
  }

  isValueSelected(value) {
    return this.selection.isValueSelected(value);
  }

  each(callback) {
    this.registry.each(callback);
  }
}

export default Collection;
export { CollectionRegistry, RovingFocus, Selection };
