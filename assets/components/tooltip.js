// saladui/components/tooltip.js
import Component from "../core/component";
import SaladUI from "../index";
import PositionedElement from "../core/positioned-element";

class TooltipComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);

    // Initialize core properties
    this.trigger =
      this.getPart("trigger") || this.el.querySelector(":first-child");
    this.content = this.getPart("content");

    // Set default config
    this.config.openDelay = this.options.openDelay || 150;
    this.config.closeDelay = this.options.closeDelay || 100;

    // Track timer IDs for delayed open/close
    this.openTimer = null;
    this.closeTimer = null;
  }

  getStateMachine() {
    return {
      closed: {
        enter: "onClosedEnter",
        keyMap: {},
        mouseMap: {
          trigger: {
            mouseenter: "handleTriggerMouseEnter",
            focus: "handleTriggerFocus",
          },
        },
        transitions: {
          open: "open",
        },
        hidden: {
          content: true,
        },
      },
      open: {
        enter: "onOpenEnter",
        exit: "onOpenExit",
        keyMap: {},
        mouseMap: {
          trigger: {
            mouseleave: "handleTriggerMouseLeave",
            blur: "handleTriggerBlur",
          },
          content: {
            mouseenter: "handleContentMouseEnter",
            mouseleave: "handleContentMouseLeave",
          },
        },
        transitions: {
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
          describedby: () => this.getPartId("content"),
        },
      },
      content: {
        all: {
          role: "tooltip",
        },
      },
    };
  }

  // Event handlers
  handleTriggerMouseEnter() {
    this.clearTimers();
    this.openTimer = setTimeout(() => {
      this.transition("open");
    }, this.config.openDelay);
  }

  handleTriggerMouseLeave() {
    this.clearTimers();
    this.closeTimer = setTimeout(() => {
      this.transition("close");
    }, this.config.closeDelay);
  }

  handleContentMouseEnter() {
    this.clearTimers();
  }

  handleContentMouseLeave() {
    this.clearTimers();
    this.closeTimer = setTimeout(() => {
      this.transition("close");
    }, this.config.closeDelay);
  }

  handleTriggerFocus() {
    this.clearTimers();
    // For focus, we show immediately without delay for better accessibility
    this.transition("open");
  }

  handleTriggerBlur() {
    this.clearTimers();
    this.transition("close");
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

    // Get positioning configuration
    const placement = this.content.getAttribute("data-side") || "top";
    const alignment = this.content.getAttribute("data-align") || "center";
    const sideOffset = parseInt(
      this.content.getAttribute("data-side-offset") || "8",
      10,
    );
    const alignOffset = parseInt(
      this.content.getAttribute("data-align-offset") || "0",
      10,
    );

    // Create positioned element
    this.positionedElement = new PositionedElement(this.content, this.trigger, {
      placement,
      alignment,
      sideOffset,
      alignOffset,
      flip: true,
      usePortal: false,
      trapFocus: false,
    });
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
  }
}

// Register the component
SaladUI.register("tooltip", TooltipComponent);

export default TooltipComponent;
