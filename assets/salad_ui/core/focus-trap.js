// saladui/core/focus-trap.js
/**
 * FocusTrap utility for SaladUI components
 * Manages focus behavior for modals, popovers, and similar components
 */
class FocusTrap {
  /**
   * Create a focus trap for a specific element
   *
   * @param {HTMLElement} element - The element to trap focus within
   * @param {Object} options - Focus trap options
   */
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      focusableSelector:
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ...options,
    };

    this.previouslyFocused = null;
    this.active = false;

    // Bind methods that will be used as event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Activate the focus trap
   */
  activate() {
    if (this.active) return;

    // Store currently focused element to restore later
    this.previouslyFocused = document.activeElement;
    this.active = true;

    // Set up event listener for keyboard navigation
    this.element.addEventListener("keydown", this.handleKeyDown);

    // Focus the first focusable element or the element itself
    this.setInitialFocus();
  }

  /**
   * Deactivate the focus trap and restore previous focus
   */
  deactivate() {
    if (!this.active) return;

    // Remove event listeners
    this.element.removeEventListener("keydown", this.handleKeyDown);

    // Restore focus if possible
    if (
      this.previouslyFocused &&
      this.previouslyFocused.focus &&
      this.isElementInViewport(this.previouslyFocused)
    ) {
      setTimeout(() => {
        this.previouslyFocused.focus();
        this.previouslyFocused = null;
      }, 0);
    }

    this.active = false;
  }

  /**
   * Set initial focus when trap is activated
   */
  setInitialFocus() {
    // Find all focusable elements
    const focusableElements = this.getFocusableElements();

    setTimeout(() => {
      if (focusableElements.length > 0) {
        // Look for an element with autofocus attribute first
        const autoFocusEl = this.element.querySelector("[autofocus]");
        const initialFocusEl = autoFocusEl || focusableElements[0];
        initialFocusEl.focus();
      } else {
        // If no focusable elements, make the element itself focusable
        this.element.setAttribute("tabindex", "-1");
        this.element.focus();
      }
    }, 50); // Small delay to ensure DOM is ready
  }

  /**
   * Handle keydown events for tab trapping and escape handling
   */
  handleKeyDown(event) {
    // Handle Tab key for focus trapping
    if (event.key === "Tab") {
      const focusableElements = this.getFocusableElements();

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      // Create focus loop
      if (!event.shiftKey && activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      } else if (event.shiftKey && activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * Get all focusable elements within the trap
   */
  getFocusableElements() {
    return Array.from(
      this.element.querySelectorAll(this.options.focusableSelector),
    );
  }

  /**
   * Check if an element is currently visible in the viewport
   */
  isElementInViewport(element) {
    if (!element || !document.body.contains(element)) {
      return false;
    }

    const rect = element.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Clean up all references when no longer needed
   */
  destroy() {
    this.deactivate();
    this.element = null;
    this.options = null;
    this.previouslyFocused = null;
  }
}

export default FocusTrap;
