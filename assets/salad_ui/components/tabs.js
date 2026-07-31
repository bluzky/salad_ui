// saladui/components/tabs.js
import Component from "../core/component.js";
import SaladUI from "../index.js";
import { CollectionRegistry, Selection } from "../core/collection.js";

class TabsComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });

    // Initialize core properties
    this.list = this.getPart("list");
    this.triggers = this.getAllParts("trigger");
    this.contents = this.getAllParts("content");

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = [
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Enter",
      " ",
    ];

    // Initialize tabs
    this.initialize();
  }

  initialize() {
    // Initialize registry and selection state for tabs
    this.registry = new CollectionRegistry({
      getItemValue: (item) => item.getAttribute("data-value"),
      isItemDisabled: (item) => item.getAttribute("data-disabled") === "true",
    });
    this.selection = new Selection(this.registry, {
      type: "single",
      defaultValue: this.options.defaultValue,
      value: this.options.value,
    });

    // Register triggers with the registry
    this.triggers.forEach((trigger) => {
      const collectionItem = this.registry.add(trigger);
      this.selection.initializeItem(collectionItem);
    });

    // Setup accessibility attributes
    this.setupAriaAttributes();

    this.ensureValidSelection();

    // Initial UI update
    this.updateActiveTab();
  }

  ensureValidSelection() {
    const selectedValue = this.selection.getValue();
    const selectedItem = selectedValue
      ? this.registry.getItemByValue(selectedValue)
      : null;

    if (selectedItem && !this.registry.isDisabled(selectedItem)) return;

    const firstTrigger = this.registry.getItem("first");
    if (firstTrigger) {
      this.selection.setValues(firstTrigger.value);
    } else {
      this.selection.values = [];
      this.selection.updateSelectedStates();
    }
  }

  getComponentConfig() {
    return {
      stateMachine: {
        idle: {
          transitions: { select: "idle" },
        },
      },
      events: {
        idle: {
          keyEventTarget: "list",
          keyMap: {
            ArrowLeft: () => this.navigateTab("prev"),
            ArrowRight: () => this.navigateTab("next"),
            Home: () => this.navigateTab("first"),
            End: () => this.navigateTab("last"),
          },
          mouseMap: {
            trigger: { click: (event) => this.handleTriggerClick(event) },
          },
        },
      },
      ariaConfig: {
        list: {
          all: { role: "tablist" },
        },
        trigger: {
          all: {
            role: "tab",
            controls: (el) =>
              `${this.el.id}-content-${el.getAttribute("data-value")}`,
          },
        },
        content: {
          all: {
            role: "tabpanel",
            tabindex: "0",
          },
        },
      },
    };
  }

  setupAriaAttributes() {
    // Set IDs and ARIA attributes for triggers
    this.triggers.forEach((trigger) => {
      const value = trigger.getAttribute("data-value");
      if (!trigger.id) trigger.id = `${this.el.id}-trigger-${value}`;
    });

    // Set IDs and ARIA attributes for content panels
    this.contents.forEach((content) => {
      const value = content.getAttribute("data-value");
      if (!content.id) content.id = `${this.el.id}-content-${value}`;
      content.setAttribute("aria-labelledby", `${this.el.id}-trigger-${value}`);
    });
  }

  handleTriggerClick(event) {
    const trigger = event.currentTarget;
    if (trigger.getAttribute("data-disabled") === "true") return;

    this.selectTab(trigger.getAttribute("data-value"));
  }

  selectTab(value) {
    // Find the trigger item
    const triggerItem = this.registry.getItemByValue(value);
    if (
      !triggerItem ||
      this.registry.isDisabled(triggerItem) ||
      this.selection.isValueSelected(value)
    ) {
      return;
    }

    // Select the tab
    if (!this.selection.select(triggerItem)) return;
    this.updateActiveTab();

    // Focus the selected trigger
    triggerItem.instance.focus();

    // Emit event
    this.pushEvent("tab-changed", { value: value, tab: value });
  }

  updateActiveTab() {
    const selectedValue = this.selection.getValue();

    // Update triggers
    this.triggers.forEach((trigger) => {
      const value = trigger.getAttribute("data-value");
      const isActive = value === selectedValue;

      trigger.setAttribute("data-state", isActive ? "active" : "inactive");
      trigger.setAttribute("aria-selected", isActive.toString());
      trigger.tabIndex = isActive ? 0 : -1;
    });

    // Update content panels
    this.contents.forEach((content) => {
      const value = content.getAttribute("data-value");
      const isActive = value === selectedValue;

      content.setAttribute("data-state", isActive ? "active" : "inactive");
      content.hidden = !isActive;
    });
  }

  navigateTab(direction) {
    const currentItem = this.registry.getItemByValue(this.selection.getValue());

    const nextItem = this.registry.getItem(direction, currentItem);
    if (nextItem) this.selectTab(nextItem.value);
  }

  // Cleanup
  beforeDestroy() {
    this.registry = null;
    this.selection = null;
  }
}

// Register the component
SaladUI.register("tabs", TabsComponent);

export default TabsComponent;
