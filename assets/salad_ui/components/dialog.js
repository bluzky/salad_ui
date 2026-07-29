// saladui/components/dialog.js
import Component from "../core/component.js";
import SaladUI from "../index.js";
import FocusTrap from "../core/focus-trap.js";
import ClickOutsideMonitor from "../core/click-outside.js";

class DialogComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext, initialState: "closed" });

    // Initialize properties
    this.root = this.el;
    this.content = this.getPart("content");
    this.contentPanel = this.getPart("content-panel");
    this.config.preventDefaultKeys = ["Escape"];
  }

  afterMount() {
    const requestedState =
      this.el.dataset.saladuiPreservedState ||
      (this.el.dataset.open === undefined
        ? this.el.dataset.state || "closed"
        : this.el.dataset.open === "true"
          ? "open"
          : "closed");

    delete this.el.dataset.saladuiPreservedState;

    if (requestedState === this.state) {
      if (this.state === "open") this.onOpenEnter();
      return;
    }

    this.transition(requestedState === "open" ? "open" : "close");
  }

  getComponentConfig() {
    return {
      stateMachine: {
        closed: {
          enter: "onClosedEnter",
          exit: "onClosedExit",
          transitions: {
            open: "open",
          },
        },
        open: {
          enter: "onOpenEnter",
          transitions: {
            close: "closed",
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
          content: true,
        },
        open: {
          content: false,
        },
      },
      ariaConfig: {
        content: {
          open: {
            hidden: "false",
          },
          closed: {
            hidden: "true",
          },
        },
        "content-panel": {
          all: {
            role: this.options.role || "dialog",
          },
          open: {
            modal: "true",
            labelledby: () => this.getPartId("title"),
            describedby: () => this.getPartId("description"),
          },
        },
        "close-trigger": {
          all: {
            label: "Close dialog",
          },
        },
      },
    };
  }

  // Setup component events
  setupComponentEvents() {
    super.setupComponentEvents();

    // Only setup click handler if closeOnOutsideClick is enabled
    if (this.options.closeOnOutsideClick) {
      this.setupOutsideClickDetection();
    }
  }

  setupOutsideClickDetection() {
    // Create click outside monitor to handle clicks on the overlay
    this.clickOutsideMonitor = new ClickOutsideMonitor(
      [this.contentPanel],
      (event) => {
        // Only close if click was directly on the content container (overlay area)
        if (
          event.target === this.content ||
          event.target.dataset.part === "overlay"
        ) {
          this.transition("close");
        }
      },
    );
  }

  teardownComponentEvents() {
    super.teardownComponentEvents();

    // Clean up click outside monitor
    this.clickOutsideMonitor?.destroy();
    this.clickOutsideMonitor = null;
  }

  // State machine handlers
  onClosedEnter() {
    // Clean up focus trap
    if (this.focusTrap) {
      this.focusTrap.deactivate();
    }

    // Clean up click outside monitor
    if (this.clickOutsideMonitor) {
      this.clickOutsideMonitor.stop();
    }

    // Notify the server of the state change
    this.pushEvent("closed");
  }

  onClosedExit() {
    // No special handling needed
  }

  onOpenEnter() {
    // Initialize focus trap if not already created
    this.el.focus();
    if (!this.focusTrap) {
      this.focusTrap = new FocusTrap(this.contentPanel);
    }

    // Activate focus trap
    this.focusTrap.activate();

    // Activate click outside monitor if enabled
    if (this.clickOutsideMonitor) {
      this.clickOutsideMonitor.start();
    }

    // Setup escape key handling - now handled by the component's keyMap

    // Notify the server of the state change
    this.pushEvent("opened");
  }

  beforeDestroy() {
    // Clean up focus trap
    this.focusTrap?.destroy();
    this.focusTrap = null;
  }
}

// Register the component
SaladUI.register("dialog", DialogComponent);

export default DialogComponent;
