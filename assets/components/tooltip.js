import Component from "../core/component";
import SaladUI from "../index";
import PositionedElement from "../core/positioned-element";

// Define constants at the module level outside the class
const DEFAULT_POSITION_CONFIG = {
  placement: "top",
  alignment: "center",
  sideOffset: 8,
  alignOffset: 0,
};

const DEFAULT_TIMING_CONFIG = {
  openDelay: 150,
  closeDelay: 100,
};

class TooltipComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });

    // Initialize core properties
    this.trigger =
      this.getPart("trigger") || this.el.querySelector(":first-child");
    this.content = this.getPart("content");

    // Set config from options with fallbacks to defaults
    this.config.openDelay =
      this.options.openDelay || DEFAULT_TIMING_CONFIG.openDelay;
    this.config.closeDelay =
      this.options.closeDelay || DEFAULT_TIMING_CONFIG.closeDelay;

    // Track timer IDs for delayed open/close
    this.openTimer = null;
    this.closeTimer = null;
  }

  getComponentConfig() {
    return {
      stateMachine: {
        closed: {
          enter: "onClosedEnter",
          transitions: {
            open: "open",
          },
        },
        open: {
          enter: "onOpenEnter",
          exit: "onOpenExit",
          transitions: {
            close: "closed",
          },
        },
      },
      events: {
        closed: {
          mouseMap: {
            trigger: {
              mouseenter: "delayOpen",
              focus: "delayOpen",
            },
          },
        },
        open: {
          mouseMap: {
            trigger: {
              mouseleave: "delayClose",
              blur: "delayClose",
            },
            content: {
              mouseenter: "clearTimers",
              mouseleave: "delayClose",
            },
          },
        },
      },
      visibilityConfig: {
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
            describedby: () => this.getPartId("content"),
          },
        },
        content: {
          all: {
            role: "tooltip",
          },
        },
      },
    };
  }

  // Generic methods for delayed state transitions
  delayOpen() {
    this.clearTimers();
    this.openTimer = setTimeout(() => {
      this.transition("open");
    }, this.config.openDelay);
  }

  delayClose() {
    this.clearTimers();
    this.closeTimer = setTimeout(() => {
      this.transition("close");
    }, this.config.closeDelay);
  }

  clearTimers() {
    if (this.openTimer) {
      clearTimeout(this.openTimer);
      this.openTimer = null;
    }

    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  // Initialize the positioned element
  initializePositionedElement() {
    if (this.positionedElement) return;

    if (!this.trigger || !this.content) return;

    // Get positioning configuration from content attributes with fallbacks to defaults
    const positionConfig = {
      placement:
        this.content.getAttribute("data-side") ||
        DEFAULT_POSITION_CONFIG.placement,
      alignment:
        this.content.getAttribute("data-align") ||
        DEFAULT_POSITION_CONFIG.alignment,
      sideOffset:
        parseInt(this.content.getAttribute("data-side-offset"), 10) ||
        DEFAULT_POSITION_CONFIG.sideOffset,
      alignOffset:
        parseInt(this.content.getAttribute("data-align-offset"), 10) ||
        DEFAULT_POSITION_CONFIG.alignOffset,
      flip: true,
      usePortal: false,
      trapFocus: false,
    };

    // Create positioned element
    this.positionedElement = new PositionedElement(
      this.content,
      this.trigger,
      positionConfig,
    );
  }

  // State machine handlers
  onOpenEnter() {
    // Initialize positioned element if needed
    this.initializePositionedElement();

    // Activate positioned element
    if (this.positionedElement) {
      this.positionedElement.activate();
    }

    // Notify the server of the state change
    this.pushEvent("opened");
  }

  onOpenExit() {
    // Destroy the positioned element because there are too many tooltips, if we keep them all, it will costs more memory
    if (this.positionedElement) {
      this.positionedElement.destroy();
      this.positionedElement = null;
    }
  }

  onClosedEnter() {
    // Notify the server of the state change
    this.pushEvent("closed");
  }

  beforeDestroy() {
    this.clearTimers();

    // Clean up the positioned element if it exists
    if (this.positionedElement) {
      this.positionedElement.destroy();
      this.positionedElement = null;
    }
  }
}

// Register the component
SaladUI.register("tooltip", TooltipComponent);

export default TooltipComponent;
