// saladui/core/positioner.js
/**
 * Core Positioning utility for SaladUI components
 * Handles pure positioning calculations without side effects
 */
class Positioner {
  /**
   * Calculate position for an element relative to a reference element
   *
   * @param {HTMLElement} element - The element to position
   * @param {HTMLElement} reference - The reference element to position against
   * @param {Object} options - Positioning options
   * @returns {Object} The computed position data
   */
  static calculate(element, reference, options = {}) {
    const {
      placement = "bottom",
      alignment = "center",
      container = document.body,
      flip = true,
      alignOffset = 0,
      sideOffset = 8,
    } = options;

    // Get element and reference rects for positioning
    const elementRect = element.getBoundingClientRect();
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
   * Apply position to an element
   * @param {HTMLElement} element - Element to position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  static applyPosition(element, x, y) {
    element.style.position = "absolute";
    element.style.transform = `translate(${x}px, ${y}px)`;
    element.style.top = "0";
    element.style.left = "0";
    element.style.margin = "0"; // Reset margins to avoid positioning issues
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
   * Utility method to find all scrollable parent elements
   */
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

export default Positioner;
