// saladui/components/select.js
import Component from "../core/component";
import SaladUI from "../index";
import Collection from "../core/collection";
import PositionedElement from "../core/positioned-element";

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
    this.disabled = itemElement.dataset.disabled === "true";
    this.label = itemElement.textContent.trim();

    this.setupEvents();
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
    event.stopPropagation();
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

    // Get configuration from options
    this.multiple = this.options.multiple || false;
    this.usePortal = this.options.hasOwnProperty("usePortal")
      ? this.options.usePortal
      : false;
    this.portalContainer = this.options.portalContainer || null;

    // Initialize collection manager
    this.collection = new Collection({
      type: this.multiple ? "multiple" : "single",
      defaultValue: this.options.defaultValue,
      value: this.options.value,
      getItemValue: (item) => item.value,
      isItemDisabled: (item) => item.disabled || this.disabled,
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
          exit: "onClosedExit",
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
          keyEventTarget: "content",
          keyMap: {
            ArrowDown: "open",
            ArrowUp: "open",
            Enter: "open",
            " ": "open",
          },
          mouseMap: {
            trigger: {
              click: "toggle",
            },
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

  initializeItems() {
    const itemElements = Array.from(
      this.el.querySelectorAll("[data-part='item']"),
    );

    itemElements.map((element) => {
      // Create a SelectItem instance for each item
      const value = element.dataset.value;

      // Check if this item is initially selected
      const isSelected = this.collection.isValueSelected(value);
      const initialState = isSelected ? "checked" : "unchecked";

      const item = new SelectItem(element, this, { initialState });
      this.collection.add(item);
    });

    // Update value display based on initial selection
    this.updateValueDisplay();
  }

  initializePlaceholder() {
    if (!this.valueDisplay) return;

    const placeholder =
      this.valueDisplay.getAttribute("data-placeholder") || "Select an option";

    // If no selection, display the placeholder
    if (this.collection.getValue(true).length === 0) {
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
    this.pushEvent("closed");
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

    this.pushEvent("opened");
  }

  onOpenExit() {
    // Deactivate positioned element
    if (this.positionedElement) {
      this.positionedElement.deactivate();
    }
  }

  // Item management
  selectValue(value) {
    const collectionItem = this.collection.getItemByValue(value);
    if (!collectionItem) return;

    // Toggle item selection
    this.collection.select(collectionItem);

    // Update value display
    this.updateValueDisplay();

    // Close dropdown if single select
    if (!this.multiple) {
      this.transition("select");
    }

    // Emit event with current value
    const selectedValue = this.collection.getValue();
    this.pushEvent("value-changed", { value: selectedValue });
  }

  handleItemFocus(item) {
    const collectionItem = this.collection.getItemByInstance(item);
    if (!collectionItem) return;

    this.collection.focus(collectionItem);
  }

  updateValueDisplay() {
    if (!this.valueDisplay) return;

    const selectedValues = this.collection.getValue(true);
    const placeholder =
      this.valueDisplay.getAttribute("data-placeholder") || "Select an option";

    if (selectedValues.length === 0) {
      // No selection, show placeholder
      this.valueDisplay.setAttribute("data-content", placeholder);
    } else if (this.multiple) {
      // Multiple selection
      if (selectedValues.length === 1) {
        // Get the label from the selected item
        const selectedItem = this.collection.getItemByValue(selectedValues[0]);
        this.valueDisplay.setAttribute(
          "data-content",
          selectedItem.instance.label,
        );
      } else {
        // Show count for multiple selections
        this.valueDisplay.setAttribute(
          "data-content",
          `${selectedValues.length} items selected`,
        );
      }
    } else {
      // Single selection - get label from the selected item
      const selectedItem = this.collection.getItemByValue(selectedValues[0]);
      this.valueDisplay.setAttribute(
        "data-content",
        selectedItem.instance.label,
      );
    }
  }

  // Navigation methods
  navigateItem(direction) {
    // Check if we have an active highlighted item
    let currentItem = this.collection.focusedItem;

    // If not, use the first selected item or null
    if (!currentItem) {
      currentItem =
        this.collection.getValue(true).length > 0
          ? this.collection.getItemByValue(this.collection.getValue(true)[0])
          : null;
    }

    // Get target item using collection's navigation methods
    const targetItem = this.collection.getItem(direction, currentItem);

    if (targetItem) {
      this.collection.focus(targetItem);
    }
  }

  highlightFirstSelectedOrFirstItem() {
    // Try to highlight the first selected item
    const selectedValue = this.collection.getValue();

    const selectedItem =
      this.collection.getItemByValue(selectedValue) ||
      this.collection.getItem("first");
    if (selectedItem) {
      this.collection.focus(selectedItem);
    }
  }

  // Form integration
  syncHiddenInputs() {
    // Get the selected values
    const values = this.collection.getValue(true);
    const name = this.options.name || "";

    // Remove existing hidden inputs
    const existingInputs = this.el.querySelectorAll("input[type='hidden']");
    existingInputs.forEach((input) => input.remove());

    // Create new hidden inputs
    if (this.multiple) {
      // Multiple select - create multiple inputs with array notation
      const inputName = name ? `${name}[]` : "";

      values.forEach((value) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = inputName;
        input.value = value;
        this.el.appendChild(input);
      });
    } else if (values.length > 0) {
      // Single select - create one input
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = values[0];
      this.el.appendChild(input);
    }
  }

  // Cleanup
  beforeDestroy() {
    if (this.positionedElement) {
      this.positionedElement.destroy();
      this.positionedElement = null;
    }

    // Clean up item instances
    this.collection.each((item) => {
      if (typeof item.destroy === "function") {
        item.destroy();
      }
    });

    this.collection = null;
  }
}

// Register the component
SaladUI.register("select", SelectComponent);

export default SelectComponent;
