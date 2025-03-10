// saladui/core/positioner.js

/**
 * Positioning utility for SaladUI components
 * Provides consistent positioning logic for popovers, dropdowns, tooltips, etc.
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
   * @param {Object} options.offset - Offset from reference { x: 0, y: 0 }
   * @returns {Object} The computed placement and coordinates
   */
  static position(element, reference, options = {}) {
    const {
      placement = "bottom",
      alignment = "center",
      container = document.body,
      flip = true,
      shift = true,
      offset = { x: 0, y: 0 },
      sideOffset = 8,
    } = options;

    // Get rects for positioning calculations
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
      offset,
      options.sideOffset,
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
          offset,
          options.sideOffset,
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
    offset,
    sideOffset = 8,
  ) {
    let x = 0;
    let y = 0;

    // Position based on placement
    switch (placement) {
      case "top":
        y = referenceRect.top - elementRect.height - sideOffset + offset.y;
        break;
      case "right":
        x = referenceRect.right + sideOffset + offset.x;
        y = referenceRect.top;
        break;
      case "bottom":
        y = referenceRect.bottom + sideOffset + offset.y;
        break;
      case "left":
        x = referenceRect.left - elementRect.width - sideOffset + offset.x;
        y = referenceRect.top;
        break;
    }

    // Adjust based on alignment
    switch (alignment) {
      case "start":
        if (placement === "top" || placement === "bottom") {
          x = referenceRect.left + offset.x;
        } else {
          y = referenceRect.top + offset.y;
        }
        break;
      case "center":
        if (placement === "top" || placement === "bottom") {
          x =
            referenceRect.left +
            referenceRect.width / 2 -
            elementRect.width / 2 +
            offset.x;
        } else {
          y =
            referenceRect.top +
            referenceRect.height / 2 -
            elementRect.height / 2 +
            offset.y;
        }
        break;
      case "end":
        if (placement === "top" || placement === "bottom") {
          x = referenceRect.right - elementRect.width + offset.x;
        } else {
          y = referenceRect.bottom - elementRect.height + offset.y;
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
    element.style.top = `${y}px`;
    element.style.left = `${x}px`;
  }

  /**
   * Find the first container with overflow hidden
   */
  static findOverflowContainer(element) {
    let parent = element.parentElement;

    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent);
      if (
        style.overflow === "hidden" ||
        style.overflowY === "hidden" ||
        style.overflowX === "hidden"
      ) {
        return parent;
      }
      parent = parent.parentElement;
    }

    return document.body;
  }
}

export default Positioner;
