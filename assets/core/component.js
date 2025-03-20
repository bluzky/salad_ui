// saladui/core/component.js
/**
 * Base Component class for SaladUI framework
 * Provides state management, event handling, and ARIA support
 */
import StateMachine from "./state-machine";

class Component {
  constructor(el, hookContext) {
    this.el = el;
    this.hook = hookContext;

    this.config = {
      preventDefaultKeys: [],
      focusableSelector:
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    };

    this.initialState = "idle";
    this.eventConfig = {};
    this.componentConfig = {};
    this.visibilityConfig = {};
    this.ariaConfig = {};

    // Initialize component
    this.parseOptions();
    this.initEventMappings();
    this.initConfig();
    this.initStateMachine(this.componentConfig.stateMachine, this.initialState);
    this.ariaManager = new AriaManager(this, this.ariaConfig);
    this.allParts = Array.from(this.el.querySelectorAll("[data-part]"));
    this.updateUI();
    this.updatePartsVisibility();

    // Map to store event handlers for each part element
    this.partsEventHandlers = new Map();
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

  /**
   * Initialize component configuration
   * This method should set up the componentConfig object with stateMachine, events, and ariaConfig
   */
  initConfig() {
    this.componentConfig = this.getComponentConfig();

    // Add default configs if not provided
    if (!this.componentConfig.stateMachine) {
      this.componentConfig.stateMachine = {
        idle: {
          enter: () => {},
          exit: () => {},
          transitions: {},
        },
      };
    } else {
      this.componentConfig.stateMachine = this.bindStateHandlers(
        this.componentConfig.stateMachine,
      );
    }

    this.eventConfig = this.componentConfig.events || {};
    this.visibilityConfig = this.componentConfig.visibilityConfig || {};
    this.ariaConfig = this.componentConfig.ariaConfig || {};
  }

  /**
   * Get component configuration
   * Override in subclasses to provide component-specific configuration
   * @returns {Object} Configuration object with stateMachine, events, and ariaConfig
   */
  getComponentConfig() {
    throw new Error("getComponentConfig() must be implemented in subclass");
  }

  initStateMachine(stateMachineConfig, initialState) {
    this.stateMachine = new StateMachine(stateMachineConfig, initialState, {
      onStateChanged: (prevState, nextState, params) => {
        // Check if we should animate
        if (this.shouldAnimateTransition(prevState, nextState, params)) {
          // Return promise for animation
          console.log(new Date(), "Animating transition");
          // Animation completed, do final UI updates
          this.updateUI({ ...params, animationCompleted: true });

          return this.animateTransition(prevState, nextState).then(() => {
            console.log(new Date(), "Animation completed");

            this.updatePartsVisibility(nextState);
          });
        } else {
          // No animation, update UI immediately
          this.updatePartsVisibility(nextState);

          this.updateUI(params);
          return null; // No promise
        }
      },
    });
  }

  /**
   * Process the state machine configuration to automatically bind string method references
   * to instance methods for enter and exit handlers
   *
   * @param {Object} config - The original state machine configuration
   * @returns {Object} - The processed configuration with bound enter/exit methods
   */
  bindStateHandlers(stateMachineConfig) {
    // Process each state
    Object.keys(stateMachineConfig).forEach((stateName) => {
      const stateConfig = stateMachineConfig[stateName];

      ["enter", "exit"].forEach((handlerName) => {
        // Process handler if it's a string
        if (typeof stateConfig[handlerName] === "string") {
          const methodName = stateConfig[handlerName];
          if (typeof this[methodName] === "function") {
            stateConfig[handlerName] = this[methodName].bind(this);
          } else {
            console.warn(
              `Method ${methodName} not found for ${handlerName} handler in state ${stateName}`,
            );
          }
        }
      });
    });

    return stateMachineConfig;
  }

  setupEvents() {
    this.el.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.el.addEventListener("click", this.handleActionClick.bind(this));

    // Setup mouse event handlers once for all states
    this.setupMouseEventHandlers();

    this.setupComponentEvents();
  }

  /**
   * Handle keydown events according to current state's keyMap
   */
  handleKeyDown(event) {
    const currentState = this.stateMachine.state;
    const stateEvents = this.eventConfig[currentState];
    if (!stateEvents || !stateEvents.keyMap) return;

    const key = event.key;
    const action = stateEvents.keyMap[key];

    if (action) {
      this.executeHandler(action, event);
      if (this.config.preventDefaultKeys.includes(key)) {
        event.preventDefault();
      }
    }
  }

  /**
   * Handle click events on action elements
   * Transition with the action attribute value
   */
  handleActionClick(event) {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) return;

    const action = actionElement.getAttribute("data-action");
    this.transition(action, {
      originalEvent: event,
      target: actionElement,
    });
  }

  setupComponentEvents() {
    // Override in component subclasses
  }

  /**
   * Set up event listeners for mouse events based on the current state
   */
  setupMouseEventHandlers() {
    // Process all states for their mouse events
    Object.keys(this.eventConfig).forEach((stateName) => {
      const stateEvents = this.eventConfig[stateName];
      if (!stateEvents || !stateEvents.mouseMap) return;

      const mouseMap = stateEvents.mouseMap;

      // For each part in the mouseMap
      Object.keys(mouseMap).forEach((partName) => {
        // Get all elements with this part name
        const partElements = this.getAllParts(partName);

        if (!partElements.length) return;

        // For each event type on this part
        Object.keys(mouseMap[partName]).forEach((eventType) => {
          const handlerAction = mouseMap[partName][eventType];

          // Create a bound handler that will check the current state before executing
          const boundHandler = (event) => {
            // Only execute the handler if we're in the correct state
            const currentState = this.stateMachine.state;
            if (currentState === stateName) {
              this.executeHandler(handlerAction, event);
            }
          };

          // For each element with this part
          partElements.forEach((element) => {
            // Add event listener directly to the part element
            element.addEventListener(eventType, boundHandler);

            // Store the handler reference for removal later
            if (!this.partsEventHandlers.has(element)) {
              this.partsEventHandlers.set(element, new Map());
            }

            const elementHandlers = this.partsEventHandlers.get(element);
            if (!elementHandlers.has(eventType)) {
              elementHandlers.set(eventType, []);
            }

            elementHandlers.get(eventType).push(boundHandler);
          });
        });
      });
    });
  }

  /**
   * Remove all active mouse event listeners
   */
  removeMouseEventListeners() {
    if (this.partsEventHandlers) {
      // For each element that has event handlers
      this.partsEventHandlers.forEach((eventHandlers, element) => {
        // For each event type on this element
        eventHandlers.forEach((handlers, eventType) => {
          // Remove all handlers for this event type
          handlers.forEach((handler) => {
            element.removeEventListener(eventType, handler);
          });
        });
      });

      // Clear the map for future use
      this.partsEventHandlers.clear();
    }
  }

  /**
   * Execute a handler from a mouseMap or keyMap
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

  /**
   * Transition to a new state - delegates to the state machine
   */
  transition(event, params = {}) {
    return this.stateMachine.transition(event, params);
  }

  /**
   * Determine if a transition should be animated
   * Override in child classes to provide custom animation detection
   *
   * @param {string} fromState - Starting state
   * @param {string} toState - Target state
   * @param {Object} params - Transition parameters
   * @returns {boolean} Whether the transition should be animated
   */
  shouldAnimateTransition(fromState, toState, params = {}) {
    // Check if transition has animation config
    const transitionName = `${fromState}_to_${toState}`;
    const hasTransitionAnim = this.options.animations?.[transitionName];

    // By default, animate if animation config exists
    return !!hasTransitionAnim;
  }

  /**
   * Animation handler for state transitions
   * Override in child classes to provide custom animation behavior
   *
   * @param {string} fromState - Starting state
   * @param {string} toState - Target state
   * @param {Object} params - Transition parameters
   * @returns {Promise} A Promise that resolves when animation completes
   */
  animateTransition(fromState, toState) {
    // Get animation configuration
    const transitionName = `${fromState}_to_${toState}`;
    const animConfig = this.options.animations?.[transitionName];

    if (!animConfig) {
      return Promise.resolve(); // Return resolved promise if no animation
    }

    const { animation, duration = 200, target_part = null } = animConfig;

    // Get target element for animation
    const targetElement = target_part ? this.getPart(target_part) : this.el;
    if (!targetElement) {
      return Promise.resolve(); // Return resolved promise if no target
    }

    // Process animation classes
    const animationClasses = (animation || ["", "", ""]).map((item) =>
      typeof item === "string" ? item.split(/\s+/) : [],
    );

    // Execute animation with promise
    return this.executeAnimation(targetElement, {
      animation: animationClasses,
      duration,
    });
  }

  /**
   * Execute animation sequence on target element
   * @param {HTMLElement} targetElement - Element to animate
   * @param {Object} animOptions - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  executeAnimation(targetElement, animOptions) {
    console.log("Animating", targetElement, animOptions);
    return new Promise((resolve) => {
      const { animation, duration } = animOptions;
      let [transitionRun, transitionStart, transitionEnd] = animation || [
        [],
        [],
        [],
      ];

      // First animation frame: apply start classes
      this.addOrRemoveClasses(
        targetElement,
        transitionStart,
        [].concat(transitionRun).concat(transitionEnd),
      );

      // Next frame: apply running classes
      window.requestAnimationFrame(() => {
        this.addOrRemoveClasses(targetElement, transitionRun, []);

        // Next frame: apply end classes
        window.requestAnimationFrame(() =>
          this.addOrRemoveClasses(
            targetElement,
            transitionEnd,
            transitionStart,
          ),
        );
      });

      // After duration, clean up classes and resolve promise
      setTimeout(() => {
        this.addOrRemoveClasses(
          targetElement,
          [],
          []
            .concat(transitionRun)
            .concat(transitionStart)
            .concat(transitionEnd),
        );

        resolve();
      }, duration);
    });
  }

  addOrRemoveClasses(targetElement, addClasses = [], removeClasses = []) {
    if (!targetElement) return;

    if (addClasses.length > 0) {
      targetElement.classList.add(...addClasses.filter(Boolean));
    }
    if (removeClasses.length > 0) {
      targetElement.classList.remove(...removeClasses.filter(Boolean));
    }
  }

  /**
   * Update UI to reflect current state
   * @param {Object} params - Optional parameters from state transition
   */
  updateUI(params = {}) {
    console.log("Updating UI", this.stateMachine.state);
    const currentState = this.stateMachine.state;

    // Update data-state attributes on all parts and root element
    this.allParts.forEach((el) => el.setAttribute("data-state", currentState));
    this.el.setAttribute("data-state", currentState);

    // Apply ARIA attributes
    this.ariaManager.applyAriaAttributes(currentState);
  }

  /**
   * Update part visibility based on current state configuration
   */
  updatePartsVisibility() {
    console.log("Updating visibility");
    const currentState = this.stateMachine.state;
    const stateVisibility = this.visibilityConfig[currentState];
    if (!stateVisibility) return;

    Object.entries(stateVisibility).forEach(([partName, hidden]) => {
      const partElements = this.getAllParts(partName);
      partElements.forEach((element) => {
        if (element) {
          element.hidden = hidden;
          console.log("Setting hidden", partName, hidden);
        }
      });
    });
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

  // Get current state from state machine
  get state() {
    return this.stateMachine.state;
  }

  // Get previous state from state machine
  get previousState() {
    return this.stateMachine.previousState;
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

    // Allow garbage collection
    this.stateMachine = null;
    this.el = null;
    this.hook = null;
    this.options = null;
    this.componentConfig = null;
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
 * AriaManager class for handling accessibility attributes
 */
class AriaManager {
  constructor(component, ariaConfig) {
    this.component = component;
    this.ariaConfig = ariaConfig || {};
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
