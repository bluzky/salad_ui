// saladui/components/hover_card.js
import Component from "../core/component";
import SaladUI from "../index";
import PositionedElement from "../core/positioned-element";

class HoverCardComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);

    // Initialize core properties
    this.trigger = this.getPart("trigger");
    this.content = this.getPart("content");

    // Set default config
    this.config.openDelay = this.options.openDelay || 300;
    this.config.closeDelay = this.options.closeDelay || 200;

    // Track timer IDs for delayed open/close
    this.openTimer = null;
    this.closeTimer = null;
  }

  getComponentConfig() {
    return {
      stateMachine: {
        closed: {
          enter: "onClosedEnter",
          keyMap: {},
          transitions: {
            open: "open",
          },
        },
        open: {
          enter: "onOpenEnter",
          exit: "onOpenExit",
          keyMap: {},
          transitions: {
            close: "closed",
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

  setupComponentEvents() {
    super.setupComponentEvents();

    if (this.trigger) {
      // Mouse events
      this.trigger.addEventListener(
        "mouseenter",
        this.handleTriggerMouseEnter.bind(this),
      );
      this.trigger.addEventListener(
        "mouseleave",
        this.handleTriggerMouseLeave.bind(this),
      );

      // Focus events - for accessibility
      this.trigger.addEventListener(
        "focus",
        this.handleTriggerFocus.bind(this),
      );
      this.trigger.addEventListener("blur", this.handleTriggerBlur.bind(this));
    }

    if (this.content) {
      // Prevent closing when hovering content
      this.content.addEventListener(
        "mouseenter",
        this.handleContentMouseEnter.bind(this),
      );
      this.content.addEventListener(
        "mouseleave",
        this.handleContentMouseLeave.bind(this),
      );
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
      this.content.getAttribute("data-side-offset") || "4",
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
      usePortal: false, // Don't use portal to keep DOM structure
      trapFocus: false,
    });
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

  // State machine handlers
  onOpenEnter() {
    // Initialize positioned element if needed
    this.initializePositionedElement();

    // Activate positioned element
    if (this.positionedElement) {
      this.positionedElement.activate();

      // Update position after animation completes
      setTimeout(() => {
        if (this.positionedElement) {
          this.positionedElement.update();
        }
      }, 150);
    }

    // Notify the server of the state change
    this.pushEvent("opened");
  }

  onOpenExit() {
    // Deactivate positioned element
    if (this.positionedElement) {
      this.positionedElement.deactivate();
    }
  }

  onClosedEnter() {
    // Notify the server of the state change
    this.pushEvent("closed");
  }

  beforeDestroy() {
    this.clearTimers();

    if (this.positionedElement) {
      this.positionedElement.destroy();
      this.positionedElement = null;
    }
  }
}

// Register the component
SaladUI.register("hover-card", HoverCardComponent);

export default HoverCardComponent;
