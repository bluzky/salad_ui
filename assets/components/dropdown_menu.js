// saladui/components/dropdown_menu.js
import Component from "../core/component";
import SaladUI from "../index";
import PositionedElement from "../core/positioned-element";
import Collection from "../core/collection";

/**
 * Base class for dropdown menu items that provides common functionality
 */
class DropdownMenuItemBase extends Component {
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
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

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
class DropdownMenuItem extends DropdownMenuItemBase {
  constructor(itemElement, parentComponent, options) {
    super(itemElement, parentComponent, options);
  }
}

/**
 * Checkbox item implementation that can toggle between checked states
 */
class DropdownMenuCheckboxItem extends DropdownMenuItemBase {
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
 * DropdownMenuComponent class for SaladUI framework
 * Manages a dropdown menu with support for keyboard navigation and accessibility
 */
class DropdownMenuComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });

    // Initialize core properties
    this.trigger = this.getPart("trigger");
    this.positioner = this.getPart("positioner");
    this.content = this.positioner
      ? this.positioner.querySelector("[data-part='content']")
      : null;

    this.menuItems = [];

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = [
      "Escape",
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Enter",
      " ",
    ];

    // Initialize items and collection
    this.initializeItems();
    this.initializeCollection();
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
          transitions: {
            close: "closed",
            toggle: "closed",
          },
        },
      },
      events: {
        closed: {
          keyMap: {
            ArrowDown: "open",
            " ": "open",
            Enter: "open",
          },
          mouseMap: {
            trigger: {
              click: (_e) => {
                this.transition("open");
              },
            },
          },
        },
        open: {
          keyMap: {
            Escape: "close",
            ArrowDown: () => this.navigateItem("next"),
            ArrowUp: () => this.navigateItem("prev"),
            Home: () => this.navigateItem("first"),
            End: () => this.navigateItem("last"),
          },
        },
      },
      hiddenConfig: {
        closed: {
          positioner: true, // Hide the positioner in closed state
        },
        open: {
          positioner: false, // Show the positioner in open state
        },
      },
      ariaConfig: {
        trigger: {
          all: {
            haspopup: "menu",
            controls: () =>
              this.content ? this.content.id || `${this.el.id}-content` : null,
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
            role: "menu",
          },
        },
      },
    };
  }

  initializeItems() {
    // Get all items in the correct DOM order
    const allItemElements = Array.from(
      this.content.querySelectorAll(
        "[data-part='item'], [data-part='checkbox-item']",
      ),
    );

    // Create appropriate item components while preserving original order
    this.menuItems = allItemElements.map((element) => {
      const itemType = element.getAttribute("data-part");

      switch (itemType) {
        case "checkbox-item":
          return new DropdownMenuCheckboxItem(element, this, {
            initialState: "normal",
          });
        default: // Regular item
          return new DropdownMenuItem(element, this, {
            initialState: "normal",
          });
      }
    });

    // Make sure content has an ID for ARIA attributes
    if (this.content && !this.content.id) {
      this.content.id = `${this.el.id}-content`;
    }
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

  selectItem(item) {
    if (item.disabled) return;
    this.transition("close");
  }

  handleItemFocus(item) {
    const collectionItem = this.collection.getItemByInstance(item);
    if (!collectionItem) return;

    this.collection.focus(collectionItem);
  }

  initializePositionedElement() {
    if (this.positioner && this.trigger && !this.positionedElement) {
      const side = this.positioner.getAttribute("data-side") || "bottom";
      const align = this.positioner.getAttribute("data-align") || "start";
      const sideOffset = parseInt(
        this.positioner.getAttribute("data-side-offset") || "4",
        10,
      );
      const alignOffset = parseInt(
        this.positioner.getAttribute("data-align-offset") || "0",
        10,
      );

      // Get portal options
      const usePortal = this.options.usePortal === true;
      let portalContainer = null;
      if (this.options.portalContainer) {
        portalContainer = document.querySelector(this.options.portalContainer);
      }

      this.positionedElement = new PositionedElement(
        this.positioner,
        this.trigger,
        {
          placement: side,
          alignment: align,
          sideOffset,
          alignOffset,
          flip: true,
          usePortal,
          portalContainer: portalContainer || document.body,
          trapFocus: false,
          onOutsideClick: () => this.transition("close"),
        },
      );
    }
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

  onOpenEnter() {
    this.initializePositionedElement();
    this.positionedElement?.activate();

    // Focus the first enabled item when opened
    const firstItem = this.collection.getItem("first");
    if (firstItem) {
      this.collection.focus(firstItem);
    }

    this.pushEvent("opened");
  }

  onClosedEnter() {
    this.positionedElement?.deactivate();
    this.pushEvent("closed");
    this.trigger.querySelector("button").focus();
  }

  beforeDestroy() {
    // Clean up the positioned element
    if (this.positionedElement) {
      this.positionedElement.destroy();
      this.positionedElement = null;
    }

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
SaladUI.register("dropdown-menu", DropdownMenuComponent);

export default DropdownMenuComponent;
