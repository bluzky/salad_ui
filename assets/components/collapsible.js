// saladui/components/collapsible.js
import Component from "../core/component";
import SaladUI from "../index";

class CollapsibleComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });

    // Initialize core properties
    this.trigger = this.getPart("trigger");
    this.content = this.getPart("content");

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = ["Enter", " "];
  }

  getComponentConfig() {
    return {
      stateMachine: {
        closed: {
          enter: "onClosedEnter",
          transitions: {
            toggle: "open",
            open: "open",
          },
        },
        open: {
          enter: "onOpenEnter",
          transitions: {
            toggle: "closed",
            close: "closed",
          },
        },
      },
      events: {
        closed: {
          keyMap: {
            Enter: "toggle",
            " ": "toggle",
          },
        },
        open: {
          keyMap: {
            Enter: "toggle",
            " ": "toggle",
          },
        },
      },
      hiddenConfig: {
        closed: {
          content: true,
        },
        open: {
          content: false,
        },
      },
      ariaConfig: {
        trigger: {
          all: {
            controls: () => this.getPartId("content"),
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
      },
    };
  }

  // State handlers
  onOpenEnter() {
    this.pushEvent("opened");
  }

  onClosedEnter() {
    this.pushEvent("closed");
  }
}

// Register the component
SaladUI.register("collapsible", CollapsibleComponent);

export default CollapsibleComponent;
