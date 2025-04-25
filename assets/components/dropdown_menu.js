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
    const { initialState = "normal" } = options || {};
    super(itemElement, { initialState, ignoreItems: false });

    this.parent = parentComponent;
    this.value =
      itemElement.getAttribute("data-value") || itemElement.textContent.trim();
    this.disabled = itemElement.getAttribute("data-disabled") === "true";
    this.variant = itemElement.getAttribute("data-variant") || "default";

    this.setupEvents();
  }

  getComponentConfig() {
    return {
      stateMachine: {
        normal: {
          transitions: {
            focus: "focused",
          },
        },
        focused: {
          transitions: {
            blur: "normal",
          },
        },
      },
      events: {
        normal: {
          mouseMap: {
            item: {
              click: "handleActivation",
              mouseenter: "handleMouseEnter",
            },
          },
        },
        focused: {
          mouseMap: {
            item: {
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
      ariaConfig: {
        item: {
          all: {
            role: this.getAriaRole(),
            disabled: () => (this.disabled ? "true" : null),
          },
          focused: {
            selected: "true",
          },
          normal: {
            selected: "false",
          },
        },
      },
    };
  }

  getAriaRole() {
    return "menuitem";
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
      case "select":
        if (!this.disabled) {
          this.handleActivation();
        }
        return true;
    }
  }

  handleActivation(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.disabled) return;

    // Implementation to be provided by subclasses
  }

  handleMouseEnter() {
    if (!this.disabled) {
      this.parent.handleItemFocus(this);
    }
  }

  handleMouseLeave() {
    // Optionally handle mouse leave event
  }
}

/**
 * Regular dropdown menu item implementation
 */
class DropdownMenuItem extends DropdownMenuItemBase {
  constructor(itemElement, parentComponent, options) {
    super(itemElement, parentComponent, options);
  }

  handleActivation(event) {
    super.handleActivation(event);
    if (this.disabled) return;

    this.parent.selectItem(this);
  }
}

/**
 * Checkbox item implementation that can toggle between checked states
 */
class DropdownMenuCheckboxItem extends DropdownMenuItemBase {
  constructor(itemElement, parentComponent, options) {
    super(itemElement, parentComponent, options);
    this.checked = itemElement.getAttribute("data-checked") === "true";
  }

  getAriaRole() {
    return "menuitemcheckbox";
  }

  getComponentConfig() {
    const config = super.getComponentConfig();

    // Add checked state to ARIA attributes
    config.ariaConfig.item.all.checked = () => this.checked.toString();

    return config;
  }

  handleEvent(eventType) {
    const result = super.handleEvent(eventType);

    switch (eventType) {
      case "check":
        if (!this.disabled) {
          this.checked = true;
          this.updateIndicator();
        }
        return true;
      case "uncheck":
        if (!this.disabled) {
          this.checked = false;
          this.updateIndicator();
        }
        return true;
    }

    return result;
  }

  handleActivation(event) {
    super.handleActivation(event);
    if (this.disabled) return;

    // Toggle checked state
    this.checked = !this.checked;
    this.updateIndicator();

    // Notify parent
    this.parent.handleItemCheckedChange(this, this.checked);
  }

  updateIndicator() {
    const indicator = this.el.querySelector("[data-part='item-indicator']");
    if (indicator) {
      indicator.setAttribute(
        "data-state",
        this.checked ? "checked" : "unchecked",
      );

      // Update hidden state on SVG icon
      const icon = indicator.querySelector("svg");
      if (icon) {
        icon.hidden = !this.checked;
      }
    }
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
            select: "closed",
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
              click: "toggle",
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
    // Handle item selection
    if (item.disabled) return;

    // Close the dropdown
    this.transition("select");

    // Push event for selected item
    if (item instanceof DropdownMenuItem) {
      // Only regular items should trigger on-select
      this.pushEvent("item-selected", {
        value: item.value,
        variant: item.variant,
      });
    }
  }

  handleItemCheckedChange(item, checked) {
    // Handle checkbox item changes
    this.pushEvent("checked-changed", {
      value: item.value,
      checked,
    });
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
