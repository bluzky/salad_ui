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

/**
 * Filter result constants
 * @enum {number}
 */
const FilterResult = {
  IGNORE_AND_CONTINUE: 0, // Ignore node but traverse children
  SELECT_AND_CONTINUE: 1, // Select node and traverse children
  IGNORE_AND_SKIP: -1, // Ignore node and skip children
};

/**
 * Custom DOM query selector with advanced filtering capabilities
 *
 * @param {Node} root - Starting DOM node
 * @param {Function} filterFunction - Function returning a FilterResult value
 * @param {Object} [options] - Optional settings
 * @param {boolean} [options.breadthFirst=true] - Use breadth-first (true) or depth-first (false)
 * @returns {Element[]} Matching elements
 */
export function queryDOM(
  root,
  filterFunction,
  options = { breadthFirst: true },
) {
  // Validate inputs
  if (!(root instanceof Node)) throw new TypeError("Root must be a DOM node");
  if (typeof filterFunction !== "function")
    throw new TypeError("Filter must be a function");

  const result = [];
  const nodes = [...root.children];
  const getNext =
    options.breadthFirst !== false ? () => nodes.shift() : () => nodes.pop();

  while (nodes.length > 0) {
    const current = getNext();

    // Skip non-element nodes
    if (!(current instanceof Element)) continue;

    // Process based on filter result
    const filterResult = filterFunction(current);

    if (filterResult === FilterResult.SELECT_AND_CONTINUE) {
      result.push(current);
      addChildren(current, nodes);
    } else if (filterResult === FilterResult.IGNORE_AND_CONTINUE) {
      addChildren(current, nodes);
    }
    // IGNORE_AND_SKIP: do nothing
  }

  return result;
}

/**
 * Add element's children to the traversal collection
 */
function addChildren(element, collection) {
  for (let i = 0; i < element.children.length; i++) {
    collection.push(element.children[i]);
  }
}
