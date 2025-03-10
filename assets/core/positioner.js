// saladui/core/positioner.js

/**
 * Enhanced Positioning utility for SaladUI components
 * Provides consistent positioning logic for popovers, dropdowns, tooltips, etc.
 * Adds focus trapping, activation/deactivation, and scroll/resize event handling
 * Uses portal pattern to avoid issues with overflow hidden containers
 */
class Positioner {
  /**
   * Position an element relative to a reference element
   *
   * @param {HTMLElement} element - The element to position
   * @param {HTMLElement} reference - The reference element to position against
   * @param {Object} options - Positioning options
   * @param {string} options.placement - Placement of element (top, right, bottom, left)
   * @param {string} options.alignment - Alignment (start, center, end)
   * @param {HTMLElement} options.container - Container to constrain element within
   * @param {boolean} options.flip - Whether to flip placement if not enough space
   * @param {boolean} options.shift - Whether to shift element to keep in view
   * @param {number} options.sideOffset - Space between reference and element in the primary axis
   * @param {number} options.alignOffset - Offset in the secondary/alignment axis
   * @param {boolean} options.trapFocus - Whether to trap focus within the element
   * @param {string} options.focusableSelector - Selector for focusable elements
   * @param {Function} options.onEscape - Handler for Escape key when focus is trapped
   * @param {Function} options.onOutsideClick - Handler for clicks outside the element and reference
   * @returns {Object} Positioner instance with methods to control positioning
   */
  static create(element, reference, options = {}) {
    return new PositionerInstance(element, reference, options);
  }

  /**
   * Position an element relative to a reference element (one-time calculation)
   *
   * @param {HTMLElement} element - The element to position
   * @param {HTMLElement} reference - The reference element to position against
   * @param {Object} options - Positioning options
   * @returns {Object} The computed placement and coordinates
   */
  static position(element, reference, options = {}) {
    const {
      placement = "bottom",
      alignment = "center",
      container = document.body,
      flip = true,
      shift = true,
      alignOffset = 0,
      sideOffset = 8,
    } = options;

    // Get rects for positioning calculations
    const elementRect = element.getBoundingClientRect();
    // Use viewport coordinates for reference
    const referenceRect = reference.getBoundingClientRect();

    // Find container bounds
    let containerRect;
    if (container === document.body) {
      containerRect = {
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    } else {
      containerRect = container.getBoundingClientRect();
    }

    // Calculate initial position
    let { x, y } = this.getBasePosition(
      placement,
      alignment,
      elementRect,
      referenceRect,
      alignOffset,
      sideOffset,
    );

    // Apply flipping if needed
    let actualPlacement = placement;
    if (flip) {
      const flippedPlacement = this.getFlippedPlacement(
        placement,
        { x, y, width: elementRect.width, height: elementRect.height },
        containerRect,
      );

      if (flippedPlacement !== placement) {
        actualPlacement = flippedPlacement;
        const flippedPosition = this.getBasePosition(
          flippedPlacement,
          alignment,
          elementRect,
          referenceRect,
          alignOffset,
          sideOffset,
        );
        x = flippedPosition.x;
        y = flippedPosition.y;
      }
    }

    // Shift to keep in view if needed
    if (shift) {
      const shiftedPosition = this.getShiftedPosition(
        { x, y, width: elementRect.width, height: elementRect.height },
        containerRect,
      );
      x = shiftedPosition.x;
      y = shiftedPosition.y;
    }

    return {
      x,
      y,
      placement: actualPlacement,
    };
  }

  /**
   * Calculate base position based on placement and alignment
   */
  static getBasePosition(
    placement,
    alignment,
    elementRect,
    referenceRect,
    alignOffset = 0,
    sideOffset = 8,
  ) {
    let x = 0;
    let y = 0;

    // Position based on placement
    switch (placement) {
      case "top":
        y = referenceRect.top - elementRect.height - sideOffset;
        break;
      case "right":
        x = referenceRect.right + sideOffset;
        y = referenceRect.top;
        break;
      case "bottom":
        y = referenceRect.bottom + sideOffset;
        break;
      case "left":
        x = referenceRect.left - elementRect.width - sideOffset;
        y = referenceRect.top;
        break;
    }

    // Adjust based on alignment
    switch (alignment) {
      case "start":
        if (placement === "top" || placement === "bottom") {
          x = referenceRect.left + alignOffset;
        } else {
          y = referenceRect.top + alignOffset;
        }
        break;
      case "center":
        if (placement === "top" || placement === "bottom") {
          x =
            referenceRect.left +
            referenceRect.width / 2 -
            elementRect.width / 2 +
            alignOffset;
        } else {
          y =
            referenceRect.top +
            referenceRect.height / 2 -
            elementRect.height / 2 +
            alignOffset;
        }
        break;
      case "end":
        if (placement === "top" || placement === "bottom") {
          x = referenceRect.right - elementRect.width + alignOffset;
        } else {
          y = referenceRect.bottom - elementRect.height + alignOffset;
        }
        break;
    }

    return { x, y };
  }

  /**
   * Determine if placement should be flipped due to lack of space
   */
  static getFlippedPlacement(placement, elementCoords, containerRect) {
    const { x, y, width, height } = elementCoords;

    // Check if element would overflow container
    const overflowTop = y < containerRect.top;
    const overflowRight = x + width > containerRect.right;
    const overflowBottom = y + height > containerRect.bottom;
    const overflowLeft = x < containerRect.left;

    // Determine if we need to flip
    switch (placement) {
      case "top":
        if (overflowTop && !overflowBottom) {
          return "bottom";
        }
        break;
      case "right":
        if (overflowRight && !overflowLeft) {
          return "left";
        }
        break;
      case "bottom":
        if (overflowBottom && !overflowTop) {
          return "top";
        }
        break;
      case "left":
        if (overflowLeft && !overflowRight) {
          return "right";
        }
        break;
    }

    return placement;
  }

  /**
   * Shift position to ensure element stays within container bounds
   */
  static getShiftedPosition(elementCoords, containerRect) {
    let { x, y, width, height } = elementCoords;

    // Constrain horizontally
    if (x < containerRect.left) {
      x = containerRect.left;
    } else if (x + width > containerRect.right) {
      x = containerRect.right - width;
    }

    // Constrain vertically
    if (y < containerRect.top) {
      y = containerRect.top;
    } else if (y + height > containerRect.bottom) {
      y = containerRect.bottom - height;
    }

    return { x, y };
  }

  /**
   * Apply position to an element
   */
  static applyPosition(element, x, y) {
    element.style.position = "absolute";
    element.style.top = `${y}px`;
    element.style.left = `${x}px`;
    element.style.margin = "0"; // Reset margins to avoid positioning issues
  }

  /**
   * Get element rect with absolute position accounting for all scroll parents
   */
  static getOffsetRect(element) {
    const rect = element.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    return {
      top: rect.top + scrollY,
      right: rect.right + scrollX,
      bottom: rect.bottom + scrollY,
      left: rect.left + scrollX,
      width: rect.width,
      height: rect.height,
    };
  }
}

/**
 * Positioner instance that manages an individual positioned element
 * Handles activation, deactivation, focus trapping, and event handling
 * Uses portal pattern to avoid issues with overflow hidden containers
 */
class PositionerInstance {
  constructor(element, reference, options = {}) {
    this.element = element;
    this.reference = reference;
    this.options = {
      placement: "bottom",
      alignment: "center",
      flip: true,
      shift: true,
      alignOffset: 0,
      sideOffset: 8,
      trapFocus: false,
      usePortal: true, // New option to control portal usage
      portalContainer: document.body, // Container to move element to
      focusableSelector:
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      onEscape: null,
      onOutsideClick: null,
      ...options,
    };

    // State
    this.isActive = false;
    this.isInPortal = false;
    this.originalParent = null;
    this.eventHandlers = {
      scroll: this.handleScroll.bind(this),
      resize: this.handleResize.bind(this),
      keydown: this.handleKeyDown.bind(this),
      outsideClick: this.handleOutsideClick.bind(this),
    };

    // Throttling state
    this.scrollThrottleTimeout = null;
    this.resizeThrottleTimeout = null;
    this.resizeObserver = null;

    // Focus management
    this.previouslyFocused = null;
    this.focusTrapActive = false;
  }

  /**
   * Move element to portal container (usually document.body)
   * This avoids issues with overflow hidden containers
   */
  moveToPortal() {
    if (!this.isInPortal && this.options.usePortal) {
      // Store reference to original parent
      this.originalParent = this.element.parentElement;

      // Move to portal container (usually body)
      this.options.portalContainer.appendChild(this.element);

      // Set absolute positioning with high z-index
      this.element.style.position = "absolute";
      this.element.style.zIndex = "9999";

      this.isInPortal = true;
    }
  }

  /**
   * Activate the positioner, calculate position and start monitoring events
   */
  activate() {
    if (this.isActive) return;

    this.isActive = true;

    // Move to portal if enabled
    if (this.options.usePortal) {
      this.moveToPortal();
    }

    this.calculateAndApplyPosition();
    this.attachEventListeners();

    if (this.options.trapFocus) {
      this.activateFocusTrap();
    }

    return this;
  }

  /**
   * Deactivate the positioner, stop monitoring events
   */
  deactivate() {
    if (!this.isActive) return;

    this.isActive = false;
    this.detachEventListeners();

    if (this.options.trapFocus && this.focusTrapActive) {
      this.deactivateFocusTrap();
    }

    return this;
  }

  /**
   * Update position of the element (can be called manually)
   */
  update() {
    if (this.isActive) {
      this.calculateAndApplyPosition();
    }
    return this;
  }

  /**
   * Update the reference element
   * @param {HTMLElement} reference - New reference element
   */
  updateReference(reference) {
    this.reference = reference;
    this.update();
    return this;
  }

  /**
   * Update positioning options
   * @param {Object} options - New positioning options
   */
  updateOptions(options = {}) {
    this.options = { ...this.options, ...options };
    this.update();
    return this;
  }

  /**
   * Calculate and apply position to the element
   */
  calculateAndApplyPosition() {
    const position = Positioner.position(
      this.element,
      this.reference,
      this.options,
    );

    // If element is in portal, account for window scrolling
    if (this.isInPortal) {
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

    this.element.setAttribute("data-placement", position.placement);

    return position;
  }

  /**
   * Attach event listeners for scroll and resize events
   */
  attachEventListeners() {
    // Watch for scroll events that might affect positioning
    window.addEventListener("scroll", this.eventHandlers.scroll, {
      passive: true,
    });
    window.addEventListener("resize", this.eventHandlers.resize, {
      passive: true,
    });

    // Add outside click detection if handler is provided
    if (typeof this.options.onOutsideClick === "function") {
      document.addEventListener("click", this.eventHandlers.outsideClick);
      document.addEventListener("touchend", this.eventHandlers.outsideClick);
    }

    // Use ResizeObserver for the reference element if available
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this.update();
      });
      this.resizeObserver.observe(this.reference);
    }

    // If focus trapping is enabled, add keydown listener for tab and escape keys
    if (this.options.trapFocus) {
      this.element.addEventListener("keydown", this.eventHandlers.keydown);
    }
  }

  /**
   * Detach event listeners
   */
  detachEventListeners() {
    window.removeEventListener("scroll", this.eventHandlers.scroll);
    window.removeEventListener("resize", this.eventHandlers.resize);

    // Remove outside click handler if it was added
    if (typeof this.options.onOutsideClick === "function") {
      document.removeEventListener("click", this.eventHandlers.outsideClick);
      document.removeEventListener("touchend", this.eventHandlers.outsideClick);
    }

    // Disconnect ResizeObserver if it was created
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Clear any pending throttle timeouts
    if (this.scrollThrottleTimeout) {
      clearTimeout(this.scrollThrottleTimeout);
      this.scrollThrottleTimeout = null;
    }

    if (this.resizeThrottleTimeout) {
      clearTimeout(this.resizeThrottleTimeout);
      this.resizeThrottleTimeout = null;
    }

    if (this.options.trapFocus) {
      this.element.removeEventListener("keydown", this.eventHandlers.keydown);
    }
  }

  /**
   * Handle scroll events with throttling
   */
  handleScroll() {
    if (this.scrollThrottleTimeout) return;
    this.scrollThrottleTimeout = setTimeout(() => {
      this.update();
      this.scrollThrottleTimeout = null;
    }, 16); // ~60fps throttle rate
  }

  /**
   * Handle window resize events with throttling
   */
  handleResize() {
    if (this.resizeThrottleTimeout) return;
    this.resizeThrottleTimeout = setTimeout(() => {
      this.update();
      this.resizeThrottleTimeout = null;
    }, 16); // ~60fps throttle rate
  }

  /**
   * Activate focus trap within the element
   */
  activateFocusTrap() {
    this.previouslyFocused = document.activeElement;
    this.focusTrapActive = true;

    // Set initial focus
    setTimeout(() => {
      const focusableElements = this.getFocusableElements();
      if (focusableElements.length > 0) {
        const autoFocus = this.element.querySelector("[autofocus]");
        const elementToFocus = autoFocus || focusableElements[0];
        elementToFocus.focus();
      } else {
        // If no focusable elements, make the element itself focusable
        this.element.setAttribute("tabindex", "-1");
        this.element.focus();
      }
    }, 50);
  }

  /**
   * Deactivate focus trap and restore previous focus
   */
  deactivateFocusTrap() {
    this.focusTrapActive = false;

    // Return focus to previously focused element
    if (this.previouslyFocused && this.previouslyFocused.focus) {
      setTimeout(() => {
        this.previouslyFocused.focus();
        this.previouslyFocused = null;
      }, 0);
    }
  }

  /**
   * Handle keydown events for focus trapping
   */
  handleKeyDown(event) {
    // Handle Tab key to trap focus
    if (event.key === "Tab") {
      const focusableElements = this.getFocusableElements();

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      // Create focus trap with Tab and Shift+Tab
      if (!event.shiftKey && activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      } else if (event.shiftKey && activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    }
    // Handle Escape key
    else if (
      event.key === "Escape" &&
      typeof this.options.onEscape === "function"
    ) {
      this.options.onEscape(event);
    }
  }

  /**
   * Handle outside click events
   * @param {Event} event - The click or touch event
   */
  handleOutsideClick(event) {
    // Skip if not active
    if (!this.isActive) return;

    // Get the clicked element
    const target = event.target;

    // Check if click was outside both the positioned element and reference element
    if (!this.element.contains(target) && !this.reference.contains(target)) {
      // Call the outside click handler with the event
      this.options.onOutsideClick(event);
    }
  }

  /**
   * Get all focusable elements within the positioned element
   */
  getFocusableElements() {
    return Array.from(
      this.element.querySelectorAll(this.options.focusableSelector),
    );
  }

  /**
   * Destroy the positioner instance and clean up references
   */
  destroy() {
    this.deactivate();

    // Move element back to original parent if it's in portal
    if (this.isInPortal && this.element && this.originalParent) {
      try {
        this.originalParent.appendChild(this.element);

        // Reset positioning styles
        this.element.style.position = "";
        this.element.style.top = "";
        this.element.style.left = "";
        this.element.style.zIndex = "";
        this.element.style.margin = "";
      } catch (e) {
        console.warn(
          "SaladUI: Failed to restore element to original parent",
          e,
        );
      }
    }

    // Clear any remaining throttle timeouts
    if (this.scrollThrottleTimeout) {
      clearTimeout(this.scrollThrottleTimeout);
    }

    if (this.resizeThrottleTimeout) {
      clearTimeout(this.resizeThrottleTimeout);
    }

    // Clean up references
    this.element = null;
    this.reference = null;
    this.originalParent = null;
    this.options = null;
    this.eventHandlers = null;
    this.scrollThrottleTimeout = null;
    this.resizeThrottleTimeout = null;
    this.resizeObserver = null;
  }
}

export default Positioner;
