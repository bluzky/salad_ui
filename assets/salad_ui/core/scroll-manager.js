// saladui/core/scroll-manager.js
/**
 * ScrollManager utility for SaladUI components
 * Manages scroll and resize event handlers with optimized performance
 */
class ScrollManager {
  /**
   * Create a scroll manager to handle scroll and resize events
   *
   * @param {Function} updateCallback - Function to call when scroll/resize events occur
   * @param {Object} options - Additional options
   */
  constructor(updateCallback, options = {}) {
    this.updateCallback = updateCallback;
    this.options = {
      // Use requestAnimationFrame for throttling
      useRAF: true,
      ...options,
    };

    this.scrollableParents = [];
    this.active = false;
    this.resizeObserver = null;
    this.animationFrameId = null;

    // Bind methods to maintain correct context
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
  }

  /**
   * Start tracking scroll and resize events
   *
   * @param {HTMLElement} referenceElement - Element to track scrollable parents for
   * @param {HTMLElement} targetElement - Optional element to observe with ResizeObserver
   */
  start(referenceElement, targetElement = null) {
    if (this.active) return;

    // Find scrollable parent elements
    if (referenceElement) {
      this.scrollableParents = this.findScrollableParents(referenceElement);

      // Add scroll listeners to all scrollable parents
      this.scrollableParents.forEach((parent) => {
        parent.addEventListener("scroll", this.handleScroll, { passive: true });
      });
    }

    // Add resize listener
    window.addEventListener("resize", this.handleResize, { passive: true });

    // Set up ResizeObserver for element size changes if available
    if (targetElement && typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.updatePosition);
      this.resizeObserver.observe(targetElement);

      if (referenceElement && referenceElement !== targetElement) {
        this.resizeObserver.observe(referenceElement);
      }
    }

    this.active = true;
  }

  /**
   * Stop tracking scroll and resize events
   */
  stop() {
    if (!this.active) return;

    // Remove scroll listeners
    this.scrollableParents.forEach((parent) => {
      parent.removeEventListener("scroll", this.handleScroll);
    });

    // Remove resize listener
    window.removeEventListener("resize", this.handleResize);

    // Disconnect ResizeObserver if present
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Cancel any pending animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.active = false;
    this.scrollableParents = [];
  }

  /**
   * Handle scroll events with throttling
   */
  handleScroll() {
    if (this.options.useRAF) {
      this.throttledUpdate();
    } else {
      this.updatePosition();
    }
  }

  /**
   * Handle resize events with throttling
   */
  handleResize() {
    if (this.options.useRAF) {
      this.throttledUpdate();
    } else {
      this.updatePosition();
    }
  }

  /**
   * Throttle updates using requestAnimationFrame
   */
  throttledUpdate() {
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.updatePosition();
        this.animationFrameId = null;
      });
    }
  }

  /**
   * Call the update callback
   */
  updatePosition() {
    if (this.updateCallback) {
      this.updateCallback();
    }
  }

  /**
   * Find all scrollable parent elements
   */
  findScrollableParents(element) {
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

  /**
   * Clean up all references
   */
  destroy() {
    this.stop();
    this.updateCallback = null;
    this.options = null;
  }
}

export default ScrollManager;
