// saladui/components/radio_group.js
import Component from "../core/component.js";
import SaladUI from "../index.js";
import { CollectionRegistry, Selection } from "../core/collection.js";

class RadioGroupComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext, ignoreItems: false });

    // Initialize properties
    this.items = this.getAllParts("item");

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];

    // Initialize collection manager for radio items
    this.initializeCollection();
  }

  getComponentConfig() {
    return {
      stateMachine: {
        idle: {
          enter: "onIdleEnter",
          transitions: {
            valueChanged: "idle",
          },
        },
      },
      events: {
        idle: {
          keyMap: {
            ArrowLeft: () => this.navigateItem("prev"),
            ArrowRight: () => this.navigateItem("next"),
            ArrowUp: () => this.navigateItem("prev"),
            ArrowDown: () => this.navigateItem("next"),
            Home: () => this.navigateItem("first"),
            End: () => this.navigateItem("last"),
          },
          mouseMap: {
            item: {
              click: "handleItemClick",
            },
          },
        },
      },
      ariaConfig: {
        root: {
          all: {
            role: "radiogroup",
          },
        },
        item: {
          all: {
            role: "radio",
          },
        },
      },
    };
  }

  initializeCollection() {
    this.registry = new CollectionRegistry({
      getItemValue: (item) => item.getAttribute("data-value"),
      isItemDisabled: (item) => item.getAttribute("data-disabled") === "true",
    });
    this.selection = new Selection(this.registry, {
      type: "single",
      defaultValue: this.options.initialValue,
    });

    // Register items with the registry
    this.items.forEach((item) => {
      const collectionItem = this.registry.add(item);
      this.selection.initializeItem(collectionItem);

      // Set initial ID if not present
      if (!item.id) {
        const value = item.getAttribute("data-value");
        item.id = `${this.el.id}-item-${value}`;
      }

      this.syncItemAccessibleLabel(item);
    });

    // Initialize UI state
    this.updateItemStates();
  }

  syncItemAccessibleLabel(item) {
    if (
      item.hasAttribute("aria-label") ||
      item.hasAttribute("aria-labelledby")
    ) {
      return;
    }

    const input = item.querySelector('input[type="radio"]');
    if (!input?.id) return;

    const labels = input.labels
      ? Array.from(input.labels)
      : Array.from(document.querySelectorAll("label")).filter(
          (label) => label.htmlFor === input.id,
        );

    if (labels.length === 0) return;

    const labelIds = labels.map((label, index) => {
      if (!label.id) {
        label.id = `${item.id}-label-${index}`;
      }

      return label.id;
    });

    item.setAttribute("aria-labelledby", labelIds.join(" "));
  }

  handleItemClick(event) {
    const item = event.currentTarget;
    if (item.getAttribute("data-disabled") === "true") return;

    this.selectItem(item);
  }

  selectItem(item) {
    const value = item.getAttribute("data-value");
    const previousValue = this.selection.getValue();

    // Get the collection item
    const collectionItem = this.registry.getItemByInstance(item);

    // Only proceed if we have a valid item and it's not already selected
    if (collectionItem && value !== previousValue) {
      // Transition the state machine to apply any state-specific behavior
      this.transition("valueChanged", { value, previousValue });

      this.selection.select(collectionItem);
      this.updateItemStates();
      this.dispatchFormEvents(item);

      // Emit value changed event
      this.pushEvent("value-changed", {
        value,
        previousValue,
      });
    }
  }

  dispatchFormEvents(item) {
    const input = item.querySelector('input[type="radio"]');
    if (!input) return;

    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  updateItemStates() {
    const selectedValue = this.selection.getValue();

    // Loop over collection items instead of DOM elements directly
    this.registry.items.forEach((collectionItem) => {
      const item = collectionItem.instance;
      const value = collectionItem.value;
      const isSelected = value === selectedValue;
      const isDisabled = item.getAttribute("data-disabled") === "true";

      // Update visual state
      item.setAttribute("data-state", isSelected ? "checked" : "unchecked");

      // Update ARIA attributes
      item.setAttribute("aria-checked", isSelected.toString());
      item.setAttribute("aria-disabled", isDisabled.toString());

      // Update tabindex for keyboard navigation
      item.setAttribute("tabindex", isSelected ? "0" : "-1");

      // Update native radio input if present
      const input = item.querySelector('input[type="radio"]');
      if (input) {
        input.checked = isSelected;
        input.disabled = isDisabled;

        // Ensure name attribute is set for form submission
        if (!input.name && this.options.name) {
          input.name = this.options.name;
        }
      }
    });
  }

  navigateItem(direction) {
    const currentValue = this.selection.getValue();
    const currentItem = this.registry.getItemByValue(currentValue);

    // Get next item based on direction
    const nextItem = this.registry.getItem(direction, currentItem);
    if (!nextItem) return;

    // Focus the item
    if (typeof nextItem.instance.focus === "function") {
      nextItem.instance.focus();
    } else if (nextItem.instance) {
      // Focus the item element directly
      nextItem.instance.focus();
    }

    // Automatically select the focused item
    this.selectItem(nextItem.instance);
  }

  onIdleEnter() {
    // If no item is selected, make first enabled item focusable
    if (!this.selection.getValue()) {
      const firstItem = this.registry.getItem("first");
      if (firstItem && firstItem.instance) {
        firstItem.instance.setAttribute("tabindex", "0");
      }
    }
  }

  // Handle focus management for the entire group
  setupComponentEvents() {
    super.setupComponentEvents();

    this.el.addEventListener("focus", (e) => {
      // Only handle focus if the group itself was focused (not a child)
      if (e.target === this.el) {
        const selectedValue = this.selection.getValue();
        if (selectedValue) {
          // Focus the selected item
          const selectedItem = this.registry.getItemByValue(selectedValue);
          if (selectedItem && selectedItem.instance) {
            selectedItem.instance.focus();
          }
        } else {
          // Focus the first enabled item if none is selected
          const firstItem = this.registry.getItem("first");
          if (firstItem && firstItem.instance) {
            firstItem.instance.focus();
          }
        }
      }
    });
  }

  // Clean up when the component is destroyed
  beforeDestroy() {
    this.registry = null;
    this.selection = null;
  }
}

// Register the component
SaladUI.register("radio-group", RadioGroupComponent);

export default RadioGroupComponent;
