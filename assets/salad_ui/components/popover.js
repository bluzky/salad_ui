// saladui/components/popover.js
import Component from "../core/component.js";
import SaladUI from "../index.js";
import PositionedElement from "../core/positioned-element.js";

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
          keyEventTarget: "content",
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

  /**
   * Initializes the positioned element if the positioner and trigger exist and the positioned element is not already created.
   * Extracts placement configuration from DOM attributes and creates a new PositionedElement instance.
   */
  initializePositionedElement() {
    if (this.positioner && this.trigger && !this.positionedElement) {
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
      const usePortal = this.options.usePortal === true;
      const portalContainer =
        usePortal && this.options.portalContainer
          ? document.querySelector(this.options.portalContainer)
          : document.body;

      this.positionedElement = new PositionedElement(
        this.positioner,
        this.trigger,
        {
          placement,
          alignment,
          sideOffset,
          alignOffset,
          flip: true,
          usePortal,
          portalContainer,
          trapFocus: true,
          onOutsideClick: () => this.transition("close"),
          onPosition: ({ placement: actualPlacement }) => {
            this.content?.setAttribute("data-side", actualPlacement);
          },
        },
      );
    }
  }

  afterMount() {
    if (this.state === "open") {
      this.activateOpenState();
    }
  }

  activateOpenState() {
    this.initializePositionedElement();
    this.positionedElement?.activate();
  }

  onOpenEnter() {
    this.activateOpenState();
    this.pushEvent("open");
  }

  onClosedEnter() {
    this.positionedElement?.deactivate();
    this.pushEvent("close");
  }

  beforeUpdate() {
    this.positionedElement?.deactivate();
  }

  beforeDestroy() {
    this.positionedElement?.destroy();
    this.positionedElement = null;
  }
}

// Register the component
SaladUI.register("popover", PopoverComponent);

export default PopoverComponent;
