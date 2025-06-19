// saladui/core/component.js
/**
 * Base Component class for SaladUI framework
 * Provides state management, event handling, and ARIA support
 */
import StateMachine from "./state-machine";
import { animateTransition, queryDOM } from "./utils";

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

    this.populateID();
    this.updateUI();
    this.updatePartsVisibility();

    // Map to store event handlers for each part element
    this.partMouseEventHandlers = new Map();
    this.keyEventHandlers = new Map();
  }

  parseOptions() {
    try {
      const optionsString = this.el.getAttribute("data-options");
      this.options = optionsString ? JSON.parse(optionsString) : {};
      this.initialState =
        this.el.getAttribute("data-state") || this.initialState;
    } catch (error) {
      console.error("SaladUI: Error parsing component options:", error);
      this.options = {};
    }
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
    this.hiddenConfig = this.componentConfig.hiddenConfig || {};
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
      onStateChanged: this.onStateChanged.bind(this),
      validCheck: () => !this.destroyed,
    });
  }

  // Handle client commands
  onClientCommand(event) {
    console.log(event);
    const { command, params } = event.detail;
    if (command) {
      this.handleCommand(command, params);
    }
  }

  onStateChanged(prevState, nextState, params) {
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
      if (this.destroyed) return;

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
    if (this.eventSetupCompleted) {
      this.removeAllEvents();
    }

    this.el.addEventListener("salad_ui:command", this.onClientCommand);

    this.el.addEventListener("click", this.handleActionClick.bind(this));

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

  setupComponentEvents() {
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

  // set id for all children that not set id yet
  populateID() {
    const allParts = this.queryParts();
    const groupedElements = {};
    allParts.forEach((element) => {
      const dataAttributeValue = element.dataset.part;
      if (!groupedElements[dataAttributeValue]) {
        groupedElements[dataAttributeValue] = [];
      }
      groupedElements[dataAttributeValue].push(element);
    });

    Object.keys(groupedElements).forEach((partName) => {
      const parts = groupedElements[partName];

      parts.forEach((part, index) => {
        if (!part.id) {
          part.id = `${this.el.id}-${partName}${parts.length > 1 ? `-${index}` : ""}`;
        }
      });
    });
  }

  /**
   * Update UI to reflect current state
   * @param {Object} params - Optional parameters from state transition
   */
  updateUI(params = {}) {
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
    this.el.removeEventListener("salad_ui:command", this.onClientCommand);
    this.el.removeEventListener("click", this.handleActionClick);
    this.removeKeyEventHandlers();
    this.removeMouseEventListeners();
  }

  // Cleanup method to remove event listeners and references
  destroy() {
    // Lifecycle hook before destruction
    this.beforeDestroy();

    // Remove event listeners
    this.removeAllEvents();
    this.ariaManager = null;

    // Allow garbage collection
    this.stateMachine = null;
    this.el = null;
    this.hook = null;
    this.options = null;
    this.componentConfig = null;
    this.destroyed = true;
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
      parts.forEach((part, index) => {
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

    if (resolvedValue === null || resolvedValue === undefined) return;

    if (attr === "role") {
      part.setAttribute("role", resolvedValue);
    } else {
      part.setAttribute(`aria-${attr}`, resolvedValue);
    }
  }
}

export default Component;
