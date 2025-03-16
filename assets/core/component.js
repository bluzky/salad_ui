// saladui/core/component.js
/**
 * Base Component class for SaladUI framework
 * Provides state management, event handling, and ARIA support
 */

/**
 * # Defining State Machines in SaladUI
 *
 * State machines are the core of SaladUI components, controlling component behavior and UI states.
 * Here's how to define them:
 *
 * ## Basic Structure
 *
 * ```javascript
 * getStateMachine() {
 *   return {
 *     idle: {                         // State name
 *       enter: "onIdleEnter",         // Handler called when entering state
 *       exit: "onIdleExit",           // Handler called when exiting state
 *       keyMap: {                     // Key event mappings
 *         ArrowDown: "open",          // Maps key to transition
 *         Enter: this.someFunction    // Maps key to function
 *       },
 *       mouseMap: {                   // Mouse event mappings
 *         trigger: {                  // Part name (matching data-part attribute)
 *           mouseenter: "open",       // Maps mouse event to transition
 *           click: this.handleClick           // Maps mouse event to transition
 *         },
 *         content: {                  // Another part
 *           mouseleave: "close"       // Maps mouse event to transition
 *         }
 *       },
 *       transitions: {                // Possible transitions from this state
 *         open: "open",               // Event name → target state
 *       },
 *       hidden: {                     // Control visibility of parts
 *         content: true,              // Hide the "content" part in this state
 *       }
 *     },
 *     // Additional states...
 *   };
 * }
 * ```
 *
 * ## Key Components
 *
 * 1. States: Named objects (like `idle`, `open`, `closed`) representing component states
 * 2. Enter/Exit Handlers: Functions called when entering/exiting a state
 * 3. Transitions: Define valid state changes and their triggers
 * 4. KeyMap: Map keyboard events to transitions or functions
 * 5. Hidden: Control part visibility in each state
 * 6. MouseMap: Map mouse events to transitions or functions. **Note:** Mouse events are delegated to closest parent with a data-part attribute.
 *
 * ## State Handler Types
 *
 * State handlers (enter/exit) can be defined in multiple ways:
 *
 * 1. String method name:
 *    - `enter: "onIdleEnter"` - Calls the method `this.onIdleEnter(params)`
 *    - The method must exist on the component instance
 *
 * 2. Function reference:
 *    - `enter: function(params) { ... }` - Inline anonymous function
 *    - `enter: this.customEnterHandler` - Reference to instance method
 *    - Function receives state params and 'this' is bound to component
 *
 * 3. Null or undefined:
 *    - If handler is not specified, no action is taken
 *
 * ## Transition Handler Types
 *
 * Transitions define how the component moves between states:
 *
 * 1. String target state:
 *    - `open: "opened"` - Directly transitions to "opened" state
 *
 * 2. Function returning target state:
 *    - ```
 *      open: function(params) {
 *        return params.condition ? "state1" : "state2";
 *      }
 *      ```
 *    - Dynamically determines target state based on parameters
 *
 * 3. Conditional object:
 *    - ```
 *      open: {
 *        "condition1": "state1",
 *        "condition2": "state2",
 *        "default": "fallbackState"
 *      }
 *      ```
 *    - Tests conditions against params and selects matching state
 *    - "default" serves as fallback when no condition matches
 *
 * 4. Null or undefined:
 *    - If transition is not defined for an event, nothing happens
 *
 * ## Handler Methods
 *
 * Handlers can be either string references to methods or direct function references:
 *
 * ```javascript
 * onOpenEnter(params = {}) {
 *   // Logic when entering "open" state
 *   this.pushEvent("opened");
 * }
 * ```
 *
 * State machines work with the `AriaManager` to automatically update ARIA attributes as states change.
 */

class Component {
  constructor(el, hookContext) {
    this.el = el;
    this.hook = hookContext;

    this.config = {
      preventDefaultKeys: [],
      focusableSelector:
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    };

    // Initialize component
    this.parseOptions();
    this.initEventMappings();
    this.initStateMachine();
    this.ariaManager = new AriaManager(this);
    this.allParts = Array.from(this.el.querySelectorAll("[data-part]"));
    this.updateUI();
    this.updatePartsVisibility();

    // Create a map to store event handlers for cleanup
    this.mouseEventHandlers = new Map();
  }

  parseOptions() {
    try {
      const optionsString = this.el.getAttribute("data-options");
      this.options = optionsString ? JSON.parse(optionsString) : {};
      this.initialState = this.el.getAttribute("data-state") || "idle";
    } catch (error) {
      console.error("SaladUI: Error parsing component options:", error);
      this.options = {};
    }
  }

  initEventMappings() {
    try {
      const mappingsString = this.el.getAttribute("data-event-mappings");
      this.eventMappings = mappingsString ? JSON.parse(mappingsString) : {};
    } catch (error) {
      console.error("SaladUI: Error parsing event mappings:", error);
      this.eventMappings = {};
    }
  }

  initStateMachine() {
    this.state = this.initialState;
    this.previousState = null;
    this.stateMachine = this.getStateMachine();
  }

  // Override in subclasses to define component-specific state machine
  getStateMachine() {
    return {
      idle: {
        enter: "onIdleEnter",
        exit: "onIdleExit",
        transitions: {},
      },
    };
  }

  setupEvents() {
    this.el.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.el.addEventListener("click", this.handleActionClick.bind(this));
    // Setup mouse event listeners based on the mouseMap
    this.setupMouseEventHandlers();
    this.setupComponentEvents();
  }

  // Override in component subclasses
  setupComponentEvents() {}

  // Handle keydown events
  // each state defines a keyMap object to map key events to actions
  // actions can be strings (state transitions) or functions
  handleKeyDown(event) {
    const stateConfig = this.stateMachine[this.state];
    if (!stateConfig?.keyMap) return;

    const key = event.key;
    const action = stateConfig.keyMap[key];

    if (action) {
      this.executeHandler(action, event);
      if (this.config.preventDefaultKeys.includes(key)) {
        event.preventDefault();
      }
    }
  }

  handleActionClick(event) {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) return;

    const action = actionElement.getAttribute("data-action");
    this.transition(action, {
      originalEvent: event,
      target: actionElement,
    });
  }

  // During component initialization
  setupMouseEventHandlers() {
    // Collect all unique event types from all states
    const eventTypes = new Set();

    // Loop through all states
    Object.values(this.stateMachine).forEach((stateConfig) => {
      if (!stateConfig.mouseMap) return;

      // Loop through all elements in this state's mouseMap
      Object.values(stateConfig.mouseMap).forEach((elementEvents) => {
        // Add each event type to our set of unique events
        Object.keys(elementEvents).forEach((eventType) => {
          eventTypes.add(eventType);
        });
      });
    });

    // Set up a single delegated listener for each unique event type
    eventTypes.forEach((eventType) => {
      const boundHandler = this.handleMouseEvent.bind(this, eventType);

      // Store the bound handler for cleanup
      this.mouseEventHandlers.set(eventType, boundHandler);

      // Add the event listener
      this.el.addEventListener(eventType, boundHandler, true);
    });
  }

  /**
   * Remove all active mouse event listeners
   */
  removeMouseEventListeners() {
    if (this.mouseEventHandlers) {
      this.mouseEventHandlers.forEach((handler, eventType) => {
        this.el.removeEventListener(eventType, handler, true);
      });
      this.mouseEventHandlers.clear();
    }

    this.mouseEventHandlers.clear();
  }

  /**
   * Handle mouse events according to the current state's mouseMap. It looks for the closest parents with a data-part attribute and checks if it's in the mouseMap. If it is, it executes the handler and stops looking. So if you have nested elements which listen to the same event, only the closest one will be triggered.
   * For example:
   * ```
   * <div data-part="parent">
   *   <button data-part="child">Click me</button>
   * </div>
   * ```
   * and the mouseMap is:
   * ```
   * parent: {
   *   click: "parentClickHandler"
   * },
   * child: {
   *   click: "childClickHandler"
   * }
   * ```
   * If you click the button, only the `childClickHandler` is executed.
   *
   * @param {string} eventType - The type of mouse event
   * @param {Event} event - The event object
   */
  handleMouseEvent(eventType, event) {
    const stateConfig = this.stateMachine[this.state];
    if (!stateConfig?.mouseMap) return;

    // Get the keys from the mouseMap to know what element names we're looking for
    const validElementNames = Object.keys(stateConfig.mouseMap);
    if (validElementNames.length === 0) return;

    // Start with the event target and navigate up
    let targetElement = event.target;

    // Navigate up the DOM to find a matching element
    while (targetElement && targetElement !== this.el) {
      // Check if this element has a data-part attribute
      if (targetElement.hasAttribute("data-part")) {
        const partName = targetElement.getAttribute("data-part");

        // Check if this part name is in our mouseMap
        if (
          validElementNames.includes(partName) &&
          stateConfig.mouseMap[partName]?.[eventType]
        ) {
          this.executeHandler(
            stateConfig.mouseMap[partName][eventType],
            event,
            targetElement,
          );
          return;
        }
      }

      // Move up to parent element
      targetElement = targetElement.parentElement;
    }
  }

  /**
   * Execute a handler from the mouseMap
   * @param {Function|string} handler - The handler function or transition name
   * @param {Event} event - The original event object
   * @param {HTMLElement} targetElement - The element that matched
   */
  executeHandler(handler, event, targetElement) {
    if (typeof handler === "function") {
      handler.call(this, event);
    } else if (typeof handler === "string") {
      if (typeof this[handler] === "function") {
        this[handler](event);
      } else {
        // If it's not a method name, treat as transition
        this.transition(handler, {
          originalEvent: event,
          target: targetElement,
        });
      }
    }
  }

  // Transition to a new state
  transition(event, params = {}) {
    const currentStateConfig = this.stateMachine[this.state];
    if (!currentStateConfig) return false;

    const transition = currentStateConfig.transitions?.[event];
    if (!transition) return false;

    const nextState = this.determineNextState(transition, params);
    if (!nextState) return false;

    const prevState = this.state;
    const transitionName = `${prevState}_to_${nextState}`;

    const hasAnimation =
      this.options.animations &&
      (this.options.animations[transitionName] ||
        this.options.animations[nextState]);

    if (hasAnimation) {
      this.animateTransition(prevState, nextState, params);
    } else {
      this.executeTransition(prevState, nextState, params);
    }

    return true;
  }

  // Split from transition method for clarity
  determineNextState(transition, params) {
    if (typeof transition === "string") {
      return transition;
    } else if (typeof transition === "function") {
      return transition.call(this, params);
    } else if (typeof transition === "object") {
      for (const [condition, target] of Object.entries(transition)) {
        if (
          condition === "default" ||
          this.evaluateCondition(condition, params)
        ) {
          return target;
        }
      }
    }
    return null;
  }

  executeTransition(prevState, nextState, params = {}) {
    // Execute exit handlers
    this.executeStateHandlers(prevState, "exit", params);

    // Update state
    this.state = nextState;
    this.previousState = prevState;

    // Execute enter handlers
    this.executeStateHandlers(nextState, "enter", params);

    this.updatePartsVisibility();

    // Update UI
    this.updateUI();
  }

  // Split from executeTransition
  executeStateHandlers(stateName, handlerType, params) {
    const stateConfig = this.stateMachine[stateName];
    if (!stateConfig) return;

    const handler = stateConfig[handlerType];

    if (typeof handler === "string") {
      if (typeof this[handler] === "function") {
        this[handler](params);
      }
    } else if (typeof handler === "function") {
      handler.call(this, params);
    }
  }

  // Split animation logic into smaller methods
  animateTransition(prevState, nextState, params = {}) {
    const transitionName = `${prevState}_to_${nextState}`;
    const animConfig =
      this.options.animations[transitionName] ||
      this.options.animations[nextState];

    if (!animConfig) {
      this.executeTransition(prevState, nextState, params);
      return;
    }

    // Prepare for animation
    const { targetElement, animOptions } = this.prepareAnimation(animConfig);

    // Execute exit handlers with animated flag
    this.executeStateHandlers(prevState, "exit", { ...params, animated: true });

    // Update state
    this.state = nextState;
    this.previousState = prevState;

    // Start animation
    this.performAnimation(targetElement, animOptions, nextState, params);

    // Update UI
    this.updateUI();
  }

  // Animation helper methods
  prepareAnimation(animConfig) {
    let {
      animation,
      duration = 200,
      timing = null,
      target_part = null,
    } = animConfig;

    // Determine which element to animate
    let targetElement = this.el;
    if (target_part) {
      const partElement = this.getPart(target_part);
      if (partElement) {
        targetElement = partElement;
      }
    }

    // split animation classes
    animation = (animation || ["", "", ""]).map((item) => item.split(/\s+/));

    return {
      targetElement,
      animOptions: {
        animation,
        duration,
        timing,
      },
    };
  }

  performAnimation(targetElement, animOptions, nextState, params) {
    const { transition, duration } = animOptions;

    let [transitionRun, transitionStart, transitionEnd] = transition || [
      [],
      [],
      [],
    ];

    this.addOrRemoveClasses(
      targetElement,
      transitionStart,
      [].concat(transitionRun).concat(transitionEnd),
    );
    window.requestAnimationFrame(() => {
      this.addOrRemoveClasses(targetElement, transitionRun, []);
      window.requestAnimationFrame(() =>
        this.addOrRemoveClasses(targetElement, transitionEnd, transitionStart),
      );
    });

    setTimeout(() => {
      this.addOrRemoveClasses(
        targetElement,
        transitionEnd,
        [].concat(transitionRun).concat(transitionStart),
      );
      this.updatePartsVisibility();
      // Call enter handler with animated flag
      this.executeStateHandlers(nextState, "enter", {
        ...params,
        animated: true,
      });
    }, duration);
  }

  addOrRemoveClasses(targetElement, addClasses = [], removeClasses = []) {
    if (addClasses.length > 0) {
      targetElement.classList.add(...addClasses);
    }
    if (removeClasses.length > 0) {
      targetElement.classList.remove(...removeClasses);
    }
  }

  evaluateCondition(condition, params) {
    return params[condition] !== undefined;
  }

  // Update UI to reflect current state
  updateUI() {
    if (this.state === this.previousState) return;

    this.allParts.forEach((el) => el.setAttribute("data-state", this.state));
    this.el.setAttribute("data-state", this.state);

    this.ariaManager.applyAriaAttributes(this.state);
  }

  updatePartsVisibility() {
    const hiddenParts = this.stateMachine[this.state].hidden || {};
    Object.entries(hiddenParts).forEach(([part, hidden]) => {
      const partElements = this.getAllParts(part);
      partElements.forEach((element) => {
        if (element) {
          element.hidden = hidden;
        }
      });
    });
  }

  // Override in component subclasses
  getAriaConfig() {
    return {};
  }

  getPart(name) {
    return this.el.querySelector(`[data-part="${name}"]`);
  }

  getAllParts(name) {
    return this.allParts.filter((part) => part.dataset.part === name);
  }

  getPartId(partName) {
    const part = this.getPart(partName);
    if (!part) return null;

    if (!part.id) {
      part.id = `${this.el.id}-${partName}`;
    }
    return part.id;
  }

  getFocusableElements() {
    return Array.from(this.el.querySelectorAll(this.config.focusableSelector));
  }

  // Push event to server (for frameworks like Phoenix LiveView)
  pushEvent(clientEvent, payload = {}) {
    if (!this.hook || !this.hook.pushEventTo) return;

    const eventHandler = this.eventMappings[clientEvent];

    if (eventHandler) {
      if (typeof eventHandler === "string") {
        const fullPayload = {
          ...payload,
          componentId: this.el.id,
          component: this.el.getAttribute("data-component"),
        };

        this.hook.pushEventTo(this.el, eventHandler, fullPayload);
      } else {
        this.hook.liveSocket.execJS(this.el, JSON.stringify(eventHandler));
      }
    }
  }

  // Cleanup method to remove event listeners and references
  destroy() {
    // Lifecycle hook before destruction
    this.beforeDestroy();

    // Remove event listeners
    this.el.removeEventListener("keydown", this.handleKeyDown);
    this.el.removeEventListener("click", this.handleActionClick);
    this.removeMouseEventListeners();
    this.ariaManager = null;

    // No registry reference to remove

    // Allow garbage collection
    this.el = null;
    this.hook = null;
    this.options = null;
    this.stateMachine = null;
  }

  // Lifecycle hooks
  beforeDestroy() {}

  // Alias for transition()
  handleCommand(command, params = {}) {
    return this.transition(command, params);
  }

  // Alias for transition()
  trigger(event, params = {}) {
    return this.transition(event, params);
  }
}

/**
 * # Defining ARIA Configuration in SaladUI
 *
 * ARIA configurations enable automatic accessibility attribute management based on component state.
 * Here's how to define them:
 *
 * ## Basic Structure
 *
 * ```javascript
 * getAriaConfig() {
 *   return {
 *     trigger: {                       // Part name (matching data-part attribute)
 *       all: {                         // Attributes applied in all states
 *         haspopup: "listbox",         // Sets aria-haspopup="listbox"
 *         role: "button"               // Sets role="button"
 *       },
 *       open: {                        // State-specific attributes
 *         expanded: "true",            // Sets aria-expanded="true" in open state
 *       },
 *       closed: {                      // Another state
 *         expanded: "false",           // Sets aria-expanded="false" in closed state
 *       }
 *     },
 *     content: {                       // Another component part
 *       all: {
 *         role: "listbox",             // Applied regardless of state
 *       },
 *       open: {
 *         hidden: "false",             // Sets aria-hidden="false" in open state
 *       },
 *       closed: {
 *         hidden: "true",              // Sets aria-hidden="true" in closed state
 *       }
 *     }
 *   };
 * }
 * ```
 *
 * ## Key Components
 *
 * 1. Part Selectors: Keys matching data-part attributes in your component
 * 2. State Selectors: `all` and specific state names (like `open`, `closed`)
 * 3. ARIA Attributes: Key-value pairs defining attributes to apply
 *
 * ## Attribute Value Types
 *
 * Attribute values can be defined in multiple ways:
 *
 * 1. String values:
 *    - `role: "dialog"` - Sets the attribute directly
 *
 * 2. Function returning string:
 *    - ```
 *      labelledby: (part) => `${part.id}-header`
 *      ```
 *    - Function receives the DOM element of the current part
 *    - Dynamically determines value when applied
 *    - Function is bound to component instance (`this` refers to component)
 *    - Useful for referencing IDs of other parts or accessing part properties
 *
 * 3. Null or undefined:
 *    - Skips applying the attribute
 *
 * ## Special Handling
 *
 * 1. Role attribute:
 *    - `role: "dialog"` - Sets role directly without aria- prefix
 *
 * 2. Other attributes:
 *    - All other attributes are prefixed with "aria-"
 *    - `hidden: "true"` becomes `aria-hidden="true"`
 *
 * ## Dynamic Part IDs
 *
 * Use helper methods to reference other parts by ID:
 *
 * ```javascript
 * getAriaConfig() {
 *   return {
 *     "content-panel": {
 *       open: {
 *         labelledby: () => this.getPartId("title"),
 *         describedby: (part) => `${part.id}-desc`
 *       }
 *     }
 *   };
 * }
 * ```
 *
 * The `getPartId()` method ensures parts have unique IDs and returns them.
 *
 * ## Update Timing
 *
 * - ARIA attributes are automatically applied after state transitions
 * - Both global and state-specific attributes are applied
 * - The AriaManager handles all updates based on this configuration
 */
class AriaManager {
  constructor(component) {
    this.component = component;
    this.ariaConfig = component.getAriaConfig();
  }

  applyAriaAttributes(currentState) {
    if (!this.ariaConfig) return;

    Object.entries(this.ariaConfig).forEach(([partName, states]) => {
      // Get all elements with this data-part, not just the first one
      const parts = this.component.getAllParts(partName);
      if (!parts || parts.length === 0) return;

      // Apply attributes to all matching elements
      parts.forEach((part) => {
        this.applyGlobalAriaAttributes(part, states);
        this.applyStateSpecificAriaAttributes(part, states, currentState);
      });
    });
  }

  applyGlobalAriaAttributes(part, states) {
    if (!states.all) return;

    Object.entries(states.all).forEach(([attr, value]) => {
      this.applyAriaAttribute(part, attr, value);
    });
  }

  applyStateSpecificAriaAttributes(part, states, currentState) {
    const stateConfig = states[currentState];
    if (!stateConfig) return;

    Object.entries(stateConfig).forEach(([attr, value]) => {
      this.applyAriaAttribute(part, attr, value);
    });
  }

  applyAriaAttribute(part, attr, value) {
    const resolvedValue =
      typeof value === "function" ? value.call(this.component, part) : value;

    if (resolvedValue === null || resolvedValue === undefined) return;

    if (attr === "role") {
      part.setAttribute("role", resolvedValue);
    } else {
      part.setAttribute(`aria-${attr}`, resolvedValue);
    }
  }
}

export default Component;
