// saladui/core.js
/**
 * Base Component class for SaladUI framework
 * Provides state management, event handling, and ARIA support
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
    this.updateUI();
    this.updatePartsVisibility();
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
      if (typeof action === "function") {
        action.call(this, event);
      } else if (typeof action === "string") {
        if (action.indexOf("on") === 0 && typeof this[action] === "function") {
          this[action](event);
        } else {
          this.transition(action, { originalEvent: event });
        }
      }

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

    // Update UI
    this.updateUI();
  }

  // Split from executeTransition
  executeStateHandlers(stateName, handlerType, params) {
    const stateConfig = this.stateMachine[stateName];
    // update hidden state for parts
    if (handlerType === "enter") {
      this.updatePartsVisibility();
    }

    if (!stateConfig || !stateConfig[handlerType]) return;

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
    this.performAnimation(targetElement, animOptions);

    // Set up completion handler
    this.completeAnimation(targetElement, animOptions, nextState, params);

    // Update UI
    this.updateUI();
  }

  // Animation helper methods
  prepareAnimation(animConfig) {
    const {
      start_class,
      end_class,
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

    return {
      targetElement,
      animOptions: {
        start_class,
        end_class,
        duration,
        timing,
      },
    };
  }

  performAnimation(targetElement, animOptions) {
    const { start_class, end_class, timing, duration } = animOptions;

    // Add start class
    if (start_class) {
      targetElement.classList.add(start_class);
    }

    // Store original transition
    let oldTransition = null;

    if (timing) {
      oldTransition = targetElement.style.transition;
      targetElement.style.transition = `all ${duration}ms ${timing}`;

      // Force reflow to ensure transition starts
      void targetElement.offsetWidth;
    }

    // Store transition info for cleanup
    targetElement._transitionInfo = { oldTransition };

    // Add end class
    if (end_class) {
      targetElement.classList.add(end_class);
    }
  }

  completeAnimation(targetElement, animOptions, nextState, params) {
    const { start_class, end_class, duration } = animOptions;
    const oldTransition = targetElement._transitionInfo?.oldTransition;

    // Setup the timeout to clean up after animation
    setTimeout(() => {
      // Remove animation classes
      if (start_class) {
        targetElement.classList.remove(start_class);
      }
      if (end_class) {
        targetElement.classList.remove(end_class);
      }

      // Restore original transition if it was changed
      if (oldTransition !== null) {
        targetElement.style.transition = oldTransition;
      }

      // Clean up stored transition info
      delete targetElement._transitionInfo;

      // Call enter handler with animated flag
      this.executeStateHandlers(nextState, "enter", {
        ...params,
        animated: true,
      });
    }, duration);
  }

  evaluateCondition(condition, params) {
    return params[condition] !== undefined;
  }

  // Update UI to reflect current state
  updateUI() {
    if (this.state === this.previousState) return;

    this.el
      .querySelectorAll("[data-part]")
      .forEach((el) => el.setAttribute("data-state", this.state));
    this.el.setAttribute("data-state", this.state);

    this.ariaManager.applyAriaAttributes(this.state);
  }

  updatePartsVisibility() {
    const hiddenParts = this.stateMachine[this.state].hidden || {};
    Object.entries(hiddenParts).forEach(([part, hidden]) => {
      const partElement = this.getPart(part);
      if (partElement) {
        partElement.hidden = hidden;
      }
    });
  }

  // Override in component subclasses
  getAriaConfig() {
    return {};
  }

  getPart(name) {
    return this.el.querySelector(`[data-part="${name}"]`);
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
 * Extracted ARIA management into a separate class
 */
class AriaManager {
  constructor(component) {
    this.component = component;
    this.ariaConfig = component.getAriaConfig();
  }

  applyAriaAttributes(currentState) {
    if (!this.ariaConfig) return;

    // Process each component part specified in aria config
    Object.entries(this.ariaConfig).forEach(([partName, states]) => {
      const part = this.component.getPart(partName);
      if (!part) return;

      this.applyGlobalAriaAttributes(part, states);
      this.applyStateSpecificAriaAttributes(part, states, currentState);
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
      typeof value === "function" ? value.call(this.component) : value;

    if (resolvedValue === null || resolvedValue === undefined) return;

    if (attr === "role") {
      part.setAttribute("role", resolvedValue);
    } else {
      part.setAttribute(`aria-${attr}`, resolvedValue);
    }
  }
}

export default Component;
