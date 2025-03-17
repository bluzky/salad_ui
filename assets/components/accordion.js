// saladui/components/accordion.js
import Component from "../core/component";
import SaladUI from "../index";

class AccordionComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);

    // Initialize properties
    this.type = this.options.type || "single";
    this.disabled = this.options.disabled || false;
    this.items = Array.from(this.el.querySelectorAll("[data-part='item']"));

    // Parse initial value(s)
    this.value = this.parseValue(
      this.options.value || this.options.defaultValue,
    );

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = [
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Enter",
      " ",
    ];

    // Set up IDs and initial states
    this.setupIds();
    this.updateItemStates();
  }

  // Parse value to ensure it's always an array
  parseValue(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  getStateMachine() {
    return {
      idle: {
        keyMap: {
          ArrowUp: () => this.navigateItem(-1),
          ArrowDown: () => this.navigateItem(1),
          Home: () => this.navigateItem("first"),
          End: () => this.navigateItem("last"),
        },
      },
    };
  }

  getAriaConfig() {
    return {
      trigger: {
        all: {
          controls: (el) => {
            const item = el.closest("[data-part='item']");
            const content = item?.querySelector("[data-part='content']");
            return content?.id || "";
          },
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
          labelledby: (el) => {
            const item = el.closest("[data-part='item']");
            const trigger = item?.querySelector("[data-part='trigger']");
            return trigger?.id || "";
          },
        },
      },
    };
  }

  // Set up unique IDs for ARIA relationships
  setupIds() {
    this.items.forEach((item) => {
      const itemValue = item.dataset.value;
      const trigger = item.querySelector("[data-part='trigger']");
      const content = item.querySelector("[data-part='content']");

      if (trigger && !trigger.id) {
        trigger.id = `${this.el.id}-trigger-${itemValue}`;
      }

      if (content && !content.id) {
        content.id = `${this.el.id}-content-${itemValue}`;
      }
    });
  }

  setupComponentEvents() {
    super.setupComponentEvents();

    // Set up event handlers for each accordion item
    this.items.forEach((item) => {
      const trigger = item.querySelector("[data-part='trigger']");
      if (!trigger) return;

      // Add click handler
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        if (item.dataset.disabled !== "true" && !this.disabled) {
          this.toggleItem(item);
        }
      });

      // Add keyboard handler for Enter and Space
      trigger.addEventListener("keydown", (e) => {
        if (
          (e.key === "Enter" || e.key === " ") &&
          item.dataset.disabled !== "true" &&
          !this.disabled
        ) {
          e.preventDefault();
          this.toggleItem(item);
        }
      });
    });
  }

  toggleItem(item) {
    const itemValue = item.dataset.value;
    const isSelected = this.isItemSelected(itemValue);

    if (this.type === "single") {
      // Single mode: toggle between selected value or empty
      this.value = isSelected ? [] : [itemValue];
    } else {
      // Multiple mode: toggle this value in the array
      if (isSelected) {
        this.value = this.value.filter((v) => v !== itemValue);
      } else {
        this.value.push(itemValue);
      }
    }

    // Update states and emit event
    this.updateItemStates();

    const emitValue = this.type === "single" ? this.value[0] || "" : this.value;
    this.pushEvent("value-changed", { value: emitValue });
  }

  isItemSelected(itemValue) {
    return this.value.includes(itemValue);
  }

  updateItemStates() {
    this.items.forEach((item) => {
      const isOpen = this.isItemSelected(item.dataset.value);
      const state = isOpen ? "open" : "closed";

      // Update item state
      item.dataset.state = state;

      // Update trigger state
      const trigger = item.querySelector("[data-part='trigger']");
      if (trigger) {
        trigger.dataset.state = state;
      }

      // Update content state and visibility
      const content = item.querySelector("[data-part='content']");
      if (content) {
        content.dataset.state = state;
        content.hidden = !isOpen;
      }
    });
  }

  navigateItem(direction) {
    const enabledItems = this.items.filter(
      (item) => item.dataset.disabled !== "true",
    );
    if (enabledItems.length === 0) return;

    // Find currently focused item
    const currentFocus = document.activeElement;
    const currentItem = currentFocus?.closest("[data-part='item']");
    let currentIndex = enabledItems.indexOf(currentItem);

    // Calculate target index
    let targetIndex;
    if (direction === "first") {
      targetIndex = 0;
    } else if (direction === "last") {
      targetIndex = enabledItems.length - 1;
    } else {
      // Handle wrap-around navigation
      if (currentIndex === -1) {
        targetIndex = direction > 0 ? 0 : enabledItems.length - 1;
      } else {
        targetIndex =
          (currentIndex + direction + enabledItems.length) %
          enabledItems.length;
      }
    }

    // Focus the target trigger
    const targetItem = enabledItems[targetIndex];
    const targetTrigger = targetItem.querySelector("[data-part='trigger']");
    if (targetTrigger) {
      targetTrigger.focus();
    }
  }
}

// Register the component
SaladUI.register("accordion", AccordionComponent);

export default AccordionComponent;
