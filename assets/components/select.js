// saladui/components/select.js
import Component from "../core";
import SaladUI from "../index";

class SelectComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);

    // Initialize properties
    this.content = this.getPart("content");
    this.trigger = this.getPart("trigger");
    this.valueDisplay = this.getPart("value");
    this.items = this.el.querySelectorAll("[data-part='item']");

    // Set up configuration
    this.config.preventDefaultKeys = [
      "Escape",
      "ArrowUp",
      "ArrowDown",
      "Enter",
      "Space",
    ];

    // Initialize state based on data-state attribute
    if (this.el.getAttribute("data-state") === "open") {
      this.showContent();
    } else {
      this.hideContent();
    }

    // Find the initially selected item
    this.updateSelectedItem();
  }

  getStateMachine() {
    return {
      closed: {
        enter: "onClosedEnter",
        exit: "onClosedExit",
        keyMap: {
          ArrowDown: "open",
          Enter: "open",
          " ": "open",
        },
        transitions: {
          open: "open",
        },
      },
      open: {
        enter: "onOpenEnter",
        exit: "onOpenExit",
        keyMap: {
          Escape: "close",
          ArrowUp: "navigateUp",
          ArrowDown: "navigateDown",
          Enter: "selectHighlighted",
          " ": "selectHighlighted",
        },
        transitions: {
          close: "closed",
          select: "closed",
        },
      },
    };
  }

  getAriaConfig() {
    return {
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
        open: {
          hidden: "false",
        },
        closed: {
          hidden: "true",
        },
      },
      item: {
        all: {
          role: "option",
        },
      },
    };
  }

  setupComponentEvents() {
    super.setupComponentEvents();

    // Setup trigger click event
    if (this.trigger) {
      this.trigger.addEventListener("click", (e) => {
        e.preventDefault();
        this.transition(this.state === "closed" ? "open" : "close");
      });
    }

    // Setup item click events
    this.items.forEach((item) => {
      if (item.getAttribute("data-disabled") !== "true") {
        item.addEventListener("click", () => {
          const value = item.getAttribute("data-value");
          const label = item.textContent.trim();
          this.setSelectedValue(value, label);
          this.transition("select");
        });

        // Add keyboard events to items
        item.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const value = item.getAttribute("data-value");
            const label = item.textContent.trim();
            this.setSelectedValue(value, label);
            this.transition("select");
          }
        });
      }
    });

    // Add keyboard navigation events
    this.content.addEventListener(
      "keydown",
      this.handleContentKeyDown.bind(this),
    );
  }

  handleContentKeyDown(event) {
    if (this.state !== "open") return;

    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.navigateUp();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      this.navigateDown();
    } else if (event.key === "Escape") {
      event.preventDefault();
      this.transition("close");
    }
  }

  onClosedEnter() {
    // Hide the select content
    this.hideContent();

    // Clear any highlighted items
    this.unhighlightAllItems();

    // Notify the server of the state change
    this.pushEvent("closed");
  }

  onClosedExit() {
    // No specific action needed
  }

  onOpenEnter() {
    // Show the select content
    this.showContent();

    // Focus the first item or the selected item
    this.focusSelectedOrFirstItem();

    // Notify the server of the state change
    this.pushEvent("opened");
  }

  onOpenExit() {
    // No specific action needed
  }

  navigateUp() {
    const focusableItems = this.getFocusableItems();
    const currentIndex = this.getCurrentFocusedIndex(focusableItems);

    this.unhighlightAllItems();

    if (currentIndex > 0) {
      this.highlightItem(focusableItems[currentIndex - 1]);
      focusableItems[currentIndex - 1].focus();
    } else {
      // Wrap to the last item
      this.highlightItem(focusableItems[focusableItems.length - 1]);
      focusableItems[focusableItems.length - 1].focus();
    }
  }

  navigateDown() {
    const focusableItems = this.getFocusableItems();
    const currentIndex = this.getCurrentFocusedIndex(focusableItems);

    this.unhighlightAllItems();

    if (currentIndex < focusableItems.length - 1) {
      this.highlightItem(focusableItems[currentIndex + 1]);
      focusableItems[currentIndex + 1].focus();
    } else {
      // Wrap to the first item
      this.highlightItem(focusableItems[0]);
      focusableItems[0].focus();
    }
  }

  selectHighlighted() {
    const highlighted = document.activeElement;

    if (
      highlighted &&
      highlighted.getAttribute("data-part") === "item" &&
      highlighted.getAttribute("data-disabled") !== "true"
    ) {
      const value = highlighted.getAttribute("data-value");
      const label = highlighted.textContent.trim();
      this.setSelectedValue(value, label);
      this.transition("select");
    }
  }

  // Helper methods
  updateSelectedItem() {
    // Try to find an item with the value matching the initial value
    const initialValue = this.options.initialValue;
    if (initialValue) {
      const selectedItem = Array.from(this.items).find(
        (item) => item.getAttribute("data-value") === initialValue,
      );

      if (selectedItem) {
        const value = selectedItem.getAttribute("data-value");
        const label = selectedItem.textContent.trim();
        this.setSelectedValue(value, label, false); // Don't trigger change events on init
      }
    }
  }

  setSelectedValue(value, label, triggerEvents = true) {
    // Update the displayed value
    if (this.valueDisplay) {
      this.valueDisplay.setAttribute("data-content", label || value);
    }

    // Update selected state on all items
    this.items.forEach((item) => {
      const itemValue = item.getAttribute("data-value");
      const isSelected = itemValue === value;

      item.setAttribute("data-selected", isSelected);

      // Update the checkmark
      const checkmark = item.querySelector("[data-checkmark]");
      if (checkmark) {
        checkmark.setAttribute("data-selected", isSelected);
      }
    });

    // Create a hidden input for form integration if it doesn't exist
    let hiddenInput = this.el.querySelector('input[type="hidden"]');
    if (!hiddenInput) {
      hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = this.options.name || "";
      this.el.appendChild(hiddenInput);
    }

    // Update the hidden input value
    hiddenInput.value = value;

    // Only trigger events if not initializing
    if (triggerEvents) {
      // Dispatch a change event for phx-change
      const form = this.el.closest("form");
      if (form) {
        const event = new Event("input", { bubbles: true });
        hiddenInput.dispatchEvent(event);
      }

      // Push the value change event
      this.pushEvent("value-changed", { value });
    }
  }

  highlightItem(item) {
    if (item) {
      item.setAttribute("data-highlighted", true);
    }
  }

  unhighlightAllItems() {
    this.items.forEach((item) => {
      item.setAttribute("data-highlighted", false);
    });
  }

  getFocusableItems() {
    return Array.from(this.items).filter((item) => {
      return item.getAttribute("data-disabled") !== "true";
    });
  }

  getCurrentFocusedIndex(focusableItems) {
    const activeElement = document.activeElement;
    return focusableItems.indexOf(activeElement);
  }

  focusSelectedOrFirstItem() {
    // Try to focus the selected item first
    const selectedItem = this.el.querySelector(
      "[data-part='item'][data-selected='true']",
    );

    if (selectedItem) {
      this.highlightItem(selectedItem);
      selectedItem.focus();
    } else {
      // Otherwise focus the first focusable item
      const focusableItems = this.getFocusableItems();
      if (focusableItems.length > 0) {
        this.highlightItem(focusableItems[0]);
        focusableItems[0].focus();
      }
    }
  }

  showContent() {
    if (this.content) {
      this.content.classList.remove("hidden");
    }
    this.el.setAttribute("data-state", "open");
  }

  hideContent() {
    if (this.content) {
      this.content.classList.add("hidden");
    }
    this.el.setAttribute("data-state", "closed");
  }
}

// Register the component
SaladUI.register("select", SelectComponent);

export default SelectComponent;
