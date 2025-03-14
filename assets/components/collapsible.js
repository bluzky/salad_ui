// saladui/components/collapsible.js
import Component from "../core/component";
import SaladUI from "../index";

class CollapsibleComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);

    // Initialize core properties
    this.trigger = this.getPart("trigger");
    this.content = this.getPart("content");
    this.isOpen = this.options.open || false;

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = ["Enter", " "];
  }

  getStateMachine() {
    return {
      closed: {
        enter: "onClosedEnter",
        keyMap: {
          Enter: "toggle",
          " ": "toggle",
        },
        transitions: {
          toggle: "open",
          open: "open",
        },
        hidden: {
          content: true,
        },
      },
      open: {
        enter: "onOpenEnter",
        keyMap: {
          Enter: "toggle",
          " ": "toggle",
        },
        transitions: {
          toggle: "closed",
          close: "closed",
        },
        hidden: {
          content: false,
        },
      },
    };
  }

  getAriaConfig() {
    return {
      trigger: {
        all: {
          controls: () => this.getPartId("content"),
          expanded: "false",
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
          labelledby: () => this.getPartId("trigger"),
          role: "region",
        },
      },
    };
  }

  // State handlers
  onOpenEnter() {
    this.isOpen = true;
    this.pushEvent("opened");
  }

  onClosedEnter() {
    this.isOpen = false;
    this.pushEvent("closed");
  }
}

// Register the component
SaladUI.register("collapsible", CollapsibleComponent);

export default CollapsibleComponent;
