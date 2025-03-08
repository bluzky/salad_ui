// saladui/components/dialog.js - Refactored version
import Component from "../core";
import SaladUI from "../index";

class DialogComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);

    // Initialize properties
    this.root = this.el;
    this.trigger = this.getPart("trigger");
    this.content = this.getPart("content");
    this.contentPanel = this.getPart("content-panel");
    this.closeTrigger = this.getPart("close-trigger");

    this.previouslyFocused = null;
    this.config.preventDefaultKeys = ["Escape", "Tab"];

    // Initialize state based on open attribute
    if (this.el.getAttribute("data-state") === "open") {
      this.content.style.display = "flex";
    } else {
      this.content.style.display = "none";
    }
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
      },
      open: {
        enter: "onOpenEnter",
        exit: "onOpenExit",
        keyMap: {
          Escape: "close",
          Tab: "onTabKey",
        },
        transitions: {
          close: "closed",
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

    // Setup trigger click event
    if (this.trigger) {
      this.trigger.addEventListener("click", () => {
        this.transition("open");
      });
    }

    // Setup close trigger click event
    if (this.closeTrigger) {
      this.closeTrigger.addEventListener("click", () => {
        this.transition("close");
      });
    }
  }

  // REMOVED: updateAriaAttributes method is no longer needed

  // State machine handlers - removed direct ARIA manipulation
  onClosedEnter(params = {}) {
    // Only hide the dialog content, not the entire component
    if (!params.animated) {
      this.content.style.display = "none";
    }

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
    // Show the dialog content
    if (!params.animated) {
      this.content.style.display = "flex";
    }

    // Set focus on the first focusable element
    if (params.animated) {
      setTimeout(() => this.setInitialFocus(), 50);
    } else {
      this.setInitialFocus();
    }

    // Notify the server of the state change
    this.pushEvent("opened");
  }

  onOpenExit() {
    // No action needed
  }

  onTabKey(event) {
    this.handleTabKey(event);
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

  handleTabKey(event) {
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
