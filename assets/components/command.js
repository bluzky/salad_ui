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
    this.visibleItems[index].focus();
  }
  focusNextItem() {
    const currentIndex = this.visibleItems.indexOf(document.activeElement);
    this.focusItem(currentIndex + 1);
  }
  focusPrevItem() {
    const currentIndex = this.visibleItems.indexOf(document.activeElement);
    this.focusItem(currentIndex - 1);
  }
  blurInput() {
    if (this.input) this.input.blur();
  }
}

// Register the component
SaladUI.register("command", CommandComponent);

export default CommandComponent;
