// saladui/core/component.js
/**
 * Base Component class for SaladUI framework
 * Provides state management, event handling, and ARIA support
 */
import StateMachine from "./state-machine.js";
import { animateTransition, queryDOM } from "./utils.js";

/**
 * Base class every interactive SaladUI component extends.
 *
 * Lifecycle (see docs/component_lifecycle.md for the full reference):
 *
 *   1. `new ComponentClass(el, hookContext)` — the constructor runs
 *      parseOptions/initConfig/initStateMachine and does a first,
 *      un-animated `updateUI()` + `updatePartsVisibility()`. DOM
 *      listeners are NOT attached yet.
 *   2. `setupEvents()` — called exactly once by `factory.js` right after
 *      construction. Subclasses must NOT call this themselves; do any
 *      one-time listener setup by overriding `setupComponentEvents()`
 *      instead (call `super.setupComponentEvents()` first).
 *   3. `afterMount()` — called once by `factory.js`, immediately after
 *      `setupEvents()`. Use this for logic that needs both the
 *      subclass's own fields (set in its constructor) and live
 *      listeners, e.g. an initial state transition.
 *   4. `destroy()` — calls `beforeDestroy()`, then `removeAllEvents()`
 *      (which calls `teardownComponentEvents()`), then clears
 *      references. Override `teardownComponentEvents()` to tear down
 *      anything created in `setupComponentEvents()` — the two must stay
 *      paired, since `removeAllEvents()` can also run mid-lifetime if
 *      `setupEvents()` is ever invoked again.
 */
class Component {
  constructor(el, options) {
    const { hookContext, initialState = "idle", ignoreItems = true } = options;

    this.el = el;
    this.hook = hookContext;

    this.config = {
      preventDefaultKeys: [],
    };

    this.initialState = initialState;
    this.eventConfig = {};
    this.componentConfig = {};
    this.hiddenConfig = {};
    this.ariaConfig = {};
    this.destroyed = false;
    this.eventSetupCompleted = false;

    // Initialize component
    this.parseOptions();
    this.disabled = !!this.options.disabled;
    this.initEventMappings();
    this.initConfig();
    this.initStateMachine(this.componentConfig.stateMachine, this.initialState);
    this.ariaManager = new AriaManager(this, this.ariaConfig);

    // ignore item's part
    this.allParts = this.queryParts();
    if (ignoreItems) {
      this.allParts = this.allParts.filter(
        (element) =>
          !element.dataset.part.startsWith("item") &&
          !element.dataset.part.endsWith("-item"),
      );
    }

    this.updateUI();
    this.updatePartsVisibility();

    // Map to store event handlers for each part element
    this.partMouseEventHandlers = new Map();
    this.keyEventHandlers = new Map();
  }

  parseOptions() {
    try {
      // _optionsRaw/_eventMappingsRaw (below) keep the unparsed attribute
      // strings so a subclass's skipReinitialize(el) can cheaply compare
      // them against the live DOM without re-parsing JSON — see e.g.
      // ToastComponent.skipReinitialize.
      const optionsString = this.el.getAttribute("data-options");
      this.options = optionsString ? JSON.parse(optionsString) : {};
      this._optionsRaw = optionsString;
      this.initialState =
        this.el.getAttribute("data-state") || this.initialState;
    } catch (error) {
      console.error("SaladUI: Error parsing component options:", error);
      this.options = {};
      this._optionsRaw = null;
    }
  }

  /**
   * Called by SaladUIHook.updated() before it destroys and rebuilds this
   * component for a LiveView patch. Return true to keep the current
   * instance instead, e.g. when nothing this component reads has actually
   * changed. Default: false (always reinitialize).
   */
  skipReinitialize(_el) {
    return false;
  }

  queryParts() {
    return queryDOM(this.el, (node) => {
      if (!node.dataset?.part) return 0;
      if (node.getAttribute("phx-hook") != null) return -1;
      return 1;
    }).concat([this.el]);
  }

  initEventMappings() {
    this.onClientCommand = this.onClientCommand.bind(this);
    this.handleActionClick = this.handleActionClick.bind(this);

    try {
      const mappingsString = this.el.getAttribute("data-event-mappings");
      this.eventMappings = mappingsString ? JSON.parse(mappingsString) : {};
      this._eventMappingsRaw = mappingsString;
    } catch (error) {
      console.error("SaladUI: Error parsing event mappings:", error);
      this.eventMappings = {};
      this._eventMappingsRaw = null;
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
    this.hiddenConfig = this.componentConfig.hiddenConfig || {};
    this.ariaConfig = this.componentConfig.ariaConfig || {};
  }

  /**
   * Get component configuration
   * Override in subclasses to provide component-specific configuration.
   * Must return a fresh object literal on every call — the returned
   * stateMachine config is mutated in place (enter/exit strings get
   * bound to instance methods, see bindStateHandlers()), so returning a
   * cached/shared object would leak bound handlers across instances.
   * @returns {Object} Configuration object with stateMachine, events, and ariaConfig
   */
  getComponentConfig() {
    throw new Error("getComponentConfig() must be implemented in subclass");
  }

  initStateMachine(stateMachineConfig, initialState) {
    this.stateMachine = new StateMachine(stateMachineConfig, initialState, {
      onStateChanged: this.onStateChanged.bind(this),
      validCheck: () => !this.destroyed,
    });
  }

  // Handle client commands
  onClientCommand(event) {
    const { command, params = {}, target } = event.detail || {};
    if (!command) return;
    if (target && target !== this.el.id) return;

    event.stopPropagation();
    this.handleCommand(command, params ?? {});
  }

  onStateChanged(prevState, nextState) {
    if (this.destroyed) return;

    // Check if we should animate
    const transitionName = `${prevState}_to_${nextState}`;
    const animConfig = this.options.animations?.[transitionName];
    this.updateUI();

    if (!animConfig) {
      // No animation, update visibility immediately
      this.updatePartsVisibility(nextState);
      return null; // No promise
    }

    // Get target element for animation
    const targetElement = animConfig.target_part
      ? this.getPart(animConfig.target_part)
      : this.el;

    // Animate with the config
    return animateTransition(animConfig, targetElement).then(() => {
      if (this.destroyed || this.stateMachine.state !== nextState) return;

      this.updatePartsVisibility(nextState);
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
    if (this.destroyed) return;

    if (this.eventSetupCompleted) {
      this.removeAllEvents();
    }

    this.el.addEventListener("salad_ui:command", this.onClientCommand);

    this.el.addEventListener("click", this.handleActionClick);

    this.setupKeyEventHandlers();
    this.setupMouseEventHandlers();

    this.setupComponentEvents();
    this.eventSetupCompleted = true;
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

  /**
   * Override in subclasses to attach any listeners/utilities beyond the
   * base key/mouse maps (e.g. a ClickOutsideMonitor). Called once, from
   * setupEvents(). Always call super.setupComponentEvents() first, and
   * give every long-lived thing you create here a matching teardown in
   * teardownComponentEvents() — nothing added here is cleaned up
   * automatically.
   */
  setupComponentEvents() {
    // Override in component subclasses
  }

  /**
   * Tear down anything set up in setupComponentEvents(). Called from
   * removeAllEvents(), so it runs both when events are re-established
   * (setupEvents() called again) and on destroy(). Always call
   * super.teardownComponentEvents() first.
   */
  teardownComponentEvents() {
    // Override in component subclasses
  }

  /**
   * Set up event listeners for mouse events based on the current state
   */
  setupKeyEventHandlers() {
    Object.keys(this.eventConfig).forEach((stateName) => {
      const stateEvents = this.eventConfig[stateName];
      if (!stateEvents || !stateEvents.keyMap) return;

      // Create a bound handler that will check the current state before executing
      const boundHandler = (event) => {
        if (stateName == "_all" || this.stateMachine.state === stateName) {
          const key = event.key;
          const action = stateEvents.keyMap[key];

          if (action) {
            this.executeHandler(action, event);
            if (this.config.preventDefaultKeys.includes(key)) {
              event.preventDefault();
            }
          }
        }
      };

      // Get the target element for key events, if not specified, use the root element
      const element = this.getPart(stateEvents.keyEventTarget) || this.el;

      element.addEventListener("keydown", boundHandler);
      this.keyEventHandlers.set(element, boundHandler);
    });
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
            if (!this.partMouseEventHandlers.has(element)) {
              this.partMouseEventHandlers.set(element, new Map());
            }

            const elementHandlers = this.partMouseEventHandlers.get(element);
            if (!elementHandlers.has(eventType)) {
              elementHandlers.set(eventType, []);
            }

            elementHandlers.get(eventType).push(boundHandler);
          });
        });
      });
    });
  }

  removeKeyEventHandlers() {
    if (this.keyEventHandlers) {
      // For each element that has event handlers
      this.keyEventHandlers.forEach((handler, element) => {
        element.removeEventListener("keydown", handler);
      });

      // Clear the map for future use
      this.keyEventHandlers.clear();
    }
  }

  /**
   * Remove all active mouse event listeners
   */
  removeMouseEventListeners() {
    if (this.partMouseEventHandlers) {
      // For each element that has event handlers
      this.partMouseEventHandlers.forEach((eventHandlers, element) => {
        // For each event type on this element
        eventHandlers.forEach((handlers, eventType) => {
          // Remove all handlers for this event type
          handlers.forEach((handler) => {
            element.removeEventListener(eventType, handler);
          });
        });
      });

      // Clear the map for future use
      this.partMouseEventHandlers.clear();
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
    if (this.destroyed) return;

    return this.stateMachine.transition(event, params);
  }

  /**
   * Update UI to reflect current state
   */
  updateUI() {
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
    const currentState = this.stateMachine.state;
    const stateVisibility = this.hiddenConfig[currentState];
    if (!stateVisibility) return;

    Object.entries(stateVisibility).forEach(([partName, hidden]) => {
      const partElements = this.getAllParts(partName);
      partElements.forEach((element) => {
        if (element) {
          element.hidden = hidden;
        }
      });
    });
  }

  getPart(name) {
    return this.allParts.find((part) => part.dataset.part === name);
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

  // Push event to server (for frameworks like Phoenix LiveView)
  pushEvent(clientEvent, payload = {}, context) {
    if (!this.hook || !this.hook.pushEventTo) return;

    const eventHandler = this.eventMappings[clientEvent];
    const el = context || this.el;

    if (eventHandler) {
      if (typeof eventHandler === "string") {
        const fullPayload = {
          ...payload,
          componentId: el.id,
          component: el.getAttribute("data-component"),
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

  removeAllEvents() {
    if (!this.eventSetupCompleted) return;

    this.el.removeEventListener("salad_ui:command", this.onClientCommand);
    this.el.removeEventListener("click", this.handleActionClick);
    this.removeKeyEventHandlers();
    this.removeMouseEventListeners();
    this.teardownComponentEvents();
    this.eventSetupCompleted = false;
  }

  // Cleanup method to remove event listeners and references
  destroy() {
    if (this.destroyed) return;

    // Lifecycle hook before destruction
    this.beforeDestroy();
    this.destroyed = true;

    // Remove event listeners
    this.removeAllEvents();
    this.ariaManager = null;

    // Allow garbage collection
    this.stateMachine = null;
    this.el = null;
    this.hook = null;
    this.options = null;
    this.componentConfig = null;
  }

  // Lifecycle hooks

  /**
   * Called by Phoenix LiveView immediately before it patches this component's
   * DOM. Subclasses that move descendants outside the component root must
   * restore them here so LiveView can reconcile the expected tree.
   */
  beforeUpdate() {}

  /**
   * Called once by the factory right after setupEvents(), i.e. once the
   * component is fully constructed and its listeners are attached.
   * Subclasses that need to run logic depending on both their own fields
   * (set in their constructor) and on listeners being live (e.g. an
   * initial transition) should do it here instead of calling
   * setupEvents() themselves from their constructor.
   */
  afterMount() {}

  /**
   * Called once by destroy(), before any listeners are removed and
   * before references are cleared. Use for cleanup that must happen
   * while `this.el`/parts/hook are still valid (e.g. deactivating a
   * FocusTrap). For anything created in setupComponentEvents(), prefer
   * teardownComponentEvents() instead — it stays paired with its setup
   * counterpart and also runs if setupEvents() is ever re-invoked.
   */
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
        // Set ID if not already defined
        // this cause server dom patching break the client DOM
        // if (!part.id) {
        //   part.id = `${this.component.el.id}-${partName}${parts.length > 1 ? `-${index}` : ""}`;
        // }

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

    const attribute = attr === "role" ? "role" : `aria-${attr}`;

    if (resolvedValue === null || resolvedValue === undefined) {
      part.removeAttribute(attribute);
      return;
    }

    part.setAttribute(attribute, resolvedValue);
  }
}

export default Component;
