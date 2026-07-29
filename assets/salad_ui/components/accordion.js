// saladui/components/accordion.js
import Component from "../core/component.js";
import {
  CollectionRegistry,
  RovingFocus,
  Selection,
} from "../core/collection.js";
import SaladUI from "../index.js";

/**
 * AccordionItem class to manage individual accordion items
 * Handles state transitions and events for a single accordion item
 */
class AccordionItem extends Component {
  constructor(itemElement, parentComponent, options) {
    const { initialState = "closed" } = options || {};

    // Assign real ids before super() runs the initial updateUI()/aria pass,
    // so aria-controls/aria-labelledby never resolve to an empty string.
    const trigger = itemElement.querySelector("[data-part='item-trigger']");
    const content = itemElement.querySelector("[data-part='item-content']");
    if (trigger && !trigger.id) trigger.id = `${itemElement.id}-trigger`;
    if (content && !content.id) content.id = `${itemElement.id}-content`;

    super(itemElement, { initialState, ignoreItems: false });
    this.parent = parentComponent;
    this.value = itemElement.dataset.value;
    this.disabled = itemElement.dataset.disabled === "true";

    this.trigger = trigger;
    this.content = content;
    this.initialize();
    this.setupEvents();
  }

  // The server always renders data-state="closed" on the item element
  // (it has no way to know which items should start open — that's
  // derived client-side from the accordion's value/defaultValue), so
  // skip the base class's DOM data-state override and keep the
  // initialState computed by AccordionComponent.initializeItems().
  parseOptions() {
    try {
      const optionsString = this.el.getAttribute("data-options");
      this.options = optionsString ? JSON.parse(optionsString) : {};
    } catch (error) {
      console.error("SaladUI: Error parsing component options:", error);
      this.options = {};
    }
  }

  getComponentConfig() {
    return {
      stateMachine: {
        closed: {
          transitions: {
            open: "open",
          },
        },
        open: {
          transitions: {
            close: "closed",
          },
        },
      },
      events: {
        closed: {
          mouseMap: {
            "item-trigger": {
              click: "handleTriggerActivation",
            },
          },
          keyMap: {
            Enter: "handleTriggerActivation",
            " ": "handleTriggerActivation",
          },
        },
        open: {
          mouseMap: {
            "item-trigger": {
              click: "handleTriggerActivation",
            },
          },
          keyMap: {
            Enter: "handleTriggerActivation",
            " ": "handleTriggerActivation",
          },
        },
      },
      hiddenConfig: {
        closed: {
          "item-content": true,
        },
        open: {
          "item-content": false,
        },
      },
      ariaConfig: {
        // Resolved via this.el.querySelector rather than this.trigger/this.content:
        // getComponentConfig() runs inside super(), before those fields are
        // assigned (they're set after the super() call returns), and the
        // very first updateUI()/aria pass happens during that super() call.
        "item-trigger": {
          all: {
            controls: () =>
              this.el.querySelector("[data-part='item-content']")?.id,
          },
          open: {
            expanded: "true",
          },
          closed: {
            expanded: "false",
          },
        },
        "item-content": {
          all: {
            labelledby: () =>
              this.el.querySelector("[data-part='item-trigger']")?.id,
          },
        },
      },
    };
  }

  initialize() {
    if (this.disabled) {
      this.trigger.setAttribute("tabindex", "-1");
    } else {
      this.trigger.setAttribute("tabindex", "0");
    }
  }

  handleEvent(eventType) {
    switch (eventType) {
      case "select":
        return this.transition("open");
      case "unselect":
        return this.transition("close");
      case "focus":
        if (this.trigger && !this.disabled) {
          this.trigger.focus();
        }
        return true;
      case "blur":
        return true;
    }
  }

  handleTriggerActivation(event) {
    // The "closed" and "open" states each register their own click/keydown
    // listener for this same trigger (mouseMap/keyMap are identical between
    // the two states), so a single click or Enter/Space hits both listeners
    // in the same dispatch. toggleItem() below transitions the item
    // synchronously, so by the time the second listener's state guard
    // re-checks, it now matches too — running toggleItem() a second time
    // and immediately flipping the item back. Stamp the native event so
    // activation only actually runs once per physical click/keypress.
    if (event.__saladuiAccordionHandled) return;
    event.__saladuiAccordionHandled = true;

    event.preventDefault();
    if (!this.disabled && !this.parent.disabled) {
      this.parent.toggleItem(this);
    }
  }
}

/**
 * AccordionComponent class for SaladUI framework
 * Manages a collection of accordion items with state transitions
 */
class AccordionComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });

    // Initialize properties
    this.type = this.options.type || "single";
    this.disabled = this.options.disabled || false;

    // Initialize registry, roving focus, and selection state
    this.registry = new CollectionRegistry({
      getItemValue: (item) => item.value,
      isItemDisabled: (item) => item.disabled || this.disabled,
    });
    this.rovingFocus = new RovingFocus(this.registry);
    this.selection = new Selection(this.registry, {
      type: this.type,
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
    ];

    // Initialize accordion items
    this.initializeItems();
  }

  getComponentConfig() {
    return {
      stateMachine: {
        idle: {
          enter: () => {},
          exit: () => {},
          transitions: {},
        },
      },
      events: {
        idle: {
          keyMap: {
            ArrowUp: () => this.navigateItem("prev"),
            ArrowDown: () => this.navigateItem("next"),
            Home: () => this.navigateItem("first"),
            End: () => this.navigateItem("last"),
          },
        },
      },
    };
  }

  initializeItems() {
    const itemElements = Array.from(
      this.el.querySelectorAll("[data-part='item']"),
    );

    this.items = itemElements.map((element) => {
      // Initialize AccordionItem without hook context
      const itemValue = element.dataset.value;
      element.id = `${this.el.id}-item-${itemValue}`;

      // Check if this item is initially open
      const isOpen = this.selection.getValue(true).includes(itemValue);
      const item = new AccordionItem(element, this, {
        initialState: isOpen ? "open" : "closed",
      });
      const collectionItem = this.registry.add(item);
      this.selection.initializeItem(collectionItem);
      return item;
    });
  }

  toggleItem(item) {
    const collectionItem = this.registry.getItemByInstance(item);
    if (!collectionItem) return;

    // Toggle item selection
    this.selection.select(collectionItem);

    // Emit event with current value
    const value = this.selection.getValue();
    this.pushEvent("value-changed", { value });
  }

  navigateItem(direction) {
    const currentFocus = document.activeElement;
    const currentItemElement = currentFocus?.closest("[data-part='item']");
    let currentItem = null;

    if (currentItemElement) {
      currentItem = this.items.find((item) => item.el === currentItemElement);
    }

    let referenceCollectionItem = null;
    if (currentItem) {
      referenceCollectionItem = this.registry.getItemByInstance(currentItem);
    }

    // Get the target item using the registry's navigation methods
    const targetItem = this.registry.getItem(
      direction,
      referenceCollectionItem,
    );

    if (targetItem) {
      this.rovingFocus.focus(targetItem);
    }
  }
}

// Register the component
SaladUI.register("accordion", AccordionComponent);

export default AccordionComponent;
