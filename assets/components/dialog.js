// saladui/components/dialog.js (Refactored)
import Component from "../core/component";
import SaladUI from "../index";
import FocusTrap from "../core/focus-trap";
import ClickOutsideMonitor from "../core/click-outside";

class DialogComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);

    // Initialize properties
    this.root = this.el;
    this.content = this.getPart("content");
    this.contentPanel = this.getPart("content-panel");
    this.config.preventDefaultKeys = ["Escape"];
  }

  // Override the getStateMachine method
  getStateMachine() {
    return {
      closed: {
        enter: "onClosedEnter",
        exit: "onClosedExit",
        keyMap: {},
        transitions: {
          open: "open",
        },
        hidden: {
          content: true,
        },
      },
      open: {
        enter: "onOpenEnter",
        keyMap: {
          Escape: "close",
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
      content: {
        all: {
          role: "dialog",
        },
        open: {
          hidden: "false",
          modal: "true",
        },
        closed: {
          hidden: "true",
        },
      },
      "content-panel": {
        open: {
          labelledby: () => this.getPartId("title"),
          describedby: () => this.getPartId("description"),
        },
      },
      "close-trigger": {
        all: {
          label: "Close dialog",
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
    if (!this.focusTrap) {
      this.focusTrap = new FocusTrap(this.contentPanel, {
        focusableSelector: this.config.focusableSelector,
      });
    }

    // Activate focus trap
    this.focusTrap.activate();

    // Activate click outside monitor if enabled
    if (this.clickOutsideMonitor) {
      this.clickOutsideMonitor.start();
    }

    // Setup escape key handling
    this.contentPanel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.transition("close");
      }
    });

    // Notify the server of the state change
    this.pushEvent("opened");
  }

  beforeDestroy() {
    // Clean up focus trap
    if (this.focusTrap) {
      this.focusTrap.destroy();
      this.focusTrap = null;
    }

    // Clean up click outside monitor
    if (this.clickOutsideMonitor) {
      this.clickOutsideMonitor.destroy();
      this.clickOutsideMonitor = null;
    }
  }
}

// Register the component
SaladUI.register("dialog", DialogComponent);

export default DialogComponent;
