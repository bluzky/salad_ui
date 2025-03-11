// saladui/components/hover_card.js
import Component from "../core/component";
import SaladUI from "../index";
import Positioner from "../core/positioner";

class HoverCardComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);

    // Initialize core properties
    this.trigger = this.getPart("trigger");
    this.positioner = this.getPart("positioner");
    this.content = this.positioner
      ? this.positioner.querySelector("[data-part='content']")
      : null;

    // Timer IDs for managing hover delays
    this.openTimer = null;
    this.closeTimer = null;

    // Default delay values (will be overridden by options if provided)
    this.openDelay = this.options.openDelay || 300;
    this.closeDelay = this.options.closeDelay || 200;
  }

  getStateMachine() {
    return {
      closed: {
        enter: "onClosedEnter",
        transitions: {
          open: "open",
        },
        hidden: {
          positioner: true, // Hide the positioner in closed state
        },
      },
      open: {
        enter: "onOpenEnter",
        transitions: {
          close: "closed",
        },
        hidden: {
          positioner: false, // Show the positioner in open state
        },
      },
    };
  }

  getAriaConfig() {
    return {
      trigger: {
        all: {
          haspopup: "dialog",
          describedby: () => (this.content ? this.content.id : null),
        },
      },
      content: {
        all: {
          role: "tooltip",
        },
      },
    };
  }

  setupComponentEvents() {
    super.setupComponentEvents();

    if (this.trigger) {
      // Mouse enter/leave events for trigger
      this.trigger.addEventListener(
        "mouseenter",
        this.handleTriggerEnter.bind(this),
      );
      this.trigger.addEventListener(
        "mouseleave",
        this.handleTriggerLeave.bind(this),
      );

      // Focus/blur events for keyboard users
      this.trigger.addEventListener(
        "focus",
        this.handleTriggerEnter.bind(this),
      );
      this.trigger.addEventListener("blur", this.handleTriggerLeave.bind(this));
    }

    if (this.positioner) {
      // Add events to the positioner to prevent it from closing when hovered
      this.positioner.addEventListener(
        "mouseenter",
        this.handlePositionerEnter.bind(this),
      );
      this.positioner.addEventListener(
        "mouseleave",
        this.handlePositionerLeave.bind(this),
      );
    }
  }

  initializePositioner() {
    if (this.positioner && this.trigger && !this.positionerInstance) {
      // Extract position config attributes
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

      // Create the positioner instance
      this.positionerInstance = Positioner.create(
        this.positioner,
        this.trigger,
        {
          placement,
          alignment,
          flip: true,
          sideOffset,
          alignOffset,
          portalContainer: document.querySelector(this.options.portalContainer),
          trapFocus: false, // No focus trapping for hover cards
          onOutsideClick: null, // No outside click handling for hover cards
        },
      );

      // Ensure the content has an ID for ARIA
      if (this.content && !this.content.id) {
        this.content.id = `${this.el.id}-content`;
      }
    }
  }

  // Handlers for mouse events
  handleTriggerEnter(event) {
    this.clearTimers();
    this.openTimer = setTimeout(() => {
      this.transition("open");
    }, this.openDelay);
  }

  handleTriggerLeave(event) {
    this.clearTimers();
    this.closeTimer = setTimeout(() => {
      this.transition("close");
    }, this.closeDelay);
  }

  handlePositionerEnter(event) {
    this.clearTimers(); // Cancel any pending close
  }

  handlePositionerLeave(event) {
    this.clearTimers();
    this.closeTimer = setTimeout(() => {
      this.transition("close");
    }, this.closeDelay);
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
  onOpenEnter(params = {}) {
    // Initialize the positioner
    this.initializePositioner();

    // Activate the positioner if it exists
    if (this.positionerInstance) {
      this.updatePartsVisibility();
      this.positionerInstance.activate();
    }

    this.pushEvent("opened");
  }

  onClosedEnter() {
    if (this.positionerInstance) {
      this.positionerInstance.deactivate();
    }

    this.pushEvent("closed");
  }

  beforeDestroy() {
    // Clean up timers
    this.clearTimers();

    // Clean up the positioner instance if it exists
    if (this.positionerInstance) {
      this.positionerInstance.destroy();
      this.positionerInstance = null;
    }
  }
}

// Register the component
SaladUI.register("hover-card", HoverCardComponent);

export default HoverCardComponent;
