// saladui/core.js
class Component {
  constructor(el, hookContext) {
    this.el = el;
    this.hook = hookContext;

    this.config = {
      preventDefaultKeys: [],
      focusableSelector:
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    };

    this.parseOptions();
    this.initEventMappings();
    this.initStateMachine();
    this.ariaConfig = this.getAriaConfig();
    // setupEvents is now called externally by the registry
    this.updateUI();
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
    this.stateMachine = this.getStateMachine();
  }

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

  setupComponentEvents() {
    // Override in component subclasses
  }

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

  transition(event, params = {}) {
    const currentStateConfig = this.stateMachine[this.state];
    if (!currentStateConfig) return false;

    const transition = currentStateConfig.transitions?.[event];
    if (!transition) return false;

    let nextState;
    if (typeof transition === "string") {
      nextState = transition;
    } else if (typeof transition === "function") {
      nextState = transition.call(this, params);
    } else if (typeof transition === "object") {
      for (const [condition, target] of Object.entries(transition)) {
        if (
          condition === "default" ||
          this.evaluateCondition(condition, params)
        ) {
          nextState = target;
          break;
        }
      }
    }

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

  executeTransition(prevState, nextState, params = {}) {
    const currentStateConfig = this.stateMachine[prevState];
    const newStateConfig = this.stateMachine[nextState];

    if (currentStateConfig.exit) {
      if (typeof currentStateConfig.exit === "string") {
        if (typeof this[currentStateConfig.exit] === "function") {
          this[currentStateConfig.exit](params);
        }
      } else if (typeof currentStateConfig.exit === "function") {
        currentStateConfig.exit.call(this, params);
      }
    }

    this.state = nextState;

    if (newStateConfig?.enter) {
      if (typeof newStateConfig.enter === "string") {
        if (typeof this[newStateConfig.enter] === "function") {
          this[newStateConfig.enter](params);
        }
      } else if (typeof newStateConfig.enter === "function") {
        newStateConfig.enter.call(this, params);
      }
    }

    this.updateUI();
  }

  animateTransition(prevState, nextState, params = {}) {
    const transitionName = `${prevState}_to_${nextState}`;
    const animConfig =
      this.options.animations[transitionName] ||
      this.options.animations[nextState];

    if (!animConfig) {
      this.executeTransition(prevState, nextState, params);
      return;
    }

    const {
      start_class,
      end_class,
      duration = 200,
      display = null,
      final_display = null,
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

    const currentStateConfig = this.stateMachine[prevState];
    const newStateConfig = this.stateMachine[nextState];

    // Call exit handler with animated flag
    if (currentStateConfig.exit) {
      if (typeof currentStateConfig.exit === "string") {
        if (typeof this[currentStateConfig.exit] === "function") {
          this[currentStateConfig.exit]({ ...params, animated: true });
        }
      } else if (typeof currentStateConfig.exit === "function") {
        currentStateConfig.exit.call(this, { ...params, animated: true });
      }
    }

    // Set the new state
    this.state = nextState;

    // Set initial display if specified
    if (display !== null) {
      targetElement.style.display = display;
    }

    // Add start class
    if (start_class) {
      targetElement.classList.add(start_class);
    }

    // Only modify transition style if timing is provided
    let oldTransition = null;

    if (timing) {
      // Store original transition and set new one
      oldTransition = targetElement.style.transition;
      targetElement.style.transition = `all ${duration}ms ${timing}`;

      // Force reflow to ensure transition starts
      void targetElement.offsetWidth;
    }

    // Add end class
    if (end_class) {
      targetElement.classList.add(end_class);
    }

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

      // Set final display state if specified
      if (final_display !== null) {
        targetElement.style.display = final_display;
      }

      // Call enter handler with animated flag
      if (newStateConfig?.enter) {
        if (typeof newStateConfig.enter === "string") {
          if (typeof this[newStateConfig.enter] === "function") {
            this[newStateConfig.enter]({ ...params, animated: true });
          }
        } else if (typeof newStateConfig.enter === "function") {
          newStateConfig.enter.call(this, { ...params, animated: true });
        }
      }
    }, duration);
    // Update UI
    this.updateUI();
  }

  evaluateCondition(condition, params) {
    return params[condition] !== undefined;
  }

  updateUI() {
    this.el
      .querySelectorAll("[data-part]")
      .forEach((el) => el.setAttribute("data-state", this.state));
    this.applyAriaAttributes();
    this.updatePartsVisibility();
  }

  // Add to Component class
  applyAriaAttributes() {
    if (!this.ariaConfig) return;

    // Process each component part specified in aria config
    Object.entries(this.ariaConfig).forEach(([partName, states]) => {
      const part = this.getPart(partName);
      if (!part) return;

      // Apply global ARIA attributes (for all states)
      if (states.all) {
        Object.entries(states.all).forEach(([attr, value]) => {
          const resolvedValue =
            typeof value === "function" ? value.call(this) : value;
          if (resolvedValue !== null && resolvedValue !== undefined) {
            part.setAttribute(`aria-${attr}`, resolvedValue);
          }
        });

        // For "role" attribute which isn't prefixed with "aria-"
        if (states.all.role) {
          const role =
            typeof states.all.role === "function"
              ? states.all.role.call(this)
              : states.all.role;
          part.setAttribute("role", role);
        }
      }

      // Apply state-specific ARIA attributes
      const stateConfig = states[this.state];
      if (stateConfig) {
        Object.entries(stateConfig).forEach(([attr, value]) => {
          // Skip role attribute as it's handled differently
          if (attr === "role") return;

          const resolvedValue =
            typeof value === "function" ? value.call(this) : value;
          if (resolvedValue !== null && resolvedValue !== undefined) {
            part.setAttribute(`aria-${attr}`, resolvedValue);
          }
        });

        // Handle role separately since it doesn't have aria- prefix
        if (stateConfig.role) {
          const role =
            typeof stateConfig.role === "function"
              ? stateConfig.role.call(this)
              : stateConfig.role;
          part.setAttribute("role", role);
        }
      }
    });
  }

  updatePartsVisibility() {
    const stateParts = this.el.querySelectorAll(
      "[data-part][data-visible-states]",
    );

    stateParts.forEach((part) => {
      const visibleStates = part.getAttribute("data-visible-states").split(" ");
      part.classList.toggle("hidden", !visibleStates.includes(this.state));
    });
  }

  getAriaConfig() {
    // Override in component subclasses
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

  pushEvent(clientEvent, payload = {}) {
    if (!this.hook || !this.hook.pushEventTo) return;

    // Check if this client event has a server mapping
    const serverEvent = this.eventMappings[clientEvent];

    if (serverEvent) {
      const fullPayload = {
        ...payload,
        componentId: this.el.id,
        component: this.el.getAttribute("data-component"),
      };

      this.hook.pushEventTo(this.el, serverEvent, fullPayload);
    }
  }

  handleCommand(command, params = {}) {
    return this.transition(command, params);
  }

  trigger(event, params = {}) {
    return this.transition(event, params);
  }
}

export default Component;
