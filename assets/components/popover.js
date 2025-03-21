// saladui/components/popover.js
import Component from "../core/component";
import SaladUI from "../index";
import PositionedElement from "../core/positioned-element";

class PopoverComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });

    // Initialize core properties
    this.trigger = this.getPart("trigger");
    this.positioner = this.getPart("positioner");
    this.content = this.positioner
      ? this.positioner.querySelector("[data-part='content']")
      : null;

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = ["Escape"];
  }

  getComponentConfig() {
    return {
      stateMachine: {
        closed: {
          enter: "onClosedEnter",
          transitions: {
            open: "open",
            toggle: "open",
          },
        },
        open: {
          enter: "onOpenEnter",
          transitions: {
            close: "closed",
            toggle: "closed",
          },
        },
      },
      events: {
        closed: {
          keyMap: {},
        },
        open: {
          keyMap: {
            Escape: "close",
          },
        },
      },
      hiddenConfig: {
        closed: {
          positioner: true, // Hide the positioner in closed state
        },
        open: {
          positioner: false, // Show the positioner in open state
        },
      },
      ariaConfig: {
        trigger: {
          all: {
            haspopup: "dialog",
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
            role: "dialog",
          },
        },
      },
    };
  }

  initializePositionedElement() {
    if (this.positioner && this.trigger && !this.positionedElement) {
      // Extract position config attributes from DOM
      const placement = this.positioner.getAttribute("data-side") || "bottom";
      const alignment = this.positioner.getAttribute("data-align") || "center";
      const sideOffset = parseInt(
        this.positioner.getAttribute("data-side-offset") || "8",
        10,
      );
      const alignOffset = parseInt(
        this.positioner.getAttribute("data-align-offset") || "0",
        10,
      );

      // Create the positioned element with our modular architecture
      this.positionedElement = new PositionedElement(
        this.positioner,
        this.trigger,
        {
          placement,
          alignment,
          sideOffset,
          alignOffset,
          flip: true,
          usePortal: true,
          portalContainer: document.querySelector(this.options.portalContainer),
          trapFocus: true,
          onOutsideClick: () => this.transition("close"),
        },
      );
    }
  }

  onOpenEnter(params = {}) {
    // Initialize the positioned element
    this.initializePositionedElement();

    // Activate the positioned element
    if (this.positionedElement) {
      this.positionedElement.activate();
    }

    this.pushEvent("opened");
  }

  onClosedEnter() {
    if (this.positionedElement) {
      this.positionedElement.deactivate();
    }

    this.pushEvent("closed");
  }

  beforeDestroy() {
    // Clean up the positioned element
    if (this.positionedElement) {
      this.positionedElement.destroy();
      this.positionedElement = null;
    }
  }
}

// Register the component
SaladUI.register("popover", PopoverComponent);

export default PopoverComponent;
