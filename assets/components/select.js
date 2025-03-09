// saladui/components/select.js
import Component from "../core";
import SaladUI from "../index";

class SelectComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);
    this.initializeProperties();
    this.setupConfiguration();
    this.updateSelectedItem();
  }

  initializeProperties() {
    this.content = this.getPart("content");
    this.trigger = this.getPart("trigger");
    this.valueDisplay = this.getPart("value");
    this.items = this.el.querySelectorAll("[data-part='item']");
    this.multiSelect = this.options.multiple;
    this.selectedValues = [];
  }

  setupConfiguration() {
    this.config.preventDefaultKeys = [
      "Escape",
      "ArrowUp",
      "ArrowDown",
      "Enter",
      "Space",
    ];
  }

  getStateMachine() {
    return {
      closed: {
        enter: "onClosedEnter",
        exit: "onClosedExit",
        keyMap: {
          ArrowDown: "open",
          Enter: "open",
          " ": "open",
        },
        transitions: {
          open: "open",
        },
        hidden: {
          content: true,
        },
      },
      open: {
        enter: "onOpenEnter",
        exit: "onOpenExit",
        keyMap: {
          Escape: "close",
          ArrowUp: "navigateUp",
          ArrowDown: "navigateDown",
          Enter: "selectHighlighted",
          " ": "selectHighlighted",
        },
        transitions: {
          close: "closed",
          select: "closed",
        },
        hidden: {
          content: false,
        },
      },
    };
  }

  getAriaConfig() {
    return {
      trigger: {
        all: {
          haspopup: "listbox",
        },
        open: {
          expanded: "true",
        },
        closed: {
          expanded: "false",
        },
      },
      content: {
        all: {
          role: "listbox",
        },
        open: {
          hidden: "false",
        },
        closed: {
          hidden: "true",
        },
      },
      item: {
        all: {
          role: "option",
        },
      },
    };
  }

  setupComponentEvents() {
    super.setupComponentEvents();
    document.addEventListener("click", this.handleClickOutside.bind(this));
    this.setupTriggerEvents();
    this.setupItemEvents();
    this.setupKeyboardNavigation();
  }

  setupTriggerEvents() {
    if (!this.trigger) return;

    this.trigger.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleDropdown();
    });
  }

  toggleDropdown() {
    this.transition(this.state === "closed" ? "open" : "close");
  }

  setupItemEvents() {
    this.items.forEach((item) => {
      if (item.getAttribute("data-disabled") === "true") return;

      item.addEventListener("click", (e) => this.handleItemClick(e, item));
      item.addEventListener("keydown", (e) => this.handleItemKeyDown(e, item));
    });
  }

  handleItemClick(e, item) {
    e.stopPropagation();

    const value = item.getAttribute("data-value");
    const label = item.textContent.trim();

    if (this.multiSelect) {
      this.toggleItemSelection(item, value, label);
    } else {
      this.setSelectedValue(value, label);
    }
    this.transition("select");
  }

  handleItemKeyDown(e, item) {
    if (e.key !== "Enter" && e.key !== " ") return;

    e.preventDefault();

    const value = item.getAttribute("data-value");
    const label = item.textContent.trim();

    if (this.multiSelect) {
      this.toggleItemSelection(item, value, label);
    } else {
      this.setSelectedValue(value, label);
    }
    this.transition("select");
  }

  toggleItemSelection(item, value, label) {
    const isSelected = item.getAttribute("data-selected") === "true";

    if (isSelected) {
      this.removeFromSelection(value, label);
    } else {
      this.addToSelection(value, label);
    }
  }

  setupKeyboardNavigation() {
    if (this.content) {
      this.content.addEventListener(
        "keydown",
        this.handleContentKeyDown.bind(this),
      );
    }
  }

  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  }

  handleClickOutside(event) {
    //Close the dropdown if the click was outside the component
    // or clicked on the root element itself
    if (
      this.state === "open" &&
      (!this.el.contains(event.target) || this.el === event.target)
    ) {
      this.transition("close");
    }
  }

  handleContentKeyDown(event) {
    if (this.state !== "open") return;

    const keyActions = {
      ArrowUp: () => {
        event.preventDefault();
        this.navigateUp();
      },
      ArrowDown: () => {
        event.preventDefault();
        this.navigateDown();
      },
      Escape: () => {
        event.preventDefault();
        this.transition("close");
      },
    };

    const action = keyActions[event.key];
    if (action) action();
  }

  // State machine handlers
  onClosedEnter() {
    this.unhighlightAllItems();
    this.focusTrigger();
    this.pushEvent("closed");
  }

  onClosedExit() {
    // No specific action needed
  }

  onOpenEnter() {
    this.focusSelectedOrFirstItem();
    this.pushEvent("opened");
  }

  onOpenExit() {
    // No specific action needed
  }

  focusTrigger() {
    if (this.trigger) {
      this.trigger.focus();
    }
  }

  // Navigation methods
  navigateUp() {
    const focusableItems = this.getFocusableItems();
    const currentIndex = this.getCurrentFocusedIndex(focusableItems);

    this.unhighlightAllItems();

    const targetIndex =
      currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1;

    this.highlightAndFocusItem(focusableItems[targetIndex]);
  }

  navigateDown() {
    const focusableItems = this.getFocusableItems();
    const currentIndex = this.getCurrentFocusedIndex(focusableItems);

    this.unhighlightAllItems();

    const targetIndex =
      currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0;

    this.highlightAndFocusItem(focusableItems[targetIndex]);
  }

  highlightAndFocusItem(item) {
    if (item) {
      this.highlightItem(item);
      item.focus();
    }
  }

  selectHighlighted() {
    const highlighted = document.activeElement;

    const isSelectableItem =
      highlighted &&
      highlighted.getAttribute("data-part") === "item" &&
      highlighted.getAttribute("data-disabled") !== "true";

    if (isSelectableItem) {
      const value = highlighted.getAttribute("data-value");
      const label = highlighted.textContent.trim();
      this.setSelectedValue(value, label);
      this.transition("select");
    }
  }

  // Selection management
  updateSelectedItem() {
    if (this.multiSelect) {
      this.initializeMultiSelect();
    } else {
      this.initializeSingleSelect();
    }
  }

  initializeMultiSelect() {
    const initialValues = this.parseInitialValues();

    if (initialValues.length > 0) {
      this.selectedValues = initialValues;

      const selectedItems = this.getItemsByValues(initialValues);
      const selectedLabels = selectedItems.map((item) =>
        item.textContent.trim(),
      );

      this.setMultiSelectedValues(initialValues, selectedLabels, false);
    }
  }

  parseInitialValues() {
    const { initialValue } = this.options;
    if (!initialValue) return [];

    if (Array.isArray(initialValue)) {
      return initialValue;
    }

    if (typeof initialValue === "string") {
      try {
        return JSON.parse(initialValue);
      } catch (e) {
        return initialValue.split(",").map((v) => v.trim());
      }
    }

    return [];
  }

  getItemsByValues(values) {
    return Array.from(this.items).filter((item) =>
      values.includes(item.getAttribute("data-value")),
    );
  }

  initializeSingleSelect() {
    const initialValue = this.options.initialValue;
    if (!initialValue) return;

    const selectedItem = Array.from(this.items).find(
      (item) => item.getAttribute("data-value") === initialValue,
    );

    if (selectedItem) {
      const value = selectedItem.getAttribute("data-value");
      const label = selectedItem.textContent.trim();
      this.setSelectedValue(value, label, false);
    }
  }

  setSelectedValue(value, label, triggerEvents = true) {
    this.updateValueDisplay(label || value);
    this.updateItemsSelection(value);
    this.updateHiddenInput(value);

    if (triggerEvents) {
      this.triggerChangeEvents(value);
    }
  }

  updateValueDisplay(text) {
    if (this.valueDisplay) {
      this.valueDisplay.setAttribute("data-content", text);
    }
  }

  updateItemsSelection(selectedValue) {
    this.items.forEach((item) => {
      const itemValue = item.getAttribute("data-value");
      const isSelected = itemValue === selectedValue;

      item.setAttribute("data-selected", isSelected);
    });
  }

  updateHiddenInput(value) {
    let hiddenInput = this.el.querySelector('input[type="hidden"]');

    if (!hiddenInput) {
      hiddenInput = this.createHiddenInput();
    }

    hiddenInput.value = value;
  }

  createHiddenInput() {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = this.options.name || "";
    this.el.appendChild(input);
    return input;
  }

  triggerChangeEvents(value) {
    const form = this.el.closest("form");

    if (form) {
      const hiddenInput = this.el.querySelector('input[type="hidden"]');
      if (hiddenInput) {
        const event = new Event("input", { bubbles: true });
        hiddenInput.dispatchEvent(event);
      }
    }

    this.pushEvent("value-changed", { value });
  }

  // Multi-select methods
  addToSelection(value, label) {
    if (this.selectedValues.includes(value)) return;

    this.selectedValues.push(value);
    this.updateMultiSelection();
  }

  removeFromSelection(value, label) {
    const index = this.selectedValues.indexOf(value);

    if (index === -1) return;

    this.selectedValues.splice(index, 1);
    this.updateMultiSelection();
  }

  updateMultiSelection() {
    const selectedItems = this.getItemsByValues(this.selectedValues);
    const selectedLabels = selectedItems.map((item) => item.textContent.trim());

    this.setMultiSelectedValues(this.selectedValues, selectedLabels);
  }

  setMultiSelectedValues(values, labels, triggerEvents = true) {
    this.updateMultiValueDisplay(values, labels);
    this.updateMultiItemsSelection(values);
    this.updateHiddenInputs(values);

    if (triggerEvents) {
      this.triggerMultiChangeEvents(values);
    }
  }

  updateMultiValueDisplay(values, labels) {
    if (!this.valueDisplay) return;

    let displayText;

    if (values.length === 0) {
      displayText =
        this.valueDisplay.getAttribute("data-placeholder") || "Select options";
    } else if (values.length === 1) {
      displayText = labels[0];
    } else {
      displayText = `${values.length} items selected`;
    }

    this.valueDisplay.setAttribute("data-content", displayText);
  }

  updateMultiItemsSelection(selectedValues) {
    this.items.forEach((item) => {
      const itemValue = item.getAttribute("data-value");
      const isSelected = selectedValues.includes(itemValue);

      item.setAttribute("data-selected", isSelected);
    });
  }

  updateHiddenInputs(values) {
    this.removeExistingHiddenInputs();

    if (this.multiSelect) {
      this.createMultipleHiddenInputs(values);
    } else if (values.length > 0) {
      this.updateHiddenInput(values[0]);
    }
  }

  removeExistingHiddenInputs() {
    const existingInputs = this.el.querySelectorAll('input[type="hidden"]');
    existingInputs.forEach((input) => {
      if (input.name.endsWith("[]")) {
        input.remove();
      }
    });
  }

  createMultipleHiddenInputs(values) {
    const inputName = `${this.options.name || ""}[]`;

    values.forEach((value) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = inputName;
      input.value = value;
      this.el.appendChild(input);
    });
  }

  triggerMultiChangeEvents(values) {
    const form = this.el.closest("form");

    if (form) {
      const inputs = this.el.querySelectorAll('input[type="hidden"]');
      if (inputs.length > 0) {
        const event = new Event("input", { bubbles: true });
        inputs[0].dispatchEvent(event);
      }
    }

    this.pushEvent("value-changed", { value: values });
  }

  // Helper methods
  highlightItem(item) {
    if (item) {
      item.setAttribute("data-highlighted", true);
    }
  }

  unhighlightAllItems() {
    this.items.forEach((item) => {
      item.setAttribute("data-highlighted", false);
    });
  }

  getFocusableItems() {
    return Array.from(this.items).filter(
      (item) => item.getAttribute("data-disabled") !== "true",
    );
  }

  getCurrentFocusedIndex(focusableItems) {
    const activeElement = document.activeElement;
    return focusableItems.indexOf(activeElement);
  }

  focusSelectedOrFirstItem() {
    const selectedItem = this.el.querySelector(
      "[data-part='item'][data-selected='true']",
    );

    if (selectedItem) {
      this.highlightItem(selectedItem);
      selectedItem.focus();
    } else {
      const focusableItems = this.getFocusableItems();
      if (focusableItems.length > 0) {
        this.highlightItem(focusableItems[0]);
        focusableItems[0].focus();
      }
    }
  }
}

// Register the component
SaladUI.register("select", SelectComponent);

export default SelectComponent;
