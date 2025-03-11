// saladui/core/positioner.js - with always passing scroll events

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
   * Apply position to an element
   */
  static applyPosition(element, x, y) {
    element.style.position = "absolute";
    element.style.transform = `translate(${x}px, ${y}px)`;
    element.style.top = "0";
    element.style.left = "0";
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

  static findScrollableParents(element) {
    const scrollableParents = [];
    let currentElement = element;

    while (currentElement && currentElement !== document.body) {
      const style = window.getComputedStyle(currentElement);
      if (
        style.overflow === "auto" ||
        style.overflow === "scroll" ||
        style.overflowX === "auto" ||
        style.overflowX === "scroll" ||
        style.overflowY === "auto" ||
        style.overflowY === "scroll"
      ) {
        scrollableParents.push(currentElement);
      }
      currentElement = currentElement.parentElement;
    }

    // Always include window for global scrolling
    scrollableParents.push(window);

    return scrollableParents;
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
      alignOffset: 0,
      sideOffset: 8,
      trapFocus: false,
      usePortal: true,
      portalContainer: document.body,
      focusableSelector:
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      onEscape: null,
      onOutsideClick: null,
      ...options,
    };

    // handle case option is null
    this.options.portalContainer =
      this.options.portalContainer || document.body;

    // State
    this.isActive = false;
    this.isInPortal = false;
    this.originalParent = null;
    this.originalStyles = null;
    this.animationFrameId = null;

    this.eventHandlers = {
      scroll: this.handleScroll.bind(this),
      resize: this.handleResize.bind(this),
      keydown: this.handleKeyDown.bind(this),
      outsideClick: this.handleOutsideClick.bind(this),
      wheel: this.handleWheel.bind(this),
      touchstart: this.handleTouchStart.bind(this),
      touchmove: this.handleTouchMove.bind(this),
    };

    this.resizeObserver = null;

    // Focus management
    this.previouslyFocused = null;
    this.focusTrapActive = false;
  }

  /**
   * Move element to portal container (usually document.body)
   */
  moveToPortal() {
    if (!this.isInPortal && this.options.usePortal) {
      // Store reference to original parent
      this.originalParent = this.element.parentElement;

      // Save original styles before modifying
      this.originalStyles = {
        position: this.element.style.position,
        top: this.element.style.top,
        left: this.element.style.left,
        zIndex: this.element.style.zIndex,
        margin: this.element.style.margin,
        transform: this.element.style.transform,
        pointerEvents: this.element.style.pointerEvents,
      };

      // Move to portal container (usually body)
      this.options.portalContainer.appendChild(this.element);

      // Set absolute positioning with high z-index
      this.element.style.position = "absolute";
      this.element.style.zIndex = "9999";

      // Always setup scroll passthrough
      this.setupScrollPassthrough();

      this.isInPortal = true;
    }
  }

  /**
   * Setup scroll event passthrough for the portal element
   */
  setupScrollPassthrough() {
    // Apply pointer-events: none to the portal element to allow scroll events to pass through
    this.element.style.pointerEvents = "none";

    // Set pointer-events: auto on interactive elements inside the portal
    const interactiveElements = this.element.querySelectorAll(
      this.options.focusableSelector + ", [data-interactive]",
    );

    interactiveElements.forEach((el) => {
      el.style.pointerEvents = "auto";
    });

    // Add wheel and touch event listeners to handle scroll passthrough
    this.element.addEventListener("wheel", this.eventHandlers.wheel, {
      passive: false,
    });
    this.element.addEventListener("touchstart", this.eventHandlers.touchstart, {
      passive: false,
    });
    this.element.addEventListener("touchmove", this.eventHandlers.touchmove, {
      passive: false,
    });
  }

  /**
   * Clean up scroll event passthrough setup
   */
  cleanupScrollPassthrough() {
    if (!this.element) return;

    // Remove wheel and touch event listeners
    this.element.removeEventListener("wheel", this.eventHandlers.wheel);
    this.element.removeEventListener(
      "touchstart",
      this.eventHandlers.touchstart,
    );
    this.element.removeEventListener("touchmove", this.eventHandlers.touchmove);

    // Reset pointer-events styles
    if (this.originalStyles && this.originalStyles.pointerEvents) {
      this.element.style.pointerEvents = this.originalStyles.pointerEvents;
    } else {
      this.element.style.pointerEvents = "";
    }

    // Reset pointer-events on interactive elements
    const interactiveElements = this.element.querySelectorAll(
      this.options.focusableSelector + ", [data-interactive]",
    );

    interactiveElements.forEach((el) => {
      el.style.pointerEvents = "";
    });
  }

  /**
   * Handle wheel events on the portal element
   */
  handleWheel(event) {
    // Let the wheel event pass through to the element underneath
    event.stopPropagation();
  }

  /**
   * Store touch start position for handling touch events
   */
  handleTouchStart(event) {
    // Store initial touch position for touchmove handling
    if (event.touches.length === 1) {
      this.touchStartY = event.touches[0].clientY;
    }
  }

  /**
   * Handle touch move events to allow scrolling underneath
   */
  handleTouchMove(event) {
    if (!this.touchStartY) return;

    // Determine scroll direction
    const touchY = event.touches[0].clientY;
    const deltaY = this.touchStartY - touchY;
    this.touchStartY = touchY;

    // Find the element that should receive the scroll
    const elementsFromPoint = document.elementsFromPoint(
      event.touches[0].clientX,
      event.touches[0].clientY,
    );

    // Find first scrollable parent that is not our portal element
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
      // Allow the event to propagate to scrollable element
      scrollableElement.scrollTop += deltaY;
      event.preventDefault();
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

    // Always clean up scroll passthrough if it was in portal
    if (this.isInPortal) {
      this.cleanupScrollPassthrough();
    }

    this.restoreElement();
    this.detachEventListeners();

    if (this.options.trapFocus && this.focusTrapActive) {
      this.deactivateFocusTrap();
    }

    return this;
  }

  /**
   * Restore element to its original parent and reset positioning styles
   */
  restoreElement() {
    // Move element back to original parent if it's in portal
    if (this.isInPortal && this.element && this.originalParent) {
      try {
        this.originalParent.appendChild(this.element);

        // Restore original styles if we saved them
        if (this.originalStyles) {
          this.element.style.position = this.originalStyles.position;
          this.element.style.top = this.originalStyles.top;
          this.element.style.left = this.originalStyles.left;
          this.element.style.zIndex = this.originalStyles.zIndex;
          this.element.style.margin = this.originalStyles.margin;
          this.element.style.transform = this.originalStyles.transform || "";
          this.element.style.pointerEvents =
            this.originalStyles.pointerEvents || "";
        } else {
          // Fallback if originalStyles wasn't set for some reason
          this.element.style.position = "";
          this.element.style.top = "";
          this.element.style.left = "";
          this.element.style.zIndex = "";
          this.element.style.margin = "";
          this.element.style.transform = "";
          this.element.style.pointerEvents = "";
        }

        this.isInPortal = false;
      } catch (e) {
        console.warn(
          "SaladUI: Failed to restore element to original parent",
          e,
        );
      }
    }
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
   * Destroy the positioner instance and clean up references
   */
  destroy() {
    this.deactivate();

    // Cancel any pending animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Clean up references
    this.element = null;
    this.reference = null;
    this.originalParent = null;
    this.originalStyles = null;
    this.options = null;
    this.eventHandlers = null;
    this.resizeObserver = null;
    this.touchStartY = null;
  }

  // The rest of the class methods remain unchanged
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

  attachEventListeners() {
    // Get all scrollable parents of the reference element
    this.scrollableParents = Positioner.findScrollableParents(this.reference);

    // Attach scroll event listeners to all scrollable parents
    this.scrollableParents.forEach((parent) => {
      parent.addEventListener("scroll", this.eventHandlers.scroll, {
        passive: true,
      });
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

  detachEventListeners() {
    if (this.scrollableParents) {
      this.scrollableParents.forEach((parent) => {
        parent.removeEventListener("scroll", this.eventHandlers.scroll);
      });
    }
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

    // Cancel any pending animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.options.trapFocus) {
      this.element.removeEventListener("keydown", this.eventHandlers.keydown);
    }
  }

  handleScroll() {
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.update();
        this.animationFrameId = null;
      });
    }
  }

  handleResize() {
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.update();
        this.animationFrameId = null;
      });
    }
  }

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

  deactivateFocusTrap() {
    this.focusTrapActive = false;

    // Return focus to previously focused element only if it's in the viewport
    if (this.previouslyFocused && this.previouslyFocused.focus) {
      setTimeout(() => {
        // Check if the element is in the viewport
        if (this.isElementInViewport(this.previouslyFocused)) {
          this.previouslyFocused.focus();
        }
        this.previouslyFocused = null;
      }, 0);
    }
  }

  /**
   * Check if an element is in the viewport
   * @param {HTMLElement} element - The element to check
   * @returns {boolean} - Whether the element is in the viewport
   */
  isElementInViewport(element) {
    if (!element || !document.body.contains(element)) {
      return false;
    }

    const rect = element.getBoundingClientRect();

    // Check if element is within viewport
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

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

  getFocusableElements() {
    return Array.from(
      this.element.querySelectorAll(this.options.focusableSelector),
    );
  }
}

export default Positioner;
