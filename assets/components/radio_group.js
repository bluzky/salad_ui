// saladui/components/radio_group.js
import Component from "../core/component";
import SaladUI from "../index";
import Collection from "../core/collection";

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
    this.collection = new Collection({
      type: "single",
      defaultValue: this.options.initialValue,
      getItemValue: (item) => item.getAttribute("data-value"),
      isItemDisabled: (item) => item.getAttribute("data-disabled") === "true",
    });

    // Register items with the collection
    this.items.forEach((item) => {
      this.collection.add(item);

      // Set initial ID if not present
      if (!item.id) {
        const value = item.getAttribute("data-value");
        item.id = `${this.el.id}-item-${value}`;
      }
    });

    // Initialize UI state
    this.updateItemStates();
  }

  handleItemClick(event) {
    const item = event.currentTarget;
    if (item.getAttribute("data-disabled") === "true") return;

    this.selectItem(item);
  }

  selectItem(item) {
    const value = item.getAttribute("data-value");
    const previousValue = this.collection.getValue();

    // Get the collection item
    const collectionItem = this.collection.getItemByInstance(item);

    // Only proceed if we have a valid item and it's not already selected
    if (collectionItem && value !== previousValue) {
      // Transition the state machine to apply any state-specific behavior
      this.transition("valueChanged", { value, previousValue });

      this.collection.select(collectionItem);
      this.updateItemStates();

      // Emit value changed event
      this.pushEvent("value-changed", {
        value,
        previousValue,
      });
    }
  }

  updateItemStates() {
    const selectedValue = this.collection.getValue();

    // Loop over collection items instead of DOM elements directly
    this.collection.items.forEach((collectionItem) => {
      const item = collectionItem.instance;
      const value = collectionItem.value;
      const isSelected = value === selectedValue;
      const isDisabled = item.getAttribute("data-disabled") === "true";

      // Update visual state
      item.setAttribute("data-state", isSelected ? "checked" : "unchecked");

      // Update ARIA attributes
      item.setAttribute("aria-checked", isSelected.toString());

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
    const currentValue = this.collection.getValue();
    const currentItem = this.collection.getItemByValue(currentValue);

    // Get next item based on direction
    const nextItem = this.collection.getItem(direction, currentItem);
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
    if (!this.collection.getValue()) {
      const firstItem = this.collection.getItem("first");
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
        const selectedValue = this.collection.getValue();
        if (selectedValue) {
          // Focus the selected item
          const selectedItem = this.collection.getItemByValue(selectedValue);
          if (selectedItem && selectedItem.instance) {
            selectedItem.instance.focus();
          }
        } else {
          // Focus the first enabled item if none is selected
          const firstItem = this.collection.getItem("first");
          if (firstItem && firstItem.instance) {
            firstItem.instance.focus();
          }
        }
      }
    });
  }

  // Clean up when the component is destroyed
  beforeDestroy() {
    this.collection = null;
  }
}

// Register the component
SaladUI.register("radio-group", RadioGroupComponent);

export default RadioGroupComponent;
