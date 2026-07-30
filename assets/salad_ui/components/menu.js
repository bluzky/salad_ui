// saladui/components/dropdown_menu.js
import Component from "../core/component.js";
import { CollectionRegistry, RovingFocus } from "../core/collection.js";

/**
 * Base class for dropdown menu items that provides common functionality
 */
class MenuItemBase extends Component {
  constructor(itemElement, parentComponent, options) {
    super(itemElement, {
      ...options,
      initialState: options?.initialState || "idle",
      ignoreItems: false,
    });

    this.parent = parentComponent;
    // share the same hook context with the parent
    this.hook = this.parent.hook;
    this.value =
      itemElement.value ||
      itemElement.getAttribute("data-value") ||
      itemElement.textContent.trim();
    this.disabled = this.isElementDisabled(itemElement);
    this.config.preventDefaultKeys = [" ", "Enter"];
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
          this.el.focus();
        }
        return true;
      case "blur":
        return true;
    }
  }

  handleActivation(event) {
    if (!this.notifyActivation(event)) return;

    this.parent.selectItem(this);
  }

  // Shared activation bookkeeping: guards, prevents the native action, and
  // notifies the server. Returns whether activation should proceed, so
  // subclasses (e.g. MenuCheckboxItem) can opt out of parent.selectItem()
  // (which closes the menu) while still getting this behavior.
  notifyActivation(event) {
    const shouldPreserveNativeClick =
      event?.type === "click" && this.isNativeLinkItem();

    if (event && !shouldPreserveNativeClick) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    if (this.disabled) return false;

    this.pushEvent(
      "select",
      {
        value: this.value,
      },
      this.parent.rootEl || this.parent.el,
    );

    return true;
  }

  isNativeLinkItem() {
    return this.el.matches("a[href]");
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
        "checkbox-item": {
          all: {
            role: "menuitemcheckbox",
            disabled: () => (this.disabled ? "true" : null),
            checked: () => (this.state == "checked" ? "true" : "false"),
          },
        },
      },
    };
  }

  // Overridden (not calling super.handleActivation()) so toggling a
  // checkbox item does not call parent.selectItem(), which would close the
  // menu — checkbox items stay open on toggle, matching Radix's default.
  handleActivation(event) {
    if (!this.notifyActivation(event)) return;

    this.transition("toggle");

    this.pushEvent(
      "checked-change",
      {
        value: this.value,
        checked: this.state == "checked",
      },
      this.parent.rootEl || this.parent.el,
    );
  }
}

/**
 * MenuComponent class for SaladUI framework
 * Manages a dropdown menu with support for keyboard navigation and accessibility
 */
class Menu extends Component {
  constructor(el, { hookContext, onItemSelect, rootEl }) {
    super(el, { hookContext });

    // callback for item selection
    this.onItemSelect = onItemSelect || (() => {});
    this.rootEl = rootEl;
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
            initialState:
              element.dataset.state ||
              (element.dataset.checked === "true" ? "checked" : "unchecked"),
          });
        default: // Regular item
          return new MenuItem(element, this, {
            initialState: "idle",
          });
      }
    });
  }

  initializeCollection() {
    // Initialize registry and focus manager for navigation
    this.registry = new CollectionRegistry({
      type: "single",
      getItemValue: (item) => item.value,
      isItemDisabled: (item) => item.disabled,
    });
    this.rovingFocus = new RovingFocus(this.registry);

    // Register items with the registry
    this.menuItems.forEach((item) => {
      this.registry.add(item);
    });
  }

  // Activate menu, focusthe first item
  activate() {
    const firstItem = this.registry.getItem("first");
    if (firstItem) {
      this.rovingFocus.focus(firstItem);
    }
  }

  selectItem(item) {
    if (item.disabled) return;
    this.onItemSelect(item);
  }

  handleItemFocus(item) {
    const collectionItem = this.registry.getItemByInstance(item);
    if (!collectionItem) return;

    this.rovingFocus.focus(collectionItem);
  }

  navigateItem(direction) {
    // Check if we have an active focused item
    let currentItem = this.rovingFocus.focusedItem;

    // Get target item using registry navigation methods
    const targetItem = this.registry.getItem(direction, currentItem);

    if (targetItem) {
      this.rovingFocus.focus(targetItem);
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

    // Clean up registry and focus manager
    this.registry = null;
    this.rovingFocus = null;
  }
}

// Register the component

export default Menu;
