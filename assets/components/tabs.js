// saladui/components/tabs.js
import Component from "../core";
import SaladUI from "../index";

class TabsComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);

    // Initialize core properties
    this.list = this.getPart("list");
    this.triggers = this.el.querySelectorAll("[data-part='trigger']");
    this.contents = this.el.querySelectorAll("[data-part='content']");
    this.selectedValue = this.options.defaultValue || null;

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = [
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Enter",
      "Space",
    ];

    // Setup IDs and initialize the active tab
    this.setupTriggerEvents();
    this.setupContentIds();

    // Activate default tab if provided, otherwise select first tab
    if (!this.selectedValue && this.triggers.length > 0) {
      this.selectedValue = this.triggers[0].getAttribute("data-value");
    }

    this.updateActiveTab();
  }

  getStateMachine() {
    return {
      idle: {
        keyMap: {
          ArrowLeft: () => this.navigateTab(-1),
          ArrowRight: () => this.navigateTab(1),
          Home: () => this.navigateTab("first"),
          End: () => this.navigateTab("last"),
        },
        transitions: {
          select: "idle",
        },
      },
    };
  }

  getAriaConfig() {
    return {
      list: {
        all: {
          role: "tablist",
        },
      },
      trigger: {
        all: {
          role: "tab",
          controls: (el) =>
            `${this.el.id}-content-${el.getAttribute("data-value")}`,
        },
        active: {
          selected: "true",
        },
        inactive: {
          selected: "false",
        },
      },
      content: {
        all: {
          role: "tabpanel",
          labelledby: (el) =>
            `${this.el.id}-trigger-${el.getAttribute("data-value")}`,
        },
        active: {
          hidden: "false",
        },
        inactive: {
          hidden: "true",
        },
      },
    };
  }

  setupTriggerEvents() {
    this.triggers.forEach((trigger) => {
      // Set ID for ARIA relationships
      const value = trigger.getAttribute("data-value");
      if (!trigger.id) {
        trigger.id = `${this.el.id}-trigger-${value}`;
      }

      // Add click event
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        this.selectTab(value);
      });

      // Add keyboard event for activation
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.selectTab(value);
        }
      });
    });
  }

  setupContentIds() {
    this.contents.forEach((content) => {
      const value = content.getAttribute("data-value");
      if (!content.id) {
        content.id = `${this.el.id}-content-${value}`;
      }
    });
  }

  selectTab(value) {
    if (this.selectedValue === value) return;

    const prevValue = this.selectedValue;
    this.selectedValue = value;

    this.updateActiveTab(true); // Pass true to focus the trigger

    // Emit event
    this.pushEvent("tab-changed", {
      value,
      previousValue: prevValue,
    });
  }

  updateActiveTab(shouldFocus = false) {
    if (!this.selectedValue) return;

    let selectedTrigger = null;

    // Update triggers
    this.triggers.forEach((trigger) => {
      const value = trigger.getAttribute("data-value");
      const isActive = value === this.selectedValue;
      trigger.setAttribute("data-state", isActive ? "active" : "inactive");

      // Store the selected trigger for focus
      if (isActive) {
        selectedTrigger = trigger;
      }
    });

    // Update content panels
    this.contents.forEach((content) => {
      const value = content.getAttribute("data-value");
      const isActive = value === this.selectedValue;
      content.setAttribute("data-state", isActive ? "active" : "inactive");
      content.hidden = !isActive;
    });

    // Focus the selected trigger if needed
    if (shouldFocus && selectedTrigger) {
      selectedTrigger.focus();
    }
  }

  // Single method for all tab navigation that skips disabled tabs
  navigateTab(direction) {
    // Get only enabled triggers
    const enabledTriggers = Array.from(this.triggers).filter(
      (trigger) =>
        trigger.getAttribute("data-disabled") !== "true" && !trigger.disabled,
    );

    // If no enabled triggers, do nothing
    if (enabledTriggers.length === 0) return;

    const currentIndex = enabledTriggers.findIndex(
      (trigger) => trigger.getAttribute("data-value") === this.selectedValue,
    );

    let newIndex;

    if (direction === "first") {
      // First enabled tab
      newIndex = 0;
    } else if (direction === "last") {
      // Last enabled tab
      newIndex = enabledTriggers.length - 1;
    } else {
      // Navigate with proper wrapping among enabled tabs
      newIndex =
        (currentIndex + direction + enabledTriggers.length) %
        enabledTriggers.length;
    }

    const newValue = enabledTriggers[newIndex].getAttribute("data-value");
    this.selectTab(newValue);
  }
}

// Register the component
SaladUI.register("tabs", TabsComponent);

export default TabsComponent;
