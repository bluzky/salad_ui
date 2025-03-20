// saladui/core/collection-manager.js
/**
 * CollectionManager utility for SaladUI components
 * Manages collections of items with focus, highlight, and selection states
 */
class CollectionManager {
  /**
   * Create a collection manager
   *
   * @param {Object} options - Configuration options
   * @param {string} options.type - Collection type: 'single' or 'multiple'
   * @param {Array|*} options.defaultValue - Default value(s) if none provided
   * @param {Array|*} options.value - Initial value(s) for the collection
   * @param {function} options.getItemValue - Function to get value from an item instance
   * @param {function} options.isItemDisabled - Function to check if an item is disabled
   */
  constructor(options = {}) {
    this.options = {
      type: "single",
      defaultValue: null,
      value: null,
      getItemValue: (item) => item.value,
      isItemDisabled: (item) => item.disabled,
      ...options,
    };

    // Initialize collection
    this.items = [];
    this.highlightedItem = null;
    this.focusedItem = null;

    // Initialize values
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

  /**
   * Reset the collection
   */
  reset() {
    this.items = [];
    this.values = Array.isArray(this.options.defaultValue)
      ? [...this.options.defaultValue]
      : this.options.defaultValue
        ? [this.options.defaultValue]
        : [];
    this.highlightedItem = null;
    this.focusedItem = null;
  }

  /**
   * Set collection values
   *
   * @param {Array|*} values - Value or array of values
   */
  setValues(values) {
    if (values === undefined || values === null) {
      this.values = Array.isArray(this.options.defaultValue)
        ? [...this.options.defaultValue]
        : this.options.defaultValue
          ? [this.options.defaultValue]
          : [];
      return;
    }

    if (this.options.type === "single") {
      this.values = Array.isArray(values) ? [values[0]] : [values];
    } else {
      this.values = Array.isArray(values) ? [...values] : [values];
    }

    // Update selected state for all items
    this.updateSelectedStates();
  }

  /**
   * Get the selected value(s)
   * For 'multiple' type collections, returns an array of all selected values
   * For 'single' type collections, returns just the first selected value (or null if none)
   *
   * @param {boolean} asArray - Force return value to be an array even for single selection
   * @returns {*|Array} Selected value(s)
   */
  getValue(asArray = false) {
    if (this.options.type === "multiple" || asArray) {
      return [...this.values];
    }
    return this.values.length > 0 ? this.values[0] : null;
  }

  /**
   * Add an item to the collection
   *
   * @param {Object} item - Item instance to add
   * @param {*} value - Item value
   * @returns {Object} The collection item wrapper
   */
  add(item, value) {
    const itemValue =
      value !== undefined ? value : this.options.getItemValue(item);

    const isSelected = this.values.includes(itemValue);

    const collectionItem = {
      instance: item,
      value: itemValue,
      highlighted: false,
      focused: false,
      selected: isSelected,
    };

    this.items.push(collectionItem);

    // Initialize item state
    if (isSelected && typeof item.handleEvent === "function") {
      item.handleEvent("select");
    }

    return collectionItem;
  }

  /**
   * Remove an item from the collection
   *
   * @param {Object} itemInstance - Item instance to remove
   */
  remove(itemInstance) {
    const index = this.items.findIndex(
      (item) => item.instance === itemInstance,
    );
    if (index >= 0) {
      const [removedItem] = this.items.splice(index, 1);

      // Update highlight/focus if needed
      if (this.highlightedItem === removedItem) {
        this.highlightedItem = null;
      }

      if (this.focusedItem === removedItem) {
        this.focusedItem = null;
      }

      // Remove from values if selected
      if (removedItem.selected) {
        this.values = this.values.filter(
          (value) => value !== removedItem.value,
        );
      }
    }
  }

  /**
   * Clear all items from the collection
   */
  clear() {
    this.items = [];
    this.highlightedItem = null;
    this.focusedItem = null;
    // Maintain values for when new items are added
  }

  /**
   * Get item by its instance
   *
   * @param {Object} itemInstance - Item instance to find
   * @returns {Object} Collection item or null if not found
   */
  getItemByInstance(itemInstance) {
    return this.items.find((item) => item.instance === itemInstance) || null;
  }

  /**
   * Get item by its value
   *
   * @param {*} value - Value to find
   * @returns {Object} Collection item or null if not found
   */
  getItemByValue(value) {
    return this.items.find((item) => item.value === value) || null;
  }

  /**
   * Get an item from the collection based on navigation direction
   *
   * @param {string} direction - Navigation direction: 'first', 'last', 'next', or 'prev'/'previous'
   * @param {Object} referenceItem - Reference item for 'next' and 'prev' directions (optional)
   * @param {boolean} loop - Whether to loop when reaching boundaries (optional, default: true)
   * @returns {Object} The requested item or null if not found
   */
  getItem(direction, referenceItem = null, loop = true) {
    const enabledItems = this.items.filter(
      (item) => !this.options.isItemDisabled(item.instance),
    );
    if (enabledItems.length === 0) return null;

    switch (direction) {
      case "first":
        return enabledItems[0];

      case "last":
        return enabledItems[enabledItems.length - 1];

      case "next":
        if (!referenceItem) return this.getItem("first");

        const nextIndex = enabledItems.indexOf(referenceItem) + 1;
        if (nextIndex >= enabledItems.length) {
          return loop ? enabledItems[0] : null;
        }
        return enabledItems[nextIndex];

      case "prev":
      case "previous":
        if (!referenceItem) return this.getItem("last");

        const currentIndex = enabledItems.indexOf(referenceItem);
        if (currentIndex === -1) return enabledItems[enabledItems.length - 1];

        const prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
          return loop ? enabledItems[enabledItems.length - 1] : null;
        }
        return enabledItems[prevIndex];

      default:
        return null;
    }
  }

  /**
   * Highlight an item
   *
   * @param {Object} item - Item to highlight
   * @returns {boolean} Whether the operation was successful
   */
  highlight(item) {
    if (!item || this.options.isItemDisabled(item.instance)) return false;

    // Clear previous highlight
    if (this.highlightedItem) {
      this.highlightedItem.highlighted = false;
      if (typeof this.highlightedItem.instance.handleEvent === "function") {
        this.highlightedItem.instance.handleEvent("unhighlight");
      }
    }

    // Set new highlight
    this.highlightedItem = item;
    item.highlighted = true;

    if (typeof item.instance.handleEvent === "function") {
      return item.instance.handleEvent("highlight") !== false;
    }

    return true;
  }

  /**
   * Focus an item
   *
   * @param {Object} item - Item to focus
   * @returns {boolean} Whether the operation was successful
   */
  focus(item) {
    if (!item || this.options.isItemDisabled(item.instance)) return false;

    // Clear previous focus
    if (this.focusedItem) {
      this.focusedItem.focused = false;
      if (typeof this.focusedItem.instance.handleEvent === "function") {
        this.focusedItem.instance.handleEvent("blur");
      }
    }

    // Set new focus
    this.focusedItem = item;
    item.focused = true;

    if (typeof item.instance.handleEvent === "function") {
      return item.instance.handleEvent("focus") !== false;
    }

    return true;
  }

  /**
   * Select an item
   *
   * @param {Object} item - Item to select
   * @returns {boolean} Whether the operation was successful
   */
  select(item) {
    if (!item || this.options.isItemDisabled(item.instance)) return false;

    const isMultiple = this.options.type === "multiple";

    // If it's already selected in single mode, do nothing
    if (!isMultiple && item.selected && this.values.length === 1) {
      return true;
    }

    // For single selection, clear all other selections
    if (!isMultiple) {
      this.items.forEach((existingItem) => {
        if (existingItem !== item && existingItem.selected) {
          existingItem.selected = false;
          if (typeof existingItem.instance.handleEvent === "function") {
            existingItem.instance.handleEvent("unselect");
          }
        }
      });
      this.values = [];
    }

    // Toggle selection for the item
    if (item.selected) {
      // Unselect the item
      item.selected = false;
      this.values = this.values.filter((value) => value !== item.value);

      if (typeof item.instance.handleEvent === "function") {
        return item.instance.handleEvent("unselect") !== false;
      }
    } else {
      // Select the item
      item.selected = true;
      this.values.push(item.value);

      if (typeof item.instance.handleEvent === "function") {
        return item.instance.handleEvent("select") !== false;
      }
    }

    return true;
  }

  /**
   * Update all item selected states based on values
   */
  updateSelectedStates() {
    this.items.forEach((item) => {
      const shouldBeSelected = this.values.includes(item.value);

      if (item.selected !== shouldBeSelected) {
        item.selected = shouldBeSelected;

        if (typeof item.instance.handleEvent === "function") {
          item.instance.handleEvent(shouldBeSelected ? "select" : "unselect");
        }
      }
    });
  }
}

export default CollectionManager;
