// saladui/components/dialog.js - Refactored version
import Component from "../core";
import SaladUI from "../index";

class DialogComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);

    // Initialize properties
    this.root = this.el;
    this.content = this.getPart("content");
    this.contentPanel = this.getPart("content-panel");

    this.previouslyFocused = null;
    this.config.preventDefaultKeys = ["Escape", "Tab"];
  }

  // Override the getStateMachine method - removed aria property
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
          Tab: this.onTabKey,
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

  // Setup component events - no changes needed
  setupComponentEvents() {
    super.setupComponentEvents();

    // Only setup click handler if closeOnOutsideClick is enabled
    if (this.options.closeOnOutsideClick) {
      // Using event delegation for clicks on the overlay
      this.content.addEventListener("click", (e) => {
        // Close if click was directly on the content container (overlay area)
        if (e.target === this.content || e.target.dataset.part == "overlay") {
          this.transition("close");
        }
      });
    }
  }

  // State machine handlers - removed direct ARIA manipulation
  onClosedEnter(params = {}) {
    // Return focus to the element that had it before dialog opened
    if (this.previouslyFocused && this.previouslyFocused.focus) {
      setTimeout(() => {
        this.previouslyFocused.focus();
        this.previouslyFocused = null;
      }, 0);
    }

    // Notify the server of the state change
    this.pushEvent("closed");
  }

  onClosedExit() {
    // Store the currently focused element to return focus to later
    this.previouslyFocused = document.activeElement;
  }

  onOpenEnter(params = {}) {
    // Set focus on the first focusable element
    if (params.animated) {
      setTimeout(() => this.setInitialFocus(), 50);
    } else {
      this.setInitialFocus();
    }

    // Notify the server of the state change
    this.pushEvent("opened");
  }

  // Helper methods - unchanged
  setInitialFocus() {
    // Get all focusable elements inside the dialog
    const focusableElements = Array.from(
      this.contentPanel.querySelectorAll(this.config.focusableSelector),
    );

    // Set focus on the first focusable element, or the dialog content itself
    setTimeout(() => {
      if (focusableElements.length > 0) {
        const autoFocusEl = this.content.querySelector("[autofocus]");
        const initialFocusEl = autoFocusEl || focusableElements[0];
        initialFocusEl.focus();
      } else {
        // If no focusable elements, make the content focusable and focus it
        this.contentPanel.setAttribute("tabindex", "-1");
        this.contentPanel.focus();
      }
    }, 50);
  }

  onTabKey(event) {
    // Get all focusable elements inside the dialog panel
    const focusableElements = Array.from(
      this.contentPanel.querySelectorAll(this.config.focusableSelector),
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    // Handle tab and shift+tab to create a focus trap
    if (!event.shiftKey && activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    } else if (event.shiftKey && activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
    }
  }
}

// Register the component
SaladUI.register("dialog", DialogComponent);

export default DialogComponent;
