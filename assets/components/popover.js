// saladui/components/popover.js
import Component from "../core/component";
import SaladUI from "../index";
import Positioner from "../core/positioner";

class PopoverComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);

    // Initialize core properties
    this.trigger = this.getPart("trigger");
    this.positioner = this.getPart("positioner");
    this.content = this.positioner
      ? this.positioner.querySelector("[data-part='content']")
      : null;

    this.isModal = this.options.modal || false;

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = ["Escape"];

    // Initialize the positioner
    this.initializePositioner();
  }

  getStateMachine() {
    return {
      closed: {
        enter: "onClosedEnter",
        exit: "onClosedExit",
        keyMap: {},
        transitions: {
          open: "open",
          toggle: "open",
        },
        hidden: {
          positioner: true, // Hide the positioner in closed state
        },
      },
      open: {
        enter: "onOpenEnter",
        exit: "onOpenExit",
        keyMap: {
          Escape: "close",
          Tab: this.handleTabKey,
        },
        transitions: {
          close: "closed",
          toggle: "closed",
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
    };
  }

  initializePositioner() {
    if (this.positioner && this.content && this.trigger) {
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
      this.positionerInstance = Positioner.create(this.content, this.trigger, {
        placement,
        alignment,
        flip: true,
        shift: true,
        sideOffset,
        alignOffset,
        trapFocus: true,
        onEscape: () => this.transition("close"),
      });
    }
  }

  setupComponentEvents() {
    super.setupComponentEvents();

    // Handle click events on the trigger element
    if (this.trigger) {
      this.trigger.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.transition("toggle");
      });
    }
  }

  onOpenEnter(params = {}) {
    // Simply activate the positioner if it exists
    if (this.positionerInstance) {
      this.positionerInstance.activate();
    }

    this.pushEvent("opened");
  }

  onOpenExit() {
    // Deactivate the positioner if it exists
    if (this.positionerInstance) {
      this.positionerInstance.deactivate();
    }
  }

  onClosedEnter() {
    this.pushEvent("closed");
  }

  beforeDestroy() {
    // Clean up the positioner instance if it exists
    if (this.positionerInstance) {
      this.positionerInstance.destroy();
      this.positionerInstance = null;
    }
  }
}

// Register the component
SaladUI.register("popover", PopoverComponent);

export default PopoverComponent;
