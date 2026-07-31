// saladui/components/select.js
import Component from "../core/component.js";
import SaladUI from "../index.js";
import {
  CollectionRegistry,
  RovingFocus,
  Selection,
} from "../core/collection.js";
import PositionedElement from "../core/positioned-element.js";

/**
 * SelectItem class to manage individual select options
 * Handles state transitions and events for a single select item
 */
class SelectItem extends Component {
  constructor(itemElement, parentComponent, options) {
    const { initialState = "normal" } = options || {};
    super(itemElement, { initialState, ignoreItems: false });

    this.parent = parentComponent;
    this.value = itemElement.dataset.value;
    this.disabled = this.isElementDisabled(itemElement);
    this.label = itemElement.textContent.trim();

    this.setupEvents();
  }

  isElementDisabled(itemElement) {
    const dataDisabled = itemElement.getAttribute("data-disabled");

    return (
      itemElement.hasAttribute("disabled") ||
      itemElement.getAttribute("aria-disabled") === "true" ||
      (dataDisabled !== null && dataDisabled !== "false")
    );
  }

  getComponentConfig() {
    return {
      stateMachine: {
        unchecked: {
          transitions: {
            check: "checked",
          },
        },
        checked: {
          transitions: {
            uncheck: "unchecked",
          },
        },
      },
      events: {
        unchecked: {
          mouseMap: {
            item: {
              click: "handleActivation",
              mouseenter: "handleMouseEnter",
              mouseleave: "handleMouseLeave",
            },
          },
          keyMap: {
            Enter: "handleActivation",
            " ": "handleActivation",
          },
        },
        checked: {
          mouseMap: {
            item: {
              click: "handleActivation",
              mouseenter: "handleMouseEnter",
              mouseleave: "handleMouseLeave",
            },
          },
          keyMap: {
            Enter: "handleActivation",
            " ": "handleActivation",
          },
        },
      },
      hiddenConfig: {
        checked: {
          "item-indicator": false,
        },
        unchecked: {
          "item-indicator": true,
        },
      },
      ariaConfig: {
        item: {
          all: {
            role: "option",
          },
          checked: {
            selected: "true",
          },
          unchecked: {
            selected: "false",
          },
        },
      },
    };
  }

  handleEvent(eventType) {
    switch (eventType) {
      case "select":
        return this.transition("check");
      case "unselect":
        return this.transition("uncheck");
      case "focus":
        if (!this.disabled) {
          // Just mark as highlighted without direct focus
          this.el.focus();
        }
        return true;
      case "blur":
        return true;
    }
  }

  handleActivation(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!this.disabled) {
      this.parent.selectValue(this.value);
    }
  }

  handleMouseEnter() {
    if (!this.disabled) {
      this.parent.handleItemFocus(this);
    }
  }
}

/**
 * SelectComponent class for SaladUI framework
 * Manages a collection of select items with state transitions
 */
class SelectComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });

    // Initialize core properties
    this.trigger = this.getPart("trigger");
    this.valueDisplay = this.getPart("value");
    this.content = this.getPart("content");
    this.disabled = this.el.dataset.disabled === "true";
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleTriggerKeydown = this.handleTriggerKeydown.bind(this);

    // Get configuration from options
    this.multiple = this.options.multiple || false;
    this.usePortal = Object.hasOwn(this.options, "usePortal")
      ? this.options.usePortal
      : false;
    this.portalContainer = this.options.portalContainer || null;

    // Initialize item registry, focus manager, and selection state
    this.registry = new CollectionRegistry({
      getItemValue: (item) => item.value,
      isItemDisabled: (item) => item.disabled || this.disabled,
    });
    this.rovingFocus = new RovingFocus(this.registry);
    this.selection = new Selection(this.registry, {
      type: this.multiple ? "multiple" : "single",
      defaultValue: this.options.defaultValue,
      value: this.options.value,
    });

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = [
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Enter",
      " ",
      "Escape",
    ];

    // Initialize select items
    this.initializeItems();
    this.initializePlaceholder();
  }

  getComponentConfig() {
    return {
      stateMachine: {
        closed: {
          enter: "onClosedEnter",
          transitions: {
            open: "open",
            toggle: "open",
          },
        },
        open: {
          enter: "onOpenEnter",
          exit: "onOpenExit",
          transitions: {
            close: "closed",
            toggle: "closed",
            select: "closed",
          },
        },
      },
      events: {
        closed: {
          keyEventTarget: "trigger",
          keyMap: {
            ArrowDown: () => this.openIfEnabled(),
            ArrowUp: () => this.openIfEnabled(),
            Enter: () => this.openIfEnabled(),
            " ": () => this.openIfEnabled(),
          },
        },
        open: {
          keyEventTarget: "content",
          keyMap: {
            Escape: "close",
            ArrowUp: () => this.navigateItem("prev"),
            ArrowDown: () => this.navigateItem("next"),
            Home: () => this.navigateItem("first"),
            End: () => this.navigateItem("last"),
          },
        },
      },
      hiddenConfig: {
        closed: {
          content: true,
        },
        open: {
          content: false,
        },
      },
      ariaConfig: {
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
        },
      },
    };
  }

  setupComponentEvents() {
    super.setupComponentEvents();

    this.trigger?.addEventListener("click", this.handleTriggerClick);
    this.trigger?.addEventListener("keydown", this.handleTriggerKeydown);
  }

  teardownComponentEvents() {
    super.teardownComponentEvents();

    this.trigger?.removeEventListener("click", this.handleTriggerClick);
    this.trigger?.removeEventListener("keydown", this.handleTriggerKeydown);
  }

  handleTriggerClick() {
    if (this.disabled) return;

    this.transition(this.state === "open" ? "close" : "open");
  }

  openIfEnabled() {
    if (this.disabled) return;

    this.transition("open");
  }

  handleTriggerKeydown(event) {
    if (event.defaultPrevented || this.disabled || this.state !== "open")
      return;

    const keyActions = {
      ArrowUp: () => this.navigateItem("prev"),
      ArrowDown: () => this.navigateItem("next"),
      Home: () => this.navigateItem("first"),
      End: () => this.navigateItem("last"),
      Escape: () => this.transition("close"),
      Enter: () => this.transition("close"),
      " ": () => this.transition("close"),
    };
    const action = keyActions[event.key];
    if (!action) return;

    event.preventDefault();
    event.stopPropagation();
    action();
  }

  initializeItems() {
    const itemElements = Array.from(
      this.el.querySelectorAll("[data-part='item']"),
    );

    itemElements.forEach((element) => {
      // Create a SelectItem instance for each item
      const value = element.dataset.value;

      // Check if this item is initially selected
      const isSelected = this.selection.isValueSelected(value);
      const initialState = isSelected ? "checked" : "unchecked";

      const item = new SelectItem(element, this, { initialState });
      const collectionItem = this.registry.add(item);
      this.selection.initializeItem(collectionItem);
    });

    // Update value display based on initial selection
    this.updateValueDisplay();
    this.syncHiddenInputs();
  }

  initializePlaceholder() {
    if (!this.valueDisplay) return;

    const placeholder =
      this.valueDisplay.getAttribute("data-placeholder") || "Select an option";

    // If no selection, display the placeholder
    if (this.selection.getValue(true).length === 0) {
      this.valueDisplay.setAttribute("data-content", placeholder);
    }
  }

  initializePositionedElement() {
    if (this.content && this.trigger && !this.positionedElement) {
      // Extract position config from content attributes
      const side = this.content.getAttribute("data-side") || "bottom";

      // Get portal container if specified
      let portalContainer = null;
      if (this.portalContainer) {
        portalContainer = document.querySelector(this.portalContainer);
      }

      // Create positioned element with modular architecture
      this.positionedElement = new PositionedElement(this.content, this.el, {
        placement: side,
        alignment: "start",
        sideOffset: 4,
        flip: true,
        usePortal: this.usePortal,
        portalContainer: portalContainer || document.body,
        trapFocus: false,
        onOutsideClick: () => this.transition("close"),
      });
    }
  }

  // State machine handlers
  onClosedEnter() {
    // Update hidden input(s)
    this.syncHiddenInputs();
    this.pushEvent("close");
  }

  onOpenEnter() {
    // Initialize positioned element
    this.initializePositionedElement();

    // Activate positioned element
    if (this.positionedElement) {
      this.positionedElement.activate();
    }

    // Highlight first selected item or first item
    this.highlightFirstSelectedOrFirstItem();
    window.requestAnimationFrame(() => {
      if (this.destroyed || typeof document === "undefined") return;

      if (
        this.state === "open" &&
        !this.content?.contains(document.activeElement)
      ) {
        this.highlightFirstSelectedOrFirstItem();
      }
    });

    this.pushEvent("open");
  }

  onOpenExit() {
    // Deactivate positioned element
    if (this.positionedElement) {
      this.positionedElement.deactivate();
    }

    this.trigger?.focus({ preventScroll: true });
  }

  // Item management
  selectValue(value) {
    const collectionItem = this.registry.getItemByValue(value);
    if (!collectionItem) return;

    // Toggle item selection
    this.selection.select(collectionItem);

    // Update value display
    this.updateValueDisplay();

    // Keep forms in sync immediately, not only after close
    this.syncHiddenInputs();
    this.dispatchFormEvents();

    // Close dropdown if single select
    if (!this.multiple) {
      this.transition("select");
    }

    // Emit event with current value
    const selectedValue = this.selection.getValue();
    this.pushEvent("value-changed", { value: selectedValue });
  }

  handleItemFocus(item) {
    const collectionItem = this.registry.getItemByInstance(item);
    if (!collectionItem) return;

    this.rovingFocus.focus(collectionItem);
  }

  updateValueDisplay() {
    if (!this.valueDisplay) return;

    const selectedValues = this.selection.getValue(true);
    const placeholder =
      this.valueDisplay.getAttribute("data-placeholder") || "Select an option";

    if (selectedValues.length === 0) {
      // No selection, show placeholder
      this.setValueDisplayText(placeholder);
    } else if (this.multiple) {
      // Multiple selection
      if (selectedValues.length === 1) {
        // Get the label from the selected item
        const selectedItem = this.registry.getItemByValue(selectedValues[0]);
        this.setValueDisplayText(
          selectedItem?.instance.label || selectedValues[0],
        );
      } else {
        // Show count for multiple selections
        this.setValueDisplayText(`${selectedValues.length} items selected`);
      }
    } else {
      // Single selection - get label from the selected item
      const selectedItem = this.registry.getItemByValue(selectedValues[0]);
      this.setValueDisplayText(
        selectedItem?.instance.label || selectedValues[0],
      );
    }
  }

  setValueDisplayText(text) {
    if (!this.valueDisplay) return;

    const value = text || "";
    this.valueDisplay.textContent = value;
    this.valueDisplay.setAttribute("data-content", value);
  }

  // Navigation methods
  navigateItem(direction) {
    // Check if we have an active highlighted item
    let currentItem = this.rovingFocus.focusedItem;

    // If not, use the first selected item or null
    if (!currentItem) {
      currentItem =
        this.selection.getValue(true).length > 0
          ? this.registry.getItemByValue(this.selection.getValue(true)[0])
          : null;
    }

    // Get target item using registry navigation methods
    const targetItem = this.registry.getItem(direction, currentItem);

    if (targetItem) {
      this.rovingFocus.focus(targetItem);
    }
  }

  highlightFirstSelectedOrFirstItem() {
    // Try to highlight the first selected item
    const selectedValue = this.selection.getValue(true)[0];

    const selectedItem =
      this.registry.getItemByValue(selectedValue) ||
      this.registry.getItem("first");
    if (selectedItem) {
      this.rovingFocus.focus(selectedItem);
    }
  }

  // Form integration
  syncHiddenInputs() {
    // Get the selected values
    const values = this.selection.getValue(true);
    const name = this.getInputName();

    // Remove existing hidden inputs
    const existingInputs = this.el.querySelectorAll(
      "input[type='hidden'][data-salad-ui-select-input='true']",
    );
    existingInputs.forEach((input) => input.remove());

    if (!name) return;

    // Create new hidden inputs
    if (this.multiple) {
      values.forEach((value) => {
        this.el.appendChild(this.createHiddenInput(name, value));
      });
    } else if (values.length > 0) {
      // Single select - create one input
      this.el.appendChild(this.createHiddenInput(name, values[0]));
    }
  }

  getInputName() {
    const name = this.options.name || "";
    if (!this.multiple || !name || name.endsWith("[]")) return name;

    return `${name}[]`;
  }

  createHiddenInput(name, value) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    input.dataset.saladUiSelectInput = "true";
    return input;
  }

  dispatchFormEvents() {
    if (!this.el.closest("form")) return;

    const hiddenInput = this.el.querySelector(
      "input[type='hidden'][data-salad-ui-select-input='true']",
    );
    const target = hiddenInput || this.el;
    target.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // Cleanup
  beforeDestroy() {
    if (this.positionedElement) {
      this.positionedElement.destroy();
      this.positionedElement = null;
    }

    // Clean up item instances
    this.registry.each((item) => {
      if (typeof item.destroy === "function") {
        item.destroy();
      }
    });

    this.registry = null;
    this.rovingFocus = null;
    this.selection = null;
  }
}

// Register the component
SaladUI.register("select", SelectComponent);

export default SelectComponent;
