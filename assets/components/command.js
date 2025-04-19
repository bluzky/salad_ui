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
    this.visibleItems = this.getAllParts("command-item").filter(
      (el) => el.getAttribute("disabled") === null,
    );

    this.currentItemIdx = -1;

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
    if (this.visibleItems.length === 0) return;
    if (index < 0) index = this.visibleItems.length - 1;
    if (index >= this.visibleItems.length) index = 0;

    this.currentItemIdx = index;

    for (let i = 0; i < this.visibleItems.length; i++) {
      const item = this.visibleItems[i];
      if (i === index) {
        item.setAttribute("data-selected", "true");
        item.setAttribute("aria-selected", "true");
      } else {
        item.removeAttribute("data-selected");
        item.removeAttribute("aria-selected");
      }
    }
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
    const item = this.visibleItems[this.currentItemIdx];
    item.click();
  }
}

// Register the component
SaladUI.register("command", CommandComponent);

export default CommandComponent;
