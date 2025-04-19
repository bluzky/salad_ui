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

    // Core elements
    this.input = this.getPart("command-input");
    this.list = this.getPart("command-list");
    this.empty = this.getPart("command-empty");
    this.groups = this.getAllParts("command-group");
    this.items = this.getAllParts("command-item");
    this.currentItemIdx = -1;

    this.input.addEventListener("input", this.handleSearch);
    this.handleSearch();

    this.config.preventDefaultKeys = ["Escape", "ArrowDown", "ArrowUp"];
  }

  getComponentConfig() {
    return {
      stateMachine: {
        idle: {
          transitions: {},
        },
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

  focusItem(index) {
    if (this.selectableItems.length === 0) return;
    if (index < 0) index = this.selectableItems.length - 1;
    if (index >= this.selectableItems.length) index = 0;

    this.currentItemIdx = index;

    for (let item of this.items) {
      item.setAttribute("data-selected", "false");
      item.setAttribute("aria-selected", "false");
    }

    const selectedItem = this.selectableItems[index];

    selectedItem.setAttribute("data-selected", "true");
    selectedItem.setAttribute("aria-selected", "true");
  }
  focusNextItem() {
    this.focusItem(this.currentItemIdx + 1);
  }
  focusPrevItem() {
    this.focusItem(this.currentItemIdx - 1);
  }
  blurInput() {
    if (this.input) this.input.blur();
  }
  selectItem() {
    if (this.currentItemIdx === -1) return;
    const item = this.selectableItems[this.currentItemIdx];
    item.click();
  }

  handleSearch = () => {
    const query = this.input.value.toLowerCase();

    this.currentItemIdx = -1;

    for (const item of this.items) {
      item.setAttribute("data-selected", "false");
    }

    for (let item of this.items) {
      const text = item.textContent.toLowerCase().trim();
      if (text.includes(query.toLowerCase())) {
        item.setAttribute("data-visible", "true");
      } else {
        item.setAttribute("data-visible", "false");
      }
    }

    this.updateGroupsVisibility();
    this.updateSelectableItems();
  };

  // Hide groups if all their options are hidden
  updateGroupsVisibility() {
    for (const group of this.groups) {
      const options = group.querySelectorAll("[data-visible='true']");
      if (options.length === 0) {
        group.setAttribute("data-visible", "false");
      } else {
        group.setAttribute("data-visible", "true");
      }
    }
  }

  updateSelectableItems() {
    this.visibleItems = this.items.filter(
      (el) => el.getAttribute("data-visible") === "true",
    );

    this.selectableItems = this.visibleItems.filter(
      (el) => el.getAttribute("disabled") === null,
    );
  }
}

// Register the component
SaladUI.register("command", CommandComponent);

export default CommandComponent;
