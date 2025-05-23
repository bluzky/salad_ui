// saladui/components/tabs.js
import Component from "../core/component";
import SaladUI from "../index";
import Collection from "../core/collection";

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
    // Initialize collection manager for tabs
    this.collection = new Collection({
      type: "single",
      defaultValue: this.options.defaultValue,
      value: this.options.value,
      getItemValue: (item) => item.getAttribute("data-value"),
      isItemDisabled: (item) => item.getAttribute("data-disabled") === "true",
    });

    // Register triggers with collection manager
    this.triggers.forEach((trigger) => this.collection.add(trigger));

    // Setup accessibility attributes
    this.setupAriaAttributes();

    // Select first tab if none selected
    if (!this.collection.getValue() && this.triggers.length > 0) {
      const firstTrigger = this.collection.getItem("first");
      if (firstTrigger) this.collection.select(firstTrigger);
    }

    // Initial UI update
    this.updateActiveTab();
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
    const triggerItem = this.collection.getItemByValue(value);
    if (!triggerItem || this.collection.isValueSelected(value)) return;

    // Select the tab
    this.collection.select(triggerItem);
    this.updateActiveTab();

    // Focus the selected trigger
    triggerItem.instance.focus();

    // Emit event
    this.pushEvent("tab-changed", { value: value, tab: value });
  }

  updateActiveTab() {
    const selectedValue = this.collection.getValue();

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
    const currentItem = this.collection.getItemByValue(
      this.collection.getValue(),
    );

    const nextItem = this.collection.getItem(direction, currentItem);
    if (nextItem) this.selectTab(nextItem.value);
  }

  // Cleanup
  destroy() {
    this.collection = null;
    super.destroy();
  }
}

// Register the component
SaladUI.register("tabs", TabsComponent);

export default TabsComponent;
