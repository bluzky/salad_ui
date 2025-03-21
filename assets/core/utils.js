// saladui/core/animation-utils.js
/**
 * Animation utilities for SaladUI framework components
 * Provides functions to handle animations and transitions
 */

/**
 * Animation handler for state transitions
 *
 * @param {Object} animConfig - Animation configuration object
 * @param {HTMLElement} targetElement - Element to animate
 * @returns {Promise} A Promise that resolves when animation completes
 */
export function animateTransition(animConfig, targetElement) {
  if (!animConfig || !targetElement) {
    return Promise.resolve(); // Return resolved promise if no animation or target
  }

  const { animation, duration = 200 } = animConfig;

  // Process animation classes
  const animationClasses = (animation || ["", "", ""]).map((item) =>
    typeof item === "string" ? item.split(/\s+/) : [],
  );

  // Execute animation with promise
  return executeAnimation(targetElement, {
    animation: animationClasses,
    duration,
  });
}

/**
 * Execute animation sequence on target element
 *
 * @param {HTMLElement} targetElement - Element to animate
 * @param {Object} animOptions - Animation options
 * @returns {Promise} Promise that resolves when animation completes
 */
export function executeAnimation(targetElement, animOptions) {
  console.log("Animating", targetElement, animOptions);
  return new Promise((resolve) => {
    const { animation, duration } = animOptions;
    let [transitionRun, transitionStart, transitionEnd] = animation || [
      [],
      [],
      [],
    ];

    // First animation frame: apply start classes
    addOrRemoveClasses(
      targetElement,
      transitionStart,
      [].concat(transitionRun).concat(transitionEnd),
    );

    // Next frame: apply running classes
    window.requestAnimationFrame(() => {
      addOrRemoveClasses(targetElement, transitionRun, []);

      // Next frame: apply end classes
      window.requestAnimationFrame(() =>
        addOrRemoveClasses(targetElement, transitionEnd, transitionStart),
      );
    });

    // After duration, clean up classes and resolve promise
    setTimeout(() => {
      addOrRemoveClasses(
        targetElement,
        [],
        [].concat(transitionRun).concat(transitionStart).concat(transitionEnd),
      );

      resolve();
    }, duration);
  });
}

/**
 * Add and remove CSS classes from a target element
 *
 * @param {HTMLElement} targetElement - Element to modify classes on
 * @param {Array} addClasses - Classes to add
 * @param {Array} removeClasses - Classes to remove
 */
export function addOrRemoveClasses(
  targetElement,
  addClasses = [],
  removeClasses = [],
) {
  if (!targetElement) return;

  if (addClasses.length > 0) {
    targetElement.classList.add(...addClasses.filter(Boolean));
  }
  if (removeClasses.length > 0) {
    targetElement.classList.remove(...removeClasses.filter(Boolean));
  }
}
