// salad_ui/assets/components/command.js
import Component from "../core/component";
import SaladUI from "..";

/**
 * CommandComponent for SaladUI
 * Implements filtering, keyboard navigation, and selection for a command palette/list.
 */
class CommandComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });

    // Set default field state
    this.currentItemIdx = 0;

    // Core elements
    this.input = this.getPart("command-input");
    this.list = this.getPart("command-list");
    this.empty = this.getPart("command-empty");
    this.groups = this.getAllParts("command-group");
    this.items = this.getAllParts("command-item");

    // Bind event handlers
    this.input.addEventListener("input", this.handleSearch);

    // Initial search/filter
    this.handleSearch();

    // Prevent default for navigation keys
    this.config.preventDefaultKeys = ["Escape", "ArrowDown", "ArrowUp"];
  }

  getComponentConfig() {
    return {
      stateMachine: {
        idle: { transitions: {} },
      },
      events: {
        idle: {
          keyMap: {
            Enter: "selectItem",
            ArrowDown: "focusNextItem",
            ArrowUp: "focusPrevItem",
            Escape: "blurInput",
          },
        },
      },
    };
  }

  // Focus item by index, wrap around if needed
  focusItem(index) {
    if (!this.selectableItems?.length) return;

    // Wrap index
    if (index < 0) index = this.selectableItems.length - 1;
    if (index >= this.selectableItems.length) index = 0;

    this.currentItemIdx = index;

    // Deselect all
    this.items.forEach((item) => {
      item.setAttribute("data-selected", "false");
      item.setAttribute("aria-selected", "false");
    });

    // Select current
    const selectedItem = this.selectableItems[index];
    selectedItem.setAttribute("data-selected", "true");
    selectedItem.setAttribute("aria-selected", "true");
  }

  focusNextItem = () => this.focusItem(this.currentItemIdx + 1);
  focusPrevItem = () => this.focusItem(this.currentItemIdx - 1);

  blurInput = () => this.input?.blur();

  selectItem = () => {
    if (this.currentItemIdx === -1) return;
    const item = this.selectableItems[this.currentItemIdx];
    item.click();
  };

  // Handle search/filtering
  handleSearch = () => {
    const query = this.input.value.trim().toLowerCase();

    // Filter items
    this.items.forEach((item) => {
      const text = item.textContent.trim().toLowerCase();
      const visible = query === "" || text.includes(query);
      item.setAttribute("data-visible", visible ? "true" : "false");
    });

    this.updateGroupsVisibility();
    this.updateSelectableItems();
    this.focusItem(0);
  };

  // Hide groups if all their options are hidden
  updateGroupsVisibility() {
    this.groups.forEach((group) => {
      const visibleOptions = group.querySelectorAll("[data-visible='true']");
      group.setAttribute(
        "data-visible",
        visibleOptions.length > 0 ? "true" : "false",
      );
    });
  }

  // Update the list of selectable (visible & enabled) items
  updateSelectableItems() {
    this.visibleItems = this.items.filter(
      (el) => el.getAttribute("data-visible") === "true",
    );
    this.selectableItems = this.visibleItems.filter(
      (el) => !el.hasAttribute("disabled"),
    );
  }
}

// Register the component
SaladUI.register("command", CommandComponent);

export default CommandComponent;
