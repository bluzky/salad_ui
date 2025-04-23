// saladui/components/dropdown_menu.js
import Component from "../core/component";
import SaladUI from "../index";
import PositionedElement from "../core/positioned-element";
import Collection from "../core/collection";

class DropdownMenuComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });

    // Initialize core properties
    this.trigger = this.getPart("trigger");
    this.positioner = this.getPart("positioner");
    this.content = this.positioner
      ? this.positioner.querySelector("[data-part='content']")
      : null;

    this.items = Array.from(this.el.querySelectorAll("[data-part='item']"));

    // Initialize collection for keyboard navigation
    this.initializeCollection();

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = [
      "Escape",
      "ArrowDown",
      "ArrowUp",
      "Home",
      "End",
      "Enter",
      " ",
    ];
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
        },
        open: {
          keyMap: {
            Escape: "close",
            ArrowDown: () => this.navigateItem("next"),
            ArrowUp: () => this.navigateItem("prev"),
            Home: () => this.navigateItem("first"),
            End: () => this.navigateItem("last"),
            " ": (e) => this.activateItem(e),
            Enter: (e) => this.activateItem(e),
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
        item: {
          all: {
            role: "menuitem",
            tabindex: (el) =>
              el.getAttribute("data-disabled") === "true" ? "-1" : "0",
          },
        },
        group: {
          all: {
            role: "group",
          },
        },
      },
    };
  }

  initializeCollection() {
    this.collection = new Collection({
      type: "single",
      getItemValue: (item) => item.textContent.trim(),
      isItemDisabled: (item) => item.getAttribute("data-disabled") === "true",
    });

    // Register items with the collection
    this.items.forEach((item) => {
      this.collection.add(item);

      // Set IDs on items if not present
      if (!item.id) {
        const index = this.items.indexOf(item);
        item.id = `${this.el.id}-item-${index}`;
      }

      // Setup click handlers for items
      item.addEventListener("click", (e) => this.handleItemClick(e));
    });
  }

  handleItemClick(event) {
    const item = event.currentTarget;
    if (item.getAttribute("data-disabled") === "true") return;

    this.activateSelectedItem(item);
    this.transition("close");
  }

  activateSelectedItem(item) {
    // This is where you would handle the action for the selected item
    // For now we just focus the item
    item.focus();
  }

  activateItem(event) {
    // Find the currently focused item and activate it
    if (this.collection.focusedItem) {
      this.activateSelectedItem(this.collection.focusedItem.instance);
      event.preventDefault();
    }
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

      // Make sure content has an ID for ARIA attributes
      if (this.content && !this.content.id) {
        this.content.id = `${this.el.id}-content`;
      }

      // Get portal container if specified
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
          usePortal: this.options.usePortal,
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

    // Focus the first item when opened
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
    this.positionedElement?.destroy();
    this.positionedElement = null;
    this.collection = null;
  }
}

// Register the component
SaladUI.register("dropdown-menu", DropdownMenuComponent);

export default DropdownMenuComponent;
