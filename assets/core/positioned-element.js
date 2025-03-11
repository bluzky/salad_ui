// saladui/core/positioned-element.js
/**
 * PositionedElement - Main positioning class that integrates all positioning utilities
 */
import Positioner from "./positioner";
import FocusTrap from "./focus-trap";
import ClickOutsideMonitor from "./click-outside";
import Portal from "./portal";
import ScrollManager from "./scroll-manager";

class PositionedElement {
  /**
   * Create a positioned element with full functionality
   *
   * @param {HTMLElement} element - Element to position
   * @param {HTMLElement} reference - Reference element to position against
   * @param {Object} options - Positioning options
   */
  constructor(element, reference, options = {}) {
    this.element = element;
    this.reference = reference;
    this.options = {
      // Positioning options
      placement: "bottom",
      alignment: "center",
      sideOffset: 8,
      alignOffset: 0,
      flip: true,

      // Portal options
      usePortal: true,
      portalContainer: document.body,

      // Focus management
      trapFocus: false,
      focusableSelector:
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',

      // Event handlers
      onOutsideClick: null,

      ...options,
    };

    // State
    this.active = false;

    // Initialize sub-modules
    this.initializeModules();
  }

  /**
   * Initialize all required modules
   */
  initializeModules() {
    // Focus trap for keyboard navigation
    this.focusTrap = new FocusTrap(this.element, {
      focusableSelector: this.options.focusableSelector,
    });

    // Click outside detection
    this.clickOutsideMonitor = this.options.onOutsideClick
      ? new ClickOutsideMonitor(
          [this.element, this.reference],
          this.options.onOutsideClick,
        )
      : null;

    // Scroll and resize handling
    this.scrollManager = new ScrollManager(() => {
      this.update();
    });

    // Bind methods for event handlers
    this.handleWheel = this.handleWheel.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
  }

  /**
   * Activate the positioned element
   */
  activate() {
    if (this.active) return this;

    // Move to portal if enabled
    if (this.options.usePortal) {
      this.moveToPortal();
    }

    // Calculate and apply initial position
    this.calculateAndApplyPosition();

    // Activate sub-modules
    if (this.options.trapFocus) {
      this.focusTrap.activate();
    }

    if (this.clickOutsideMonitor) {
      this.clickOutsideMonitor.start();
    }

    this.scrollManager.start(this.reference, this.element);

    // Add wheel and touch event handlers if in portal
    if (Portal.isInPortal(this.element)) {
      this.setupScrollPassthrough();
    }

    this.active = true;
    return this;
  }

  /**
   * Deactivate the positioned element
   */
  deactivate() {
    if (!this.active) return this;

    // Deactivate sub-modules
    if (this.options.trapFocus) {
      this.focusTrap.deactivate();
    }

    if (this.clickOutsideMonitor) {
      this.clickOutsideMonitor.stop();
    }

    this.scrollManager.stop();

    // Clean up scroll passthrough if in portal
    if (Portal.isInPortal(this.element)) {
      this.cleanupScrollPassthrough();
    }

    // Restore from portal if needed
    if (this.inPortal) {
      this.restoreFromPortal();
    }

    this.active = false;
    return this;
  }

  /**
   * Update position
   */
  update() {
    if (this.active) {
      this.calculateAndApplyPosition();
    }
    return this;
  }

  /**
   * Move element to portal container
   */
  moveToPortal() {
    if (Portal.isInPortal(this.element)) return;

    const container = this.options.portalContainer || document.body;
    Portal.move(this.element, container);
  }

  /**
   * Restore element from portal
   */
  restoreFromPortal() {
    if (!Portal.isInPortal(this.element)) return;

    Portal.restore(this.element);
  }

  /**
   * Calculate and apply position to the element
   */
  calculateAndApplyPosition() {
    const position = Positioner.calculate(
      this.element,
      this.reference,
      this.options,
    );

    // Apply positioning
    if (Portal.isInPortal(this.element)) {
      // Account for scroll position if in portal
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      Positioner.applyPosition(
        this.element,
        position.x + scrollX,
        position.y + scrollY,
      );
    } else {
      Positioner.applyPosition(this.element, position.x, position.y);
    }

    // Update placement attribute
    this.element.setAttribute("data-placement", position.placement);

    return position;
  }

  /**
   * Set up scroll event passthrough
   */
  setupScrollPassthrough() {
    Portal.setupScrollPassthrough(this.element, this.options.focusableSelector);

    // Add wheel and touch event handlers
    this.element.addEventListener("wheel", this.handleWheel, {
      passive: false,
    });
    this.element.addEventListener("touchstart", this.handleTouchStart, {
      passive: false,
    });
    this.element.addEventListener("touchmove", this.handleTouchMove, {
      passive: false,
    });
  }

  /**
   * Clean up scroll passthrough
   */
  cleanupScrollPassthrough() {
    if (!this.element) return;

    // Remove wheel and touch event handlers
    this.element.removeEventListener("wheel", this.handleWheel);
    this.element.removeEventListener("touchstart", this.handleTouchStart);
    this.element.removeEventListener("touchmove", this.handleTouchMove);

    // Clean up styles
    Portal.cleanupScrollPassthrough(this.element);
  }

  /**
   * Handle wheel events for scroll passthrough
   */
  handleWheel(event) {
    // Let the wheel event pass through
    event.stopPropagation();
  }

  /**
   * Handle touch start for scroll passthrough
   */
  handleTouchStart(event) {
    // Store initial touch position
    if (event.touches.length === 1) {
      this.touchStartY = event.touches[0].clientY;
    }
  }

  /**
   * Handle touch move for scroll passthrough
   */
  handleTouchMove(event) {
    if (!this.touchStartY) return;

    // Determine scroll direction
    const touchY = event.touches[0].clientY;
    const deltaY = this.touchStartY - touchY;
    this.touchStartY = touchY;

    // Find element that should receive scroll
    const elementsFromPoint = document.elementsFromPoint(
      event.touches[0].clientX,
      event.touches[0].clientY,
    );

    // Find first scrollable element that is not our portal
    const scrollableElement = elementsFromPoint.find((el) => {
      if (el === this.element || this.element.contains(el)) return false;

      const style = window.getComputedStyle(el);
      return (
        style.overflowY === "auto" ||
        style.overflowY === "scroll" ||
        el === document.documentElement
      );
    });

    if (scrollableElement) {
      // Pass scroll to found element
      scrollableElement.scrollTop += deltaY;
      event.preventDefault();
    }
  }

  /**
   * Update the reference element
   */
  updateReference(reference) {
    this.reference = reference;

    // Update click outside monitor
    if (this.clickOutsideMonitor) {
      this.clickOutsideMonitor.updateElements([this.element, this.reference]);
    }

    this.update();
    return this;
  }

  /**
   * Update options
   */
  updateOptions(options = {}) {
    this.options = { ...this.options, ...options };

    // Update focus trap options if needed
    if (this.focusTrap && options.focusableSelector) {
      this.focusTrap.options = {
        ...this.focusTrap.options,
        focusableSelector: options.focusableSelector,
      };
    }

    this.update();
    return this;
  }

  /**
   * Clean up and destroy the positioned element
   */
  destroy() {
    this.deactivate();

    // Destroy sub-modules
    this.focusTrap.destroy();
    if (this.clickOutsideMonitor) {
      this.clickOutsideMonitor.destroy();
    }
    this.scrollManager.destroy();

    // Clear references
    this.element = null;
    this.reference = null;
    this.options = null;
    this.focusTrap = null;
    this.clickOutsideMonitor = null;
    this.scrollManager = null;
    this.touchStartY = null;
  }
}

export default PositionedElement;
