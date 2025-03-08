// saladui/core.js
class Component {
  constructor(el, hookContext) {
    this.el = el;
    this.hook = hookContext;

    this.config = {
      preventDefaultKeys: [],
      focusableSelector: 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    };

    this.parseOptions();
    this.initEventMappings();
    this.initStateMachine();
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
        enter: 'onIdleEnter',
        exit: 'onIdleExit',
        transitions: {}
      }
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
      if (typeof action === 'function') {
        action.call(this, event);
      } else if (typeof action === 'string') {
        if (action.indexOf('on') === 0 && typeof this[action] === 'function') {
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
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) return;

    const action = actionElement.getAttribute('data-action');
    this.transition(action, {
      originalEvent: event,
      target: actionElement
    });
  }

  transition(event, params = {}) {
    const currentStateConfig = this.stateMachine[this.state];
    if (!currentStateConfig) return false;

    const transition = currentStateConfig.transitions?.[event];
    if (!transition) return false;

    let nextState;
    if (typeof transition === 'string') {
      nextState = transition;
    } else if (typeof transition === 'function') {
      nextState = transition.call(this, params);
    } else if (typeof transition === 'object') {
      for (const [condition, target] of Object.entries(transition)) {
        if (condition === 'default' || this.evaluateCondition(condition, params)) {
          nextState = target;
          break;
        }
      }
    }

    if (!nextState) return false;

    const prevState = this.state;
    const transitionName = `${prevState}_to_${nextState}`;

    const hasAnimation = this.options.animations &&
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
      if (typeof currentStateConfig.exit === 'string') {
        if (typeof this[currentStateConfig.exit] === 'function') {
          this[currentStateConfig.exit](params);
        }
      } else if (typeof currentStateConfig.exit === 'function') {
        currentStateConfig.exit.call(this, params);
      }
    }

    this.state = nextState;

    if (newStateConfig?.enter) {
      if (typeof newStateConfig.enter === 'string') {
        if (typeof this[newStateConfig.enter] === 'function') {
          this[newStateConfig.enter](params);
        }
      } else if (typeof newStateConfig.enter === 'function') {
        newStateConfig.enter.call(this, params);
      }
    }

    this.updateUI();

    this.pushEvent('state_changed', {
      prevState,
      newState: nextState,
      event: params.event,
      ...params
    });
  }

  animateTransition(prevState, nextState, params = {}) {
    const transitionName = `${prevState}_to_${nextState}`;
    const animConfig = this.options.animations[transitionName] ||
                       this.options.animations[nextState];

    if (!animConfig) {
      this.executeTransition(prevState, nextState, params);
      return;
    }

    const {
      start_class,
      end_class,
      duration = 300,
      display = null,
      timing = 'ease'
    } = animConfig;

    const currentStateConfig = this.stateMachine[prevState];
    const newStateConfig = this.stateMachine[nextState];

    if (currentStateConfig.exit) {
      if (typeof currentStateConfig.exit === 'string') {
        if (typeof this[currentStateConfig.exit] === 'function') {
          this[currentStateConfig.exit]({...params, animated: true});
        }
      } else if (typeof currentStateConfig.exit === 'function') {
        currentStateConfig.exit.call(this, {...params, animated: true});
      }
    }

    this.state = nextState;

    if (display !== null) {
      this.el.style.display = display;
    }

    if (start_class) {
      this.el.classList.add(start_class);
    }

    const oldTransition = this.el.style.transition;
    this.el.style.transition = `all ${duration}ms ${timing}`;

    void this.el.offsetWidth;

    if (end_class) {
      this.el.classList.add(end_class);
    }

    setTimeout(() => {
      if (start_class) {
        this.el.classList.remove(start_class);
      }
      if (end_class) {
        this.el.classList.remove(end_class);
      }

      this.el.style.transition = oldTransition;

      if (newStateConfig?.enter) {
        if (typeof newStateConfig.enter === 'string') {
          if (typeof this[newStateConfig.enter] === 'function') {
            this[newStateConfig.enter]({...params, animated: true});
          }
        } else if (typeof newStateConfig.enter === 'function') {
          newStateConfig.enter.call(this, {...params, animated: true});
        }
      }

      this.updateUI();

      this.pushEvent('state_changed', {
        prevState,
        newState: nextState,
        event: params.event,
        animated: true,
        ...params
      });

    }, duration);
  }

  evaluateCondition(condition, params) {
    return params[condition] !== undefined;
  }

  updateUI() {
    this.el.setAttribute('data-state', this.state);

    Object.keys(this.stateMachine).forEach(state => {
      this.el.classList.toggle(`is-${state}`, state === this.state);
    });

    this.updateAriaAttributes();
    this.updatePartsVisibility();
  }

  updateAriaAttributes() {
    const stateConfig = this.stateMachine[this.state];

    if (stateConfig?.aria) {
      Object.entries(stateConfig.aria).forEach(([attr, value]) => {
        this.el.setAttribute(`aria-${attr}`, value);
      });
    }
  }

  updatePartsVisibility() {
    const stateParts = this.el.querySelectorAll('[data-part][data-visible-states]');

    stateParts.forEach(part => {
      const visibleStates = part.getAttribute('data-visible-states').split(' ');
      part.classList.toggle('hidden', !visibleStates.includes(this.state));
    });
  }

  getPart(name) {
    return this.el.querySelector(`[data-part="${name}"]`);
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
        component: this.el.getAttribute('data-component')
      };

      this.hook.pushEventTo(this.el, serverEvent, fullPayload);
    }

    // Always push state_changed events
    if (clientEvent === 'state_changed') {
      const fullPayload = {
        ...payload,
        componentId: this.el.id,
        component: this.el.getAttribute('data-component')
      };

      this.hook.pushEventTo(this.el, clientEvent, fullPayload);
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
