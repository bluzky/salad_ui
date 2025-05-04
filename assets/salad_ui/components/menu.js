// saladui/components/dropdown_menu.js
import Component from "../core/component";
import Collection from "../core/collection";

/**
 * Base class for dropdown menu items that provides common functionality
 */
class MenuItemBase extends Component {
  constructor(itemElement, parentComponent, options) {
    super(itemElement, {
      ...options,
      initialState: "idle",
      ignoreItems: false,
    });

    this.parent = parentComponent;
    // share the same hook context with the parent
    this.hook = this.parent.hook;
    this.value =
      itemElement.value ||
      itemElement.getAttribute("data-value") ||
      itemElement.textContent.trim();
    this.disabled = itemElement.getAttribute("data-disabled") !== null;
    this.config.preventDefaultKeys = [" ", "Enter"];
    this.setupEvents();
  }

  getComponentConfig() {
    return {
      stateMachine: {
        idle: {},
      },
      events: {
        idle: {
          mouseMap: {
            item: {
              click: "handleActivation",
              mouseenter: "handleMouseEnter",
            },
          },
          keyMap: {
            " ": "handleActivation",
            Enter: "handleActivation",
          },
        },
      },
      ariaConfig: {
        item: {
          all: {
            role: "menuitem",
            disabled: () => (this.disabled ? "true" : null),
          },
        },
      },
    };
  }

  handleEvent(eventType) {
    switch (eventType) {
      case "focus":
        if (!this.disabled) {
          this.transition("focus");
          this.el.focus();
        }
        return true;
      case "blur":
        this.transition("blur");
        return true;
    }
  }

  handleActivation(event) {
    if (this.disabled) return;
    this.pushEvent(
      "item-selected",
      {
        value: this.value,
      },
      this.parent.el,
    );

    this.parent.selectItem(this);
  }

  handleMouseEnter() {
    if (!this.disabled) {
      this.parent.handleItemFocus(this);
    }
  }
}

/**
 * Regular dropdown menu item implementation
 */
class MenuItem extends MenuItemBase {
  constructor(itemElement, parentComponent, options) {
    super(itemElement, parentComponent, options);
  }
}

/**
 * Checkbox item implementation that can toggle between checked states
 */
class MenuCheckboxItem extends MenuItemBase {
  constructor(itemElement, parentComponent, options) {
    super(itemElement, parentComponent, options);
  }

  getComponentConfig() {
    return {
      stateMachine: {
        checked: {
          transitions: {
            toggle: "unchecked",
          },
        },
        unchecked: {
          transitions: {
            toggle: "checked",
          },
        },
      },
      events: {
        checked: {
          mouseMap: {
            "checkbox-item": {
              click: "handleActivation",
              mouseleave: "handleMouseLeave",
            },
          },
          keyMap: {
            " ": "handleActivation",
            Enter: "handleActivation",
          },
        },
        unchecked: {
          mouseMap: {
            "checkbox-item": {
              click: "handleActivation",
              mouseleave: "handleMouseLeave",
            },
          },
          keyMap: {
            " ": "handleActivation",
            Enter: "handleActivation",
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
            role: "menuitemcheckbox",
            disabled: () => (this.disabled ? "true" : null),
            checked: () => (this.state == "checked" ? "true" : "false"),
          },
        },
      },
    };
  }

  handleActivation(event) {
    super.handleActivation(event);
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    if (this.disabled) return;

    this.transition("toggle");

    this.pushEvent(
      "checked-changed",
      {
        value: this.value,
        checked: this.state == "checked",
      },
      this.parent.el,
    );
  }
}

/**
 * MenuComponent class for SaladUI framework
 * Manages a dropdown menu with support for keyboard navigation and accessibility
 */
class Menu extends Component {
  constructor(el, { hookContext, onItemSelect }) {
    super(el, { hookContext });

    // callback for item selection
    this.onItemSelect = onItemSelect || (() => {});
    this.menuItems = [];

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = ["ArrowDown", "ArrowUp", "Home", "End"];

    // Initialize items and collection
    this.initializeItems();
    this.initializeCollection();
    this.setupEvents();
  }

  getComponentConfig() {
    return {
      stateMachine: {
        idle: {
          transitions: {},
        },
      },
      events: {
        _all: {
          keyMap: {
            ArrowDown: () => this.navigateItem("next"),
            ArrowUp: () => this.navigateItem("prev"),
            Home: () => this.navigateItem("first"),
            End: () => this.navigateItem("last"),
          },
        },
      },
      ariaConfig: {},
    };
  }

  initializeItems() {
    // Get all items in the correct DOM order
    const allItemElements = Array.from(
      this.el.querySelectorAll(
        "[data-part='item'], [data-part='checkbox-item']",
      ),
    );

    // Create appropriate item components while preserving original order
    this.menuItems = allItemElements.map((element) => {
      const itemType = element.getAttribute("data-part");

      switch (itemType) {
        case "checkbox-item":
          return new MenuCheckboxItem(element, this, {
            initialState: "normal",
          });
        default: // Regular item
          return new MenuItem(element, this, {
            initialState: "normal",
          });
      }
    });
  }

  initializeCollection() {
    // Initialize collection manager for navigation
    this.collection = new Collection({
      type: "single",
      getItemValue: (item) => item.value,
      isItemDisabled: (item) => item.disabled,
    });

    // Register items with the collection
    this.menuItems.forEach((item) => {
      this.collection.add(item);
    });
  }

  // Activate menu, focusthe first item
  activate() {
    const firstItem = this.collection.getItem("first");
    if (firstItem) {
      this.collection.focus(firstItem);
    }
  }

  selectItem(item) {
    if (item.disabled) return;
    this.onItemSelect(item);
  }

  handleItemFocus(item) {
    const collectionItem = this.collection.getItemByInstance(item);
    if (!collectionItem) return;

    this.collection.focus(collectionItem);
  }

  navigateItem(direction) {
    // Check if we have an active focused item
    let currentItem = this.collection.focusedItem;

    // Get target item using collection's navigation methods
    const targetItem = this.collection.getItem(direction, currentItem);

    if (targetItem) {
      this.collection.focus(targetItem);
    }
  }

  beforeDestroy() {
    // Clean up menu items
    if (this.menuItems) {
      this.menuItems.forEach((item) => {
        if (typeof item.destroy === "function") {
          item.destroy();
        }
      });
      this.menuItems = null;
    }

    // Clean up collection
    this.collection = null;
  }
}

// Register the component

export default Menu;
