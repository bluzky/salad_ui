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
    if (this.positioner && this.trigger) {
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
          portalContainer: document.querySelector(this.options.portalcontainer),
          trapFocus: true,
          onEscape: () => this.transition("close"),
          onOutsideClick: () => this.transition("close"),
        },
      );
    }
  }

  setupComponentEvents() {
    super.setupComponentEvents();
  }

  onOpenEnter(params = {}) {
    // Simply activate the positioner if it exists
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
