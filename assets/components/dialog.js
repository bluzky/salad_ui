// saladui/components/dialog.js
import Component from '../core';
import SaladUI from '../index';

class DialogComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);

    // Initialize properties (previously in init())
    this.root = this.el;
    this.trigger = this.getPart('trigger');
    this.content = this.getPart('content');
    this.closeTrigger = this.getPart('close-trigger');

    this.previouslyFocused = null;
    this.config.preventDefaultKeys = ['Escape', 'Tab'];

    // Initialize state based on open attribute
    if (this.el.getAttribute('data-state') === 'open') {
      this.content.style.display = 'flex';
    } else {
      this.content.style.display = 'none';
    }
  }

  // Override the getStateMachine method
  getStateMachine() {
    return {
      closed: {
        enter: 'onClosedEnter',
        exit: 'onClosedExit',
        aria: {
          "hidden": "true"
        },
        keyMap: {},
        transitions: {
          open: "open"
        }
      },
      open: {
        enter: 'onOpenEnter',
        exit: 'onOpenExit',
        aria: {
          "hidden": "false",
          "modal": "true"
        },
        keyMap: {
          "Escape": "close",
          "Tab": "onTabKey"
        },
        transitions: {
          close: "closed"
        }
      }
    };
  }

  // Override the setupComponentEvents method
  setupComponentEvents() {
    // Only setup click handler if closeOnOutsideClick is enabled
    if (this.options.closeOnOutsideClick) {
      // Using event delegation for clicks on the overlay
      this.content.addEventListener('click', (e) => {
        // Close if click was directly on the content container (overlay area)
        if (e.target === this.content || e.target.classList.contains('saladui-dialog-overlay')) {
          this.transition('close');
        }
      });
    }

    // Setup trigger click event
    if (this.trigger) {
      this.trigger.addEventListener('click', () => {
        this.transition('open');
      });
    }

    // Setup close trigger click event
    if (this.closeTrigger) {
      this.closeTrigger.addEventListener('click', () => {
        this.transition('close');
      });
    }
  }

  // Override updateAriaAttributes - can now use super properly!
  updateAriaAttributes() {
    super.updateAriaAttributes();

    // Setup proper ARIA attributes for accessibility
    if (this.state === 'open' && this.content) {
      this.content.setAttribute('role', 'dialog');
      this.content.setAttribute('aria-modal', 'true');

      const title = this.el.querySelector('.saladui-dialog-title');
      if (title) {
        this.content.setAttribute('aria-labelledby', title.id);
      }

      const description = this.el.querySelector('.saladui-dialog-description');
      if (description) {
        this.content.setAttribute('aria-describedby', description.id);
      }
    }
  }

  // State machine handlers
  onClosedEnter(params = {}) {
    // Only hide the dialog content, not the entire component
    if (!params.animated) {
      this.content.style.display = 'none';
    }

    // Update ARIA attributes
    this.content.setAttribute('aria-hidden', 'true');

    // Return focus to the element that had it before dialog opened
    if (this.previouslyFocused && this.previouslyFocused.focus) {
      setTimeout(() => {
        this.previouslyFocused.focus();
        this.previouslyFocused = null;
      }, 0);
    }

    // Notify the server of the state change
    this.pushEvent('closed');
  }

  onClosedExit() {
    // Store the currently focused element to return focus to later
    this.previouslyFocused = document.activeElement;
  }

  onOpenEnter(params = {}) {
    // Show the dialog content
    if (!params.animated) {
      this.content.style.display = 'flex';
    }

    // Update ARIA attributes
    this.content.setAttribute('aria-hidden', 'false');

    // Set focus on the first focusable element
    if (params.animated) {
      setTimeout(() => this.setInitialFocus(), 50);
    } else {
      this.setInitialFocus();
    }

    // Notify the server of the state change
    this.pushEvent('opened');
  }

  onOpenExit() {
    // No action needed
  }

  onTabKey(event) {
    this.handleTabKey(event);
  }

  // Helper methods
  setInitialFocus() {
    // Get all focusable elements inside the dialog
    const focusableElements = Array.from(
      this.content.querySelectorAll(this.config.focusableSelector)
    ).filter(el => {
      // Only include elements inside the panel, not in the overlay
      return el.closest('.saladui-dialog-panel');
    });

    // Set focus on the first focusable element, or the dialog content itself
    setTimeout(() => {
      if (focusableElements.length > 0) {
        const autoFocusEl = this.content.querySelector('[autofocus]');
        const initialFocusEl = autoFocusEl || focusableElements[0];
        initialFocusEl.focus();
      } else {
        // If no focusable elements, make the content focusable and focus it
        this.content.querySelector('.saladui-dialog-panel').setAttribute('tabindex', '-1');
        this.content.querySelector('.saladui-dialog-panel').focus();
      }
    }, 50);
  }

  handleTabKey(event) {
    // Get all focusable elements inside the dialog panel
    const focusableElements = Array.from(
      this.content.querySelectorAll(this.config.focusableSelector)
    ).filter(el => {
      return el.closest('.saladui-dialog-panel');
    });

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    // Handle tab and shift+tab to create a focus trap
    if (!event.shiftKey && activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    }
    else if (event.shiftKey && activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
    }
  }
}

// Register the component
SaladUI.register('dialog', DialogComponent);

export default DialogComponent;
