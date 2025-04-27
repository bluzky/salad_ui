(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // salad_ui/core/state-machine.js
  var StateMachine = class {
    /**
     * Create a state machine
     *
     * @param {Object} stateConfig - Configuration object defining states and transitions
     * @param {string} initialState - The initial state to start in
     * @param {Object} options - Optional configuration options. Currently supports:
     *   - onStateChanged: A callback function to be called when the state changes
     */
    constructor(stateConfig, initialState, options) {
      this.stateConfig = stateConfig;
      this.state = initialState || "idle";
      this.previousState = null;
      this.options = options || {};
    }
    /**
     * Trigger a transition based on an event
     *
     * @param {string} event - The event triggering the transition
     * @param {Object} params - Parameters to pass to the handlers
     * @returns {boolean} Whether the transition was successful
     */
    transition(event, params = {}) {
      var _a;
      const currentStateConfig = this.stateConfig[this.state];
      if (!currentStateConfig)
        return false;
      const transition = (_a = currentStateConfig.transitions) == null ? void 0 : _a[event];
      if (!transition)
        return false;
      const nextState = this.determineNextState(transition, params);
      if (!nextState)
        return false;
      const prevState = this.state;
      this.executeTransition(prevState, nextState, params);
      return true;
    }
    /**
     * Determine the next state based on the transition definition
     *
     * @param {string|Function|Object} transition - Transition definition
     * @param {Object} params - Parameters to help determine the next state
     * @returns {string|null} The next state or null if not determinable
     */
    determineNextState(transition, params) {
      if (typeof transition === "string") {
        return transition;
      } else if (typeof transition === "function") {
        return transition(params);
      }
      return null;
    }
    /**
     * Execute a transition between states, with optional animation
     *
     * @param {string} prevState - The state we're coming from
     * @param {string} nextState - The state we're going to
     * @param {Object} params - Parameters to pass to handlers
     */
    executeTransition(prevState, nextState, params = {}) {
      this.executeStateHandler(prevState, "exit", params);
      this.previousState = prevState;
      this.state = nextState;
      let callbackResult;
      if (typeof this.options.onStateChanged === "function") {
        callbackResult = this.options.onStateChanged(
          prevState,
          nextState,
          params
        );
      }
      if (callbackResult && typeof callbackResult.then === "function") {
        callbackResult.then(() => {
          this.executeStateHandler(nextState, "enter", params);
        }).catch((error) => {
          console.error("Animation promise rejected:", error);
          this.executeStateHandler(nextState, "enter", params);
        });
      } else {
        this.executeStateHandler(nextState, "enter", params);
      }
    }
    /**
     * Execute a state handler (enter or exit)
     *
     * @param {string} stateName - The state whose handler to execute
     * @param {string} handlerType - 'enter' or 'exit'
     * @param {Object} params - Parameters to pass to the handler
     */
    executeStateHandler(stateName, handlerType, params) {
      const stateConfig = this.stateConfig[stateName];
      if (!stateConfig)
        return;
      const handler = stateConfig[handlerType];
      if (typeof handler === "function") {
        handler(params);
      }
    }
    /**
     * Check if the state has changed since last transition
     *
     * @returns {boolean} Whether the state has changed
     */
    hasStateChanged() {
      return this.state !== this.previousState;
    }
  };
  var state_machine_default = StateMachine;

  // salad_ui/core/utils.js
  function animateTransition(animConfig, targetElement) {
    if (!animConfig || !targetElement) {
      return Promise.resolve();
    }
    const { animation, duration = 200 } = animConfig;
    const animationClasses = (animation || ["", "", ""]).map(
      (item) => typeof item === "string" ? item.split(/\s+/) : []
    );
    return executeAnimation(targetElement, {
      animation: animationClasses,
      duration
    });
  }
  function executeAnimation(targetElement, animOptions) {
    console.log("Animating", targetElement, animOptions);
    return new Promise((resolve) => {
      const { animation, duration } = animOptions;
      let [transitionRun, transitionStart, transitionEnd] = animation || [
        [],
        [],
        []
      ];
      addOrRemoveClasses(
        targetElement,
        transitionStart,
        [].concat(transitionRun).concat(transitionEnd)
      );
      window.requestAnimationFrame(() => {
        addOrRemoveClasses(targetElement, transitionRun, []);
        window.requestAnimationFrame(
          () => addOrRemoveClasses(targetElement, transitionEnd, transitionStart)
        );
      });
      setTimeout(() => {
        addOrRemoveClasses(
          targetElement,
          [],
          [].concat(transitionRun).concat(transitionStart).concat(transitionEnd)
        );
        resolve();
      }, duration);
    });
  }
  function addOrRemoveClasses(targetElement, addClasses = [], removeClasses = []) {
    if (!targetElement)
      return;
    if (addClasses.length > 0) {
      targetElement.classList.add(...addClasses.filter(Boolean));
    }
    if (removeClasses.length > 0) {
      targetElement.classList.remove(...removeClasses.filter(Boolean));
    }
  }

  // salad_ui/core/component.js
  var Component = class {
    constructor(el, options) {
      const { hookContext, initialState = "idle", ignoreItems = true } = options;
      this.el = el;
      this.hook = hookContext;
      this.config = {
        preventDefaultKeys: []
      };
      this.initialState = initialState;
      this.eventConfig = {};
      this.componentConfig = {};
      this.hiddenConfig = {};
      this.ariaConfig = {};
      this.parseOptions();
      this.disabled = !!this.options.disabled;
      this.initEventMappings();
      this.initConfig();
      this.initStateMachine(this.componentConfig.stateMachine, this.initialState);
      this.ariaManager = new AriaManager(this, this.ariaConfig);
      this.allParts = Array.from(this.el.querySelectorAll("[data-part]")).concat([
        this.el
      ]);
      if (ignoreItems) {
        this.allParts = this.allParts.filter(
          (element) => !element.dataset.part.startsWith("item") && !element.dataset.part.endsWith("-item")
        );
      }
      this.updateUI();
      this.updatePartsVisibility();
      this.partMouseEventHandlers = /* @__PURE__ */ new Map();
      this.keyEventHandlers = /* @__PURE__ */ new Map();
    }
    parseOptions() {
      try {
        const optionsString = this.el.getAttribute("data-options");
        this.options = optionsString ? JSON.parse(optionsString) : {};
        this.initialState = this.el.getAttribute("data-state") || this.initialState;
      } catch (error) {
        console.error("SaladUI: Error parsing component options:", error);
        this.options = {};
      }
    }
    initEventMappings() {
      this.onClientCommand = this.onClientCommand.bind(this);
      this.el.addEventListener("salad_ui:command", this.onClientCommand);
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
      if (!this.componentConfig.stateMachine) {
        this.componentConfig.stateMachine = {
          idle: {
            enter: () => {
            },
            exit: () => {
            },
            transitions: {}
          }
        };
      } else {
        this.componentConfig.stateMachine = this.bindStateHandlers(
          this.componentConfig.stateMachine
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
      this.stateMachine = new state_machine_default(stateMachineConfig, initialState, {
        onStateChanged: this.onStateChanged.bind(this)
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
      var _a;
      const transitionName = `${prevState}_to_${nextState}`;
      const animConfig = (_a = this.options.animations) == null ? void 0 : _a[transitionName];
      this.updateUI();
      if (!animConfig) {
        this.updatePartsVisibility(nextState);
        return null;
      }
      const targetElement = animConfig.target_part ? this.getPart(animConfig.target_part) : this.el;
      return animateTransition(animConfig, targetElement).then(() => {
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
      Object.keys(stateMachineConfig).forEach((stateName) => {
        const stateConfig = stateMachineConfig[stateName];
        ["enter", "exit"].forEach((handlerName) => {
          if (typeof stateConfig[handlerName] === "string") {
            const methodName = stateConfig[handlerName];
            if (typeof this[methodName] === "function") {
              stateConfig[handlerName] = this[methodName].bind(this);
            } else {
              console.warn(
                `Method ${methodName} not found for ${handlerName} handler in state ${stateName}`
              );
            }
          }
        });
      });
      return stateMachineConfig;
    }
    setupEvents() {
      this.el.addEventListener("click", this.handleActionClick.bind(this));
      this.setupKeyEventHandlers();
      this.setupMouseEventHandlers();
      this.setupComponentEvents();
    }
    /**
     * Handle click events on action elements
     * Transition with the action attribute value
     */
    handleActionClick(event) {
      const actionElement = event.target.closest("[data-action]");
      if (!actionElement)
        return;
      const action = actionElement.getAttribute("data-action");
      this.transition(action, {
        originalEvent: event,
        target: actionElement
      });
    }
    setupComponentEvents() {
    }
    /**
     * Set up event listeners for mouse events based on the current state
     */
    setupKeyEventHandlers() {
      Object.keys(this.eventConfig).forEach((stateName) => {
        const stateEvents = this.eventConfig[stateName];
        if (!stateEvents || !stateEvents.keyMap)
          return;
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
        const element = this.getPart(stateEvents.keyEventTarget) || this.el;
        element.addEventListener("keydown", boundHandler);
        this.keyEventHandlers.set(element, boundHandler);
      });
    }
    /**
     * Set up event listeners for mouse events based on the current state
     */
    setupMouseEventHandlers() {
      Object.keys(this.eventConfig).forEach((stateName) => {
        const stateEvents = this.eventConfig[stateName];
        if (!stateEvents || !stateEvents.mouseMap)
          return;
        const mouseMap = stateEvents.mouseMap;
        Object.keys(mouseMap).forEach((partName) => {
          const partElements = this.getAllParts(partName);
          if (!partElements.length)
            return;
          Object.keys(mouseMap[partName]).forEach((eventType) => {
            const handlerAction = mouseMap[partName][eventType];
            const boundHandler = (event) => {
              const currentState = this.stateMachine.state;
              if (currentState === stateName) {
                this.executeHandler(handlerAction, event);
              }
            };
            partElements.forEach((element) => {
              element.addEventListener(eventType, boundHandler);
              if (!this.partMouseEventHandlers.has(element)) {
                this.partMouseEventHandlers.set(element, /* @__PURE__ */ new Map());
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
        this.keyEventHandlers.forEach((handler, element) => {
          element.removeEventListener("keydown", handler);
        });
        this.keyEventHandlers.clear();
      }
    }
    /**
     * Remove all active mouse event listeners
     */
    removeMouseEventListeners() {
      if (this.partMouseEventHandlers) {
        this.partMouseEventHandlers.forEach((eventHandlers, element) => {
          eventHandlers.forEach((handlers, eventType) => {
            handlers.forEach((handler) => {
              element.removeEventListener(eventType, handler);
            });
          });
        });
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
          this.transition(handler, {
            originalEvent: event,
            target: targetElement
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
     * Update UI to reflect current state
     * @param {Object} params - Optional parameters from state transition
     */
    updateUI(params = {}) {
      console.log("Updating UI", this.stateMachine.state);
      const currentState = this.stateMachine.state;
      this.allParts.forEach((el) => el.setAttribute("data-state", currentState));
      this.el.setAttribute("data-state", currentState);
      this.ariaManager.applyAriaAttributes(currentState);
    }
    /**
     * Update part visibility based on current state configuration
     */
    updatePartsVisibility() {
      console.log("Updating visibility");
      const currentState = this.stateMachine.state;
      const stateVisibility = this.hiddenConfig[currentState];
      if (!stateVisibility)
        return;
      Object.entries(stateVisibility).forEach(([partName, hidden]) => {
        const partElements = this.getAllParts(partName);
        partElements.forEach((element) => {
          if (element) {
            element.hidden = hidden;
            console.log("Setting hidden", partName, hidden, Date.now());
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
      if (!part)
        return null;
      if (!part.id) {
        part.id = `${this.el.id}-${partName}`;
      }
      return part.id;
    }
    // Push event to server (for frameworks like Phoenix LiveView)
    pushEvent(clientEvent, payload = {}, context) {
      if (!this.hook || !this.hook.pushEventTo)
        return;
      const eventHandler = this.eventMappings[clientEvent];
      const el = context || this.el;
      if (eventHandler) {
        if (typeof eventHandler === "string") {
          const fullPayload = __spreadProps(__spreadValues({}, payload), {
            componentId: el.id,
            component: el.getAttribute("data-component")
          });
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
      this.beforeDestroy();
      this.el.removeEventListener("salad_ui:command", this.onClientCommand);
      this.el.removeEventListener("click", this.handleActionClick);
      this.removeKeyEventHandlers();
      this.removeMouseEventListeners();
      this.ariaManager = null;
      this.stateMachine = null;
      this.el = null;
      this.hook = null;
      this.options = null;
      this.componentConfig = null;
    }
    // Lifecycle hooks
    beforeDestroy() {
    }
    // Alias for transition()
    handleCommand(command, params = {}) {
      return this.transition(command, params);
    }
    // Alias for transition()
    trigger(event, params = {}) {
      return this.transition(event, params);
    }
  };
  var AriaManager = class {
    constructor(component, ariaConfig) {
      this.component = component;
      this.ariaConfig = ariaConfig || {};
    }
    applyAriaAttributes(currentState) {
      if (!this.ariaConfig)
        return;
      Object.entries(this.ariaConfig).forEach(([partName, states]) => {
        const parts = this.component.getAllParts(partName);
        if (!parts || parts.length === 0)
          return;
        parts.forEach((part, index) => {
          if (!part.id) {
            part.id = `${this.component.el.id}-${partName}${parts.length > 1 ? `-${index}` : ""}`;
          }
          this.applyGlobalAriaAttributes(part, states);
          this.applyStateSpecificAriaAttributes(part, states, currentState);
        });
      });
    }
    applyGlobalAriaAttributes(part, states) {
      if (!states.all)
        return;
      Object.entries(states.all).forEach(([attr, value]) => {
        this.applyAriaAttribute(part, attr, value);
      });
    }
    applyStateSpecificAriaAttributes(part, states, currentState) {
      const stateConfig = states[currentState];
      if (!stateConfig)
        return;
      Object.entries(stateConfig).forEach(([attr, value]) => {
        this.applyAriaAttribute(part, attr, value);
      });
    }
    applyAriaAttribute(part, attr, value) {
      const resolvedValue = typeof value === "function" ? value.call(this.component, part) : value;
      if (resolvedValue === null || resolvedValue === void 0)
        return;
      if (attr === "role") {
        part.setAttribute("role", resolvedValue);
      } else {
        part.setAttribute(`aria-${attr}`, resolvedValue);
      }
    }
  };
  var component_default = Component;

  // salad_ui/core/factory.js
  var ComponentRegistry = class {
    constructor() {
      this.registry = /* @__PURE__ */ new Map();
    }
    register(type, ComponentClass) {
      this.registry.set(type, ComponentClass);
      return this;
    }
    create(type, el, hookContext) {
      const ComponentClass = this.registry.get(type);
      if (!ComponentClass) {
        console.error(`Component type '${type}' not registered`);
        return null;
      }
      const instance = new ComponentClass(el, hookContext);
      instance.setupEvents();
      return instance;
    }
  };
  var registry = new ComponentRegistry();

  // salad_ui/core/hook.js
  var SaladUIHook = {
    mounted() {
      this.initComponent();
      this.setupServerEvents();
    },
    initComponent() {
      const el = this.el;
      const componentType = el.getAttribute("data-component");
      if (!componentType) {
        console.error(
          "SaladUI: Component element is missing data-component attribute"
        );
        return;
      }
      this.component = registry.create(componentType, el, this);
    },
    setupServerEvents() {
      if (!this.component)
        return;
      this.handleEvent("saladui:command", ({ command, params = {}, target }) => {
        if (target && target !== this.el.id)
          return;
        if (this.component) {
          this.component.handleCommand(command, params);
        }
      });
    },
    updated() {
      if (this.component) {
        this.component.parseOptions();
        this.component.updatePartsVisibility();
        this.component.updateUI();
      }
    },
    destroyed() {
      this.component = null;
    }
  };

  // salad_ui/index.js
  function register(type, ComponentClass) {
    registry.register(type, ComponentClass);
  }
  var SaladUI = {
    Component: component_default,
    register,
    SaladUIHook
  };
  var salad_ui_default = SaladUI;

  // salad_ui/components/command.js
  var CommandComponent = class extends component_default {
    constructor(el, hookContext) {
      super(el, { hookContext, ignoreItems: false });
      __publicField(this, "focusNextItem", () => this.focusItem(this.currentItemIdx + 1));
      __publicField(this, "focusPrevItem", () => this.focusItem(this.currentItemIdx - 1));
      __publicField(this, "blurInput", () => {
        var _a;
        return (_a = this.input) == null ? void 0 : _a.blur();
      });
      __publicField(this, "selectItem", () => {
        if (this.currentItemIdx === -1)
          return;
        const item = this.selectableItems[this.currentItemIdx];
        item.click();
      });
      // Handle search/filtering
      __publicField(this, "handleSearch", () => {
        const query = this.input.value.trim().toLowerCase();
        this.items.forEach((item) => {
          const text = item.textContent.trim().toLowerCase();
          const visible = query === "" || text.includes(query);
          item.setAttribute("data-visible", visible ? "true" : "false");
        });
        this.visibleItems = this.items.filter(
          (el) => el.getAttribute("data-visible") === "true"
        );
        this.selectableItems = this.visibleItems.filter(
          (el) => !el.hasAttribute("disabled")
        );
        this.groups.forEach((group) => {
          const visibleOptions = group.querySelectorAll("[data-visible='true']");
          group.setAttribute(
            "data-visible",
            visibleOptions.length > 0 ? "true" : "false"
          );
        });
        this.focusItem(0);
        const noItems = this.visibleItems.length === 0;
        if (noItems) {
          this.empty.setAttribute("data-visible", "true");
        } else {
          this.empty.setAttribute("data-visible", "false");
        }
      });
      this.currentItemIdx = 0;
      this.input = this.getPart("input");
      this.list = this.getPart("list");
      this.empty = this.getPart("empty");
      this.groups = this.getAllParts("group");
      this.items = this.getAllParts("item");
      this.input.addEventListener("input", this.handleSearch);
      this.handleSearch();
      this.config.preventDefaultKeys = ["Escape", "ArrowDown", "ArrowUp"];
    }
    getComponentConfig() {
      return {
        stateMachine: {
          idle: { transitions: {} }
        },
        events: {
          idle: {
            keyMap: {
              Enter: "selectItem",
              ArrowDown: "focusNextItem",
              ArrowUp: "focusPrevItem",
              Escape: "blurInput"
            }
          }
        }
      };
    }
    // Focus item by index, wrap around if needed
    focusItem(index) {
      var _a;
      if (!((_a = this.selectableItems) == null ? void 0 : _a.length))
        return;
      if (index < 0)
        index = this.selectableItems.length - 1;
      if (index >= this.selectableItems.length)
        index = 0;
      this.currentItemIdx = index;
      this.items.forEach((item) => {
        item.setAttribute("data-selected", "false");
        item.setAttribute("aria-selected", "false");
      });
      const selectedItem = this.selectableItems[index];
      selectedItem.setAttribute("data-selected", "true");
      selectedItem.setAttribute("aria-selected", "true");
    }
    beforeDestroy() {
      this.input.removeEventListener("input", this.handleSearch);
    }
  };
  salad_ui_default.register("command", CommandComponent);

  // salad_ui/core/positioner.js
  var Positioner = class {
    /**
     * Calculate position for an element relative to a reference element
     *
     * @param {HTMLElement} element - The element to position
     * @param {HTMLElement} reference - The reference element to position against
     * @param {Object} options - Positioning options
     * @returns {Object} The computed position data
     */
    static calculate(element, reference, options = {}) {
      const {
        placement = "bottom",
        alignment = "center",
        container = document.body,
        flip = true,
        alignOffset = 0,
        sideOffset = 8
      } = options;
      const referenceRect = reference.getBoundingClientRect();
      const elementRect = {
        width: element.offsetWidth,
        height: element.offsetHeight
      };
      let containerRect;
      if (container === document.body) {
        containerRect = {
          top: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight
        };
      } else {
        containerRect = container.getBoundingClientRect();
      }
      let { x, y } = this.getBasePosition(
        placement,
        alignment,
        elementRect,
        referenceRect,
        alignOffset,
        sideOffset
      );
      let actualPlacement = placement;
      if (flip) {
        const flippedPlacement = this.getFlippedPlacement(
          placement,
          { x, y, width: elementRect.width, height: elementRect.height },
          containerRect
        );
        if (flippedPlacement !== placement) {
          actualPlacement = flippedPlacement;
          const flippedPosition = this.getBasePosition(
            flippedPlacement,
            alignment,
            elementRect,
            referenceRect,
            alignOffset,
            sideOffset
          );
          x = flippedPosition.x;
          y = flippedPosition.y;
        }
      }
      return {
        x,
        y,
        placement: actualPlacement
      };
    }
    /**
     * Apply position to an element
     * @param {HTMLElement} element - Element to position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    static applyPosition(element, x, y) {
      element.style.position = "fixed";
      element.style.top = y + "px";
      element.style.left = x + "px";
      element.style.margin = "0";
    }
    /**
     * Calculate base position based on placement and alignment
     */
    static getBasePosition(placement, alignment, elementRect, referenceRect, alignOffset = 0, sideOffset = 8) {
      let x = 0;
      let y = 0;
      switch (placement) {
        case "top":
          y = referenceRect.top - elementRect.height - sideOffset;
          break;
        case "right":
          x = referenceRect.right + sideOffset;
          y = referenceRect.top;
          break;
        case "bottom":
          y = referenceRect.bottom + sideOffset;
          break;
        case "left":
          x = referenceRect.left - elementRect.width - sideOffset;
          y = referenceRect.top;
          break;
      }
      switch (alignment) {
        case "start":
          if (placement === "top" || placement === "bottom") {
            x = referenceRect.left + alignOffset;
          } else {
            y = referenceRect.top + alignOffset;
          }
          break;
        case "center":
          if (placement === "top" || placement === "bottom") {
            x = referenceRect.left + referenceRect.width / 2 - elementRect.width / 2 + alignOffset;
          } else {
            y = referenceRect.top + referenceRect.height / 2 - elementRect.height / 2 + alignOffset;
          }
          break;
        case "end":
          if (placement === "top" || placement === "bottom") {
            x = referenceRect.right - elementRect.width + alignOffset;
          } else {
            y = referenceRect.bottom - elementRect.height + alignOffset;
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
      const overflowTop = y < containerRect.top;
      const overflowRight = x + width > containerRect.right;
      const overflowBottom = y + height > containerRect.bottom;
      const overflowLeft = x < containerRect.left;
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
     * Utility method to find all scrollable parent elements
     */
    static findScrollableParents(element) {
      const scrollableParents = [];
      let currentElement = element;
      while (currentElement && currentElement !== document.body) {
        const style = window.getComputedStyle(currentElement);
        if (style.overflow === "auto" || style.overflow === "scroll" || style.overflowX === "auto" || style.overflowX === "scroll" || style.overflowY === "auto" || style.overflowY === "scroll") {
          scrollableParents.push(currentElement);
        }
        currentElement = currentElement.parentElement;
      }
      scrollableParents.push(window);
      return scrollableParents;
    }
  };
  var positioner_default = Positioner;

  // salad_ui/core/focus-trap.js
  var FocusTrap = class {
    /**
     * Create a focus trap for a specific element
     *
     * @param {HTMLElement} element - The element to trap focus within
     * @param {Object} options - Focus trap options
     */
    constructor(element, options = {}) {
      this.element = element;
      this.options = __spreadValues({
        focusableSelector: 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      }, options);
      this.previouslyFocused = null;
      this.active = false;
      this.handleKeyDown = this.handleKeyDown.bind(this);
    }
    /**
     * Activate the focus trap
     */
    activate() {
      if (this.active)
        return;
      this.previouslyFocused = document.activeElement;
      this.active = true;
      this.element.addEventListener("keydown", this.handleKeyDown);
      this.setInitialFocus();
    }
    /**
     * Deactivate the focus trap and restore previous focus
     */
    deactivate() {
      if (!this.active)
        return;
      this.element.removeEventListener("keydown", this.handleKeyDown);
      if (this.previouslyFocused && this.previouslyFocused.focus && this.isElementInViewport(this.previouslyFocused)) {
        setTimeout(() => {
          this.previouslyFocused.focus();
          this.previouslyFocused = null;
        }, 0);
      }
      this.active = false;
    }
    /**
     * Set initial focus when trap is activated
     */
    setInitialFocus() {
      const focusableElements = this.getFocusableElements();
      setTimeout(() => {
        if (focusableElements.length > 0) {
          const autoFocusEl = this.element.querySelector("[autofocus]");
          const initialFocusEl = autoFocusEl || focusableElements[0];
          initialFocusEl.focus();
        } else {
          this.element.setAttribute("tabindex", "-1");
          this.element.focus();
        }
      }, 50);
    }
    /**
     * Handle keydown events for tab trapping and escape handling
     */
    handleKeyDown(event) {
      if (event.key === "Tab") {
        const focusableElements = this.getFocusableElements();
        if (focusableElements.length === 0)
          return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;
        if (!event.shiftKey && activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        } else if (event.shiftKey && activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      }
    }
    /**
     * Get all focusable elements within the trap
     */
    getFocusableElements() {
      return Array.from(
        this.element.querySelectorAll(this.options.focusableSelector)
      );
    }
    /**
     * Check if an element is currently visible in the viewport
     */
    isElementInViewport(element) {
      if (!element || !document.body.contains(element)) {
        return false;
      }
      const rect = element.getBoundingClientRect();
      return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
    }
    /**
     * Clean up all references when no longer needed
     */
    destroy() {
      this.deactivate();
      this.element = null;
      this.options = null;
      this.previouslyFocused = null;
    }
  };
  var focus_trap_default = FocusTrap;

  // salad_ui/core/click-outside.js
  var ClickOutsideMonitor = class {
    /**
     * Create a click outside monitor
     *
     * @param {HTMLElement|HTMLElement[]} elements - Element(s) to monitor clicks outside of
     * @param {Function} callback - Function to call when click outside is detected
     * @param {Object} options - Additional options
     */
    constructor(elements, callback, options = {}) {
      this.elements = Array.isArray(elements) ? elements : [elements];
      this.callback = callback;
      this.options = __spreadValues({
        // Whether to also monitor touchend events (for mobile)
        trackTouch: true,
        // Optional filter function to determine if a click should trigger the callback
        filter: null
      }, options);
      this.active = false;
      this.handleClick = this.handleClick.bind(this);
      this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }
    /**
     * Start monitoring clicks outside the element(s)
     */
    start() {
      if (this.active)
        return;
      document.addEventListener("click", this.handleClick);
      if (this.options.trackTouch) {
        document.addEventListener("touchend", this.handleTouchEnd);
      }
      this.active = true;
    }
    /**
     * Stop monitoring clicks
     */
    stop() {
      if (!this.active)
        return;
      document.removeEventListener("click", this.handleClick);
      if (this.options.trackTouch) {
        document.removeEventListener("touchend", this.handleTouchEnd);
      }
      this.active = false;
    }
    /**
     * Handle click events
     */
    handleClick(event) {
      this.checkOutsideClick(event);
    }
    /**
     * Handle touchend events
     */
    handleTouchEnd(event) {
      this.checkOutsideClick(event);
    }
    /**
     * Check if click/touch was outside monitored elements
     */
    checkOutsideClick(event) {
      if (!this.active || !this.callback)
        return;
      if (this.options.filter && !this.options.filter(event)) {
        return;
      }
      const target = event.target;
      const isOutside = !this.elements.some((element) => {
        return element && (element === target || element.contains(target));
      });
      if (isOutside) {
        this.callback(event);
      }
    }
    /**
     * Update the monitored elements
     */
    updateElements(elements) {
      this.elements = Array.isArray(elements) ? elements : [elements];
    }
    /**
     * Clean up all references
     */
    destroy() {
      this.stop();
      this.elements = null;
      this.callback = null;
      this.options = null;
    }
  };
  var click_outside_default = ClickOutsideMonitor;

  // salad_ui/core/portal.js
  var _Portal = class {
    /**
     * Move an element to a portal container
     *
     * @param {HTMLElement} element - Element to move to the portal
     * @param {HTMLElement} container - Container to move the element to (default: document.body)
     * @returns {boolean} Success status
     */
    static move(element, container = document.body) {
      if (!element)
        return false;
      const originalData = {
        parent: element.parentElement,
        styles: {
          position: element.style.position,
          top: element.style.top,
          left: element.style.left,
          zIndex: element.style.zIndex,
          margin: element.style.margin,
          transform: element.style.transform,
          pointerEvents: element.style.pointerEvents
        },
        inPortal: true
      };
      this.portalRegistry.set(element, originalData);
      container.appendChild(element);
      element.style.position = "absolute";
      element.style.zIndex = "9999";
      return true;
    }
    /**
     * Restore an element from portal to its original position
     *
     * @param {HTMLElement} element - Element to restore
     * @returns {boolean} Success status
     */
    static restore(element) {
      if (!element)
        return false;
      const originalData = this.portalRegistry.get(element);
      if (!originalData || !originalData.parent) {
        return false;
      }
      try {
        originalData.parent.appendChild(element);
        const styles = originalData.styles;
        element.style.position = styles.position || "";
        element.style.top = styles.top || "";
        element.style.left = styles.left || "";
        element.style.zIndex = styles.zIndex || "";
        element.style.margin = styles.margin || "";
        element.style.transform = styles.transform || "";
        element.style.pointerEvents = styles.pointerEvents || "";
        originalData.inPortal = false;
        return true;
      } catch (error) {
        console.warn("SaladUI Portal: Failed to restore element", error);
        return false;
      }
    }
    /**
     * Check if an element is currently in a portal
     *
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} Whether the element is in a portal
     */
    static isInPortal(element) {
      if (!element)
        return false;
      const data = this.portalRegistry.get(element);
      return (data == null ? void 0 : data.inPortal) === true;
    }
    /**
     * Setup scroll event passthrough for a portal element
     * Makes the portal element transparent to pointer events except for interactive elements
     *
     * @param {HTMLElement} element - Portal element to set up scroll passthrough for
     */
    static setupScrollPassthrough(element) {
      if (!element)
        return;
      const originalData = this.portalRegistry.get(element);
      if (originalData) {
        originalData.styles.pointerEvents = element.style.pointerEvents;
      }
      element.style.pointerEvents = "none";
      _Portal.updateScrollableContainer(element, "auto");
    }
    static updateScrollableContainer(parentElement, pointerEvent = "") {
      function isScrollable(element) {
        const style = window.getComputedStyle(element);
        const overflowY = style.overflowY;
        const overflowX = style.overflowX;
        const isScrollableY = element.scrollHeight > element.clientHeight;
        const isScrollableX = element.scrollWidth > element.clientWidth;
        return (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") && isScrollableY || (overflowX === "auto" || overflowX === "scroll" || overflowX === "overlay") && isScrollableX;
      }
      function traverse(element) {
        if (isScrollable(element)) {
          element.style.pointerEvents = pointerEvent;
          return;
        }
        for (let i = 0; i < element.children.length; i++) {
          traverse(element.children[i]);
        }
      }
      traverse(parentElement);
    }
    /**
     * Clean up scroll passthrough setup
     *
     * @param {HTMLElement} element - Element to clean up
     */
    static cleanupScrollPassthrough(element) {
      var _a;
      if (!element)
        return;
      const originalData = this.portalRegistry.get(element);
      const originalPointerEvents = ((_a = originalData == null ? void 0 : originalData.styles) == null ? void 0 : _a.pointerEvents) || "";
      element.style.pointerEvents = originalPointerEvents;
      _Portal.updateScrollableContainer(element, "");
    }
  };
  var Portal = _Portal;
  // Static storage for element metadata
  __publicField(Portal, "portalRegistry", /* @__PURE__ */ new WeakMap());
  var portal_default = Portal;

  // salad_ui/core/scroll-manager.js
  var ScrollManager = class {
    /**
     * Create a scroll manager to handle scroll and resize events
     *
     * @param {Function} updateCallback - Function to call when scroll/resize events occur
     * @param {Object} options - Additional options
     */
    constructor(updateCallback, options = {}) {
      this.updateCallback = updateCallback;
      this.options = __spreadValues({
        // Use requestAnimationFrame for throttling
        useRAF: true
      }, options);
      this.scrollableParents = [];
      this.active = false;
      this.resizeObserver = null;
      this.animationFrameId = null;
      this.handleScroll = this.handleScroll.bind(this);
      this.handleResize = this.handleResize.bind(this);
      this.updatePosition = this.updatePosition.bind(this);
    }
    /**
     * Start tracking scroll and resize events
     *
     * @param {HTMLElement} referenceElement - Element to track scrollable parents for
     * @param {HTMLElement} targetElement - Optional element to observe with ResizeObserver
     */
    start(referenceElement, targetElement = null) {
      if (this.active)
        return;
      if (referenceElement) {
        this.scrollableParents = this.findScrollableParents(referenceElement);
        this.scrollableParents.forEach((parent) => {
          parent.addEventListener("scroll", this.handleScroll, { passive: true });
        });
      }
      window.addEventListener("resize", this.handleResize, { passive: true });
      if (targetElement && typeof ResizeObserver !== "undefined") {
        this.resizeObserver = new ResizeObserver(this.updatePosition);
        this.resizeObserver.observe(targetElement);
        if (referenceElement && referenceElement !== targetElement) {
          this.resizeObserver.observe(referenceElement);
        }
      }
      this.active = true;
    }
    /**
     * Stop tracking scroll and resize events
     */
    stop() {
      if (!this.active)
        return;
      this.scrollableParents.forEach((parent) => {
        parent.removeEventListener("scroll", this.handleScroll);
      });
      window.removeEventListener("resize", this.handleResize);
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.active = false;
      this.scrollableParents = [];
    }
    /**
     * Handle scroll events with throttling
     */
    handleScroll() {
      if (this.options.useRAF) {
        this.throttledUpdate();
      } else {
        this.updatePosition();
      }
    }
    /**
     * Handle resize events with throttling
     */
    handleResize() {
      if (this.options.useRAF) {
        this.throttledUpdate();
      } else {
        this.updatePosition();
      }
    }
    /**
     * Throttle updates using requestAnimationFrame
     */
    throttledUpdate() {
      if (this.animationFrameId === null) {
        this.animationFrameId = requestAnimationFrame(() => {
          this.updatePosition();
          this.animationFrameId = null;
        });
      }
    }
    /**
     * Call the update callback
     */
    updatePosition() {
      if (this.updateCallback) {
        this.updateCallback();
      }
    }
    /**
     * Find all scrollable parent elements
     */
    findScrollableParents(element) {
      const scrollableParents = [];
      let currentElement = element;
      while (currentElement && currentElement !== document.body) {
        const style = window.getComputedStyle(currentElement);
        if (style.overflow === "auto" || style.overflow === "scroll" || style.overflowX === "auto" || style.overflowX === "scroll" || style.overflowY === "auto" || style.overflowY === "scroll") {
          scrollableParents.push(currentElement);
        }
        currentElement = currentElement.parentElement;
      }
      scrollableParents.push(window);
      return scrollableParents;
    }
    /**
     * Clean up all references
     */
    destroy() {
      this.stop();
      this.updateCallback = null;
      this.options = null;
    }
  };
  var scroll_manager_default = ScrollManager;

  // salad_ui/core/positioned-element.js
  var PositionedElement = class {
    /**
     * Create a positioned element with full functionality
     *
     * @param {HTMLElement} element - Element to position
     * @param {HTMLElement} reference - Reference element to position against
     * @param {Object} options - Positioning options
     */
    constructor(element, reference, options = {}) {
      this.element = element;
      this.reference = reference;
      this.options = __spreadValues({
        // Positioning options
        placement: "bottom",
        alignment: "center",
        sideOffset: 8,
        alignOffset: 0,
        flip: true,
        // Portal options
        usePortal: true,
        portalContainer: document.body,
        // Focus management
        trapFocus: false,
        focusableSelector: 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        // Event handlers
        onOutsideClick: null,
        scrollPassThrough: false
      }, options);
      this.active = false;
      this.initializeModules();
    }
    /**
     * Initialize all required modules
     */
    initializeModules() {
      this.focusTrap = new focus_trap_default(this.element, {
        focusableSelector: this.options.focusableSelector
      });
      this.clickOutsideMonitor = this.options.onOutsideClick ? new click_outside_default(
        [this.element, this.reference],
        this.options.onOutsideClick
      ) : null;
      this.scrollManager = new scroll_manager_default(() => {
        this.update();
      });
      this.handleWheel = this.handleWheel.bind(this);
      this.handleTouchStart = this.handleTouchStart.bind(this);
      this.handleTouchMove = this.handleTouchMove.bind(this);
    }
    /**
     * Activate the positioned element
     */
    activate() {
      if (this.active)
        return this;
      if (this.options.usePortal) {
        this.moveToPortal();
      }
      this.calculateAndApplyPosition();
      if (this.options.trapFocus) {
        this.focusTrap.activate();
      }
      if (this.clickOutsideMonitor) {
        this.clickOutsideMonitor.start();
      }
      this.scrollManager.start(this.reference, this.element);
      if (portal_default.isInPortal(this.element) && this.options.scrollPassThrough) {
        this.setupScrollPassthrough();
      }
      this.element.style.setProperty(
        "--salad-reference-width",
        this.reference.offsetWidth + "px"
      );
      this.element.style.setProperty(
        "--salad-reference-height",
        this.reference.offsetHeight + "px"
      );
      this.active = true;
      return this;
    }
    /**
     * Deactivate the positioned element
     */
    deactivate() {
      if (!this.active)
        return this;
      if (this.options.trapFocus) {
        this.focusTrap.deactivate();
      }
      if (this.clickOutsideMonitor) {
        this.clickOutsideMonitor.stop();
      }
      this.scrollManager.stop();
      if (portal_default.isInPortal(this.element) && this.options.scrollPassThrough) {
        this.cleanupScrollPassthrough();
      }
      if (this.inPortal) {
        this.restoreFromPortal();
      }
      this.active = false;
      return this;
    }
    /**
     * Update position
     */
    update() {
      if (this.active) {
        this.calculateAndApplyPosition();
      }
      return this;
    }
    /**
     * Move element to portal container
     */
    moveToPortal() {
      if (portal_default.isInPortal(this.element))
        return;
      const container = this.options.portalContainer || document.body;
      portal_default.move(this.element, container);
    }
    /**
     * Restore element from portal
     */
    restoreFromPortal() {
      if (!portal_default.isInPortal(this.element))
        return;
      portal_default.restore(this.element);
    }
    /**
     * Calculate and apply position to the element
     */
    calculateAndApplyPosition() {
      const position = positioner_default.calculate(
        this.element,
        this.reference,
        this.options
      );
      positioner_default.applyPosition(this.element, position.x, position.y);
      this.element.setAttribute("data-placement", position.placement);
      return position;
    }
    /**
     * Set up scroll event passthrough
     */
    setupScrollPassthrough() {
      portal_default.setupScrollPassthrough(this.element, this.options.focusableSelector);
      this.element.addEventListener("wheel", this.handleWheel, {
        passive: false
      });
      this.element.addEventListener("touchstart", this.handleTouchStart, {
        passive: false
      });
      this.element.addEventListener("touchmove", this.handleTouchMove, {
        passive: false
      });
    }
    /**
     * Clean up scroll passthrough
     */
    cleanupScrollPassthrough() {
      if (!this.element)
        return;
      this.element.removeEventListener("wheel", this.handleWheel);
      this.element.removeEventListener("touchstart", this.handleTouchStart);
      this.element.removeEventListener("touchmove", this.handleTouchMove);
      portal_default.cleanupScrollPassthrough(this.element);
    }
    /**
     * Handle wheel events for scroll passthrough
     */
    handleWheel(event) {
      event.stopPropagation();
    }
    /**
     * Handle touch start for scroll passthrough
     */
    handleTouchStart(event) {
      if (event.touches.length === 1) {
        this.touchStartY = event.touches[0].clientY;
      }
    }
    /**
     * Handle touch move for scroll passthrough
     */
    handleTouchMove(event) {
      if (!this.touchStartY)
        return;
      const touchY = event.touches[0].clientY;
      const deltaY = this.touchStartY - touchY;
      this.touchStartY = touchY;
      const elementsFromPoint = document.elementsFromPoint(
        event.touches[0].clientX,
        event.touches[0].clientY
      );
      const scrollableElement = elementsFromPoint.find((el) => {
        if (el === this.element || this.element.contains(el))
          return false;
        const style = window.getComputedStyle(el);
        return style.overflowY === "auto" || style.overflowY === "scroll" || el === document.documentElement;
      });
      if (scrollableElement) {
        scrollableElement.scrollTop += deltaY;
        event.preventDefault();
      }
    }
    /**
     * Update the reference element
     */
    updateReference(reference) {
      this.reference = reference;
      if (this.clickOutsideMonitor) {
        this.clickOutsideMonitor.updateElements([this.element, this.reference]);
      }
      this.update();
      return this;
    }
    /**
     * Update options
     */
    updateOptions(options = {}) {
      this.options = __spreadValues(__spreadValues({}, this.options), options);
      if (this.focusTrap && options.focusableSelector) {
        this.focusTrap.options = __spreadProps(__spreadValues({}, this.focusTrap.options), {
          focusableSelector: options.focusableSelector
        });
      }
      this.update();
      return this;
    }
    /**
     * Clean up and destroy the positioned element
     */
    destroy() {
      this.deactivate();
      this.focusTrap.destroy();
      if (this.clickOutsideMonitor) {
        this.clickOutsideMonitor.destroy();
      }
      this.scrollManager.destroy();
      this.element = null;
      this.reference = null;
      this.options = null;
      this.focusTrap = null;
      this.clickOutsideMonitor = null;
      this.scrollManager = null;
      this.touchStartY = null;
    }
  };
  var positioned_element_default = PositionedElement;

  // salad_ui/components/popover.js
  var PopoverComponent = class extends component_default {
    constructor(el, hookContext) {
      super(el, { hookContext });
      this.trigger = this.getPart("trigger");
      this.positioner = this.getPart("positioner");
      this.content = this.positioner ? this.positioner.querySelector("[data-part='content']") : null;
      this.config.preventDefaultKeys = ["Escape"];
    }
    getComponentConfig() {
      return {
        stateMachine: {
          closed: {
            enter: "onClosedEnter",
            transitions: {
              open: "open",
              toggle: "open"
            }
          },
          open: {
            enter: "onOpenEnter",
            transitions: {
              close: "closed",
              toggle: "closed"
            }
          }
        },
        events: {
          closed: {
            keyMap: {}
          },
          open: {
            keyMap: {
              Escape: "close"
            }
          }
        },
        hiddenConfig: {
          closed: {
            positioner: true
            // Hide the positioner in closed state
          },
          open: {
            positioner: false
            // Show the positioner in open state
          }
        },
        ariaConfig: {
          trigger: {
            all: {
              haspopup: "dialog"
            },
            open: {
              expanded: "true"
            },
            closed: {
              expanded: "false"
            }
          },
          content: {
            all: {
              role: "dialog"
            }
          }
        }
      };
    }
    /**
     * Initializes the positioned element if the positioner and trigger exist and the positioned element is not already created.
     * Extracts placement configuration from DOM attributes and creates a new PositionedElement instance.
     */
    initializePositionedElement() {
      if (this.positioner && this.trigger && !this.positionedElement) {
        const placement = this.positioner.getAttribute("data-side") || "bottom";
        const alignment = this.positioner.getAttribute("data-align") || "center";
        const sideOffset = parseInt(
          this.positioner.getAttribute("data-side-offset") || "8",
          10
        );
        const alignOffset = parseInt(
          this.positioner.getAttribute("data-align-offset") || "0",
          10
        );
        this.positionedElement = new positioned_element_default(
          this.positioner,
          this.trigger,
          {
            placement,
            alignment,
            sideOffset,
            alignOffset,
            flip: true,
            usePortal: true,
            portalContainer: document.querySelector(this.options.portalContainer),
            trapFocus: true,
            onOutsideClick: () => this.transition("close")
          }
        );
      }
    }
    onOpenEnter(params = {}) {
      var _a;
      this.initializePositionedElement();
      (_a = this.positionedElement) == null ? void 0 : _a.activate();
      this.pushEvent("opened");
    }
    onClosedEnter() {
      var _a;
      (_a = this.positionedElement) == null ? void 0 : _a.deactivate();
      this.pushEvent("closed");
    }
    beforeDestroy() {
      var _a;
      (_a = this.positionedElement) == null ? void 0 : _a.destroy();
      this.positionedElement = null;
    }
  };
  salad_ui_default.register("popover", PopoverComponent);

  // js/storybook.js
  var Hooks = {
    SaladUI: salad_ui_default.SaladUIHook
  };
  (function() {
    window.storybook = { Hooks };
  })();
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vYXNzZXRzL3NhbGFkX3VpL2NvcmUvc3RhdGUtbWFjaGluZS5qcyIsICIuLi8uLi8uLi9hc3NldHMvc2FsYWRfdWkvY29yZS91dGlscy5qcyIsICIuLi8uLi8uLi9hc3NldHMvc2FsYWRfdWkvY29yZS9jb21wb25lbnQuanMiLCAiLi4vLi4vLi4vYXNzZXRzL3NhbGFkX3VpL2NvcmUvZmFjdG9yeS5qcyIsICIuLi8uLi8uLi9hc3NldHMvc2FsYWRfdWkvY29yZS9ob29rLmpzIiwgIi4uLy4uLy4uL2Fzc2V0cy9zYWxhZF91aS9pbmRleC5qcyIsICIuLi8uLi8uLi9hc3NldHMvc2FsYWRfdWkvY29tcG9uZW50cy9jb21tYW5kLmpzIiwgIi4uLy4uLy4uL2Fzc2V0cy9zYWxhZF91aS9jb3JlL3Bvc2l0aW9uZXIuanMiLCAiLi4vLi4vLi4vYXNzZXRzL3NhbGFkX3VpL2NvcmUvZm9jdXMtdHJhcC5qcyIsICIuLi8uLi8uLi9hc3NldHMvc2FsYWRfdWkvY29yZS9jbGljay1vdXRzaWRlLmpzIiwgIi4uLy4uLy4uL2Fzc2V0cy9zYWxhZF91aS9jb3JlL3BvcnRhbC5qcyIsICIuLi8uLi8uLi9hc3NldHMvc2FsYWRfdWkvY29yZS9zY3JvbGwtbWFuYWdlci5qcyIsICIuLi8uLi8uLi9hc3NldHMvc2FsYWRfdWkvY29yZS9wb3NpdGlvbmVkLWVsZW1lbnQuanMiLCAiLi4vLi4vLi4vYXNzZXRzL3NhbGFkX3VpL2NvbXBvbmVudHMvcG9wb3Zlci5qcyIsICIuLi8uLi8uLi9hc3NldHMvanMvc3Rvcnlib29rLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBzYWxhZHVpL2NvcmUvc3RhdGUtbWFjaGluZS5qc1xuLyoqXG4gKiBTdGF0ZU1hY2hpbmUgY2xhc3MgZm9yIFNhbGFkVUkgZnJhbWV3b3JrXG4gKiBIYW5kbGVzIHN0YXRlIHRyYW5zaXRpb25zLCBldmVudCBwcm9jZXNzaW5nLCBhbmQgc3RhdGUtc3BlY2lmaWMgYmVoYXZpb3JcbiAqL1xuY2xhc3MgU3RhdGVNYWNoaW5lIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIHN0YXRlIG1hY2hpbmVcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlQ29uZmlnIC0gQ29uZmlndXJhdGlvbiBvYmplY3QgZGVmaW5pbmcgc3RhdGVzIGFuZCB0cmFuc2l0aW9uc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5pdGlhbFN0YXRlIC0gVGhlIGluaXRpYWwgc3RhdGUgdG8gc3RhcnQgaW5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPcHRpb25hbCBjb25maWd1cmF0aW9uIG9wdGlvbnMuIEN1cnJlbnRseSBzdXBwb3J0czpcbiAgICogICAtIG9uU3RhdGVDaGFuZ2VkOiBBIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBzdGF0ZSBjaGFuZ2VzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzdGF0ZUNvbmZpZywgaW5pdGlhbFN0YXRlLCBvcHRpb25zKSB7XG4gICAgdGhpcy5zdGF0ZUNvbmZpZyA9IHN0YXRlQ29uZmlnO1xuICAgIHRoaXMuc3RhdGUgPSBpbml0aWFsU3RhdGUgfHwgXCJpZGxlXCI7XG4gICAgdGhpcy5wcmV2aW91c1N0YXRlID0gbnVsbDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgYSB0cmFuc2l0aW9uIGJhc2VkIG9uIGFuIGV2ZW50XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIFRoZSBldmVudCB0cmlnZ2VyaW5nIHRoZSB0cmFuc2l0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBQYXJhbWV0ZXJzIHRvIHBhc3MgdG8gdGhlIGhhbmRsZXJzXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIHRoZSB0cmFuc2l0aW9uIHdhcyBzdWNjZXNzZnVsXG4gICAqL1xuICB0cmFuc2l0aW9uKGV2ZW50LCBwYXJhbXMgPSB7fSkge1xuICAgIGNvbnN0IGN1cnJlbnRTdGF0ZUNvbmZpZyA9IHRoaXMuc3RhdGVDb25maWdbdGhpcy5zdGF0ZV07XG4gICAgaWYgKCFjdXJyZW50U3RhdGVDb25maWcpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IHRyYW5zaXRpb24gPSBjdXJyZW50U3RhdGVDb25maWcudHJhbnNpdGlvbnM/LltldmVudF07XG4gICAgaWYgKCF0cmFuc2l0aW9uKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBuZXh0U3RhdGUgPSB0aGlzLmRldGVybWluZU5leHRTdGF0ZSh0cmFuc2l0aW9uLCBwYXJhbXMpO1xuICAgIGlmICghbmV4dFN0YXRlKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBwcmV2U3RhdGUgPSB0aGlzLnN0YXRlO1xuXG4gICAgdGhpcy5leGVjdXRlVHJhbnNpdGlvbihwcmV2U3RhdGUsIG5leHRTdGF0ZSwgcGFyYW1zKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSB0aGUgbmV4dCBzdGF0ZSBiYXNlZCBvbiB0aGUgdHJhbnNpdGlvbiBkZWZpbml0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfEZ1bmN0aW9ufE9iamVjdH0gdHJhbnNpdGlvbiAtIFRyYW5zaXRpb24gZGVmaW5pdGlvblxuICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIC0gUGFyYW1ldGVycyB0byBoZWxwIGRldGVybWluZSB0aGUgbmV4dCBzdGF0ZVxuICAgKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9IFRoZSBuZXh0IHN0YXRlIG9yIG51bGwgaWYgbm90IGRldGVybWluYWJsZVxuICAgKi9cbiAgZGV0ZXJtaW5lTmV4dFN0YXRlKHRyYW5zaXRpb24sIHBhcmFtcykge1xuICAgIGlmICh0eXBlb2YgdHJhbnNpdGlvbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgcmV0dXJuIHRyYW5zaXRpb247XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdHJhbnNpdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICByZXR1cm4gdHJhbnNpdGlvbihwYXJhbXMpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIGEgdHJhbnNpdGlvbiBiZXR3ZWVuIHN0YXRlcywgd2l0aCBvcHRpb25hbCBhbmltYXRpb25cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHByZXZTdGF0ZSAtIFRoZSBzdGF0ZSB3ZSdyZSBjb21pbmcgZnJvbVxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmV4dFN0YXRlIC0gVGhlIHN0YXRlIHdlJ3JlIGdvaW5nIHRvXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBQYXJhbWV0ZXJzIHRvIHBhc3MgdG8gaGFuZGxlcnNcbiAgICovXG4gIGV4ZWN1dGVUcmFuc2l0aW9uKHByZXZTdGF0ZSwgbmV4dFN0YXRlLCBwYXJhbXMgPSB7fSkge1xuICAgIC8vIEV4ZWN1dGUgZXhpdCBoYW5kbGVyc1xuICAgIHRoaXMuZXhlY3V0ZVN0YXRlSGFuZGxlcihwcmV2U3RhdGUsIFwiZXhpdFwiLCBwYXJhbXMpO1xuXG4gICAgLy8gVXBkYXRlIHN0YXRlXG4gICAgdGhpcy5wcmV2aW91c1N0YXRlID0gcHJldlN0YXRlO1xuICAgIHRoaXMuc3RhdGUgPSBuZXh0U3RhdGU7XG5cbiAgICBsZXQgY2FsbGJhY2tSZXN1bHQ7XG4gICAgLy8gRXhlY3V0ZSBzdGF0ZSBjaGFuZ2UgaG9va1xuICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uU3RhdGVDaGFuZ2VkID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGNhbGxiYWNrUmVzdWx0ID0gdGhpcy5vcHRpb25zLm9uU3RhdGVDaGFuZ2VkKFxuICAgICAgICBwcmV2U3RhdGUsXG4gICAgICAgIG5leHRTdGF0ZSxcbiAgICAgICAgcGFyYW1zLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoY2FsbGJhY2tSZXN1bHQgJiYgdHlwZW9mIGNhbGxiYWNrUmVzdWx0LnRoZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHByb21pc2UsIHdhaXQgZm9yIGNvbXBsZXRpb24gYmVmb3JlIGV4ZWN1dGluZyBlbnRlciBoYW5kbGVyXG4gICAgICBjYWxsYmFja1Jlc3VsdFxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5leGVjdXRlU3RhdGVIYW5kbGVyKG5leHRTdGF0ZSwgXCJlbnRlclwiLCBwYXJhbXMpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcIkFuaW1hdGlvbiBwcm9taXNlIHJlamVjdGVkOlwiLCBlcnJvcik7XG4gICAgICAgICAgLy8gU3RpbGwgZXhlY3V0ZSBlbnRlciBoYW5kbGVyIGV2ZW4gaWYgYW5pbWF0aW9uIGZhaWxzXG4gICAgICAgICAgdGhpcy5leGVjdXRlU3RhdGVIYW5kbGVyKG5leHRTdGF0ZSwgXCJlbnRlclwiLCBwYXJhbXMpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgaXQgZG9lc24ndCByZXR1cm4gYSBwcm9taXNlLCBleGVjdXRlIGVudGVyIGhhbmRsZXIgaW1tZWRpYXRlbHlcbiAgICAgIHRoaXMuZXhlY3V0ZVN0YXRlSGFuZGxlcihuZXh0U3RhdGUsIFwiZW50ZXJcIiwgcGFyYW1zKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZSBhIHN0YXRlIGhhbmRsZXIgKGVudGVyIG9yIGV4aXQpXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBUaGUgc3RhdGUgd2hvc2UgaGFuZGxlciB0byBleGVjdXRlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBoYW5kbGVyVHlwZSAtICdlbnRlcicgb3IgJ2V4aXQnXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBQYXJhbWV0ZXJzIHRvIHBhc3MgdG8gdGhlIGhhbmRsZXJcbiAgICovXG4gIGV4ZWN1dGVTdGF0ZUhhbmRsZXIoc3RhdGVOYW1lLCBoYW5kbGVyVHlwZSwgcGFyYW1zKSB7XG4gICAgY29uc3Qgc3RhdGVDb25maWcgPSB0aGlzLnN0YXRlQ29uZmlnW3N0YXRlTmFtZV07XG4gICAgaWYgKCFzdGF0ZUNvbmZpZykgcmV0dXJuO1xuXG4gICAgY29uc3QgaGFuZGxlciA9IHN0YXRlQ29uZmlnW2hhbmRsZXJUeXBlXTtcblxuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBoYW5kbGVyKHBhcmFtcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBzdGF0ZSBoYXMgY2hhbmdlZCBzaW5jZSBsYXN0IHRyYW5zaXRpb25cbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgdGhlIHN0YXRlIGhhcyBjaGFuZ2VkXG4gICAqL1xuICBoYXNTdGF0ZUNoYW5nZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgIT09IHRoaXMucHJldmlvdXNTdGF0ZTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTdGF0ZU1hY2hpbmU7XG4iLCAiLy8gc2FsYWR1aS9jb3JlL2FuaW1hdGlvbi11dGlscy5qc1xuLyoqXG4gKiBBbmltYXRpb24gdXRpbGl0aWVzIGZvciBTYWxhZFVJIGZyYW1ld29yayBjb21wb25lbnRzXG4gKiBQcm92aWRlcyBmdW5jdGlvbnMgdG8gaGFuZGxlIGFuaW1hdGlvbnMgYW5kIHRyYW5zaXRpb25zXG4gKi9cblxuLyoqXG4gKiBBbmltYXRpb24gaGFuZGxlciBmb3Igc3RhdGUgdHJhbnNpdGlvbnNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYW5pbUNvbmZpZyAtIEFuaW1hdGlvbiBjb25maWd1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0RWxlbWVudCAtIEVsZW1lbnQgdG8gYW5pbWF0ZVxuICogQHJldHVybnMge1Byb21pc2V9IEEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYW5pbWF0aW9uIGNvbXBsZXRlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0ZVRyYW5zaXRpb24oYW5pbUNvbmZpZywgdGFyZ2V0RWxlbWVudCkge1xuICBpZiAoIWFuaW1Db25maWcgfHwgIXRhcmdldEVsZW1lbnQpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7IC8vIFJldHVybiByZXNvbHZlZCBwcm9taXNlIGlmIG5vIGFuaW1hdGlvbiBvciB0YXJnZXRcbiAgfVxuXG4gIGNvbnN0IHsgYW5pbWF0aW9uLCBkdXJhdGlvbiA9IDIwMCB9ID0gYW5pbUNvbmZpZztcblxuICAvLyBQcm9jZXNzIGFuaW1hdGlvbiBjbGFzc2VzXG4gIGNvbnN0IGFuaW1hdGlvbkNsYXNzZXMgPSAoYW5pbWF0aW9uIHx8IFtcIlwiLCBcIlwiLCBcIlwiXSkubWFwKChpdGVtKSA9PlxuICAgIHR5cGVvZiBpdGVtID09PSBcInN0cmluZ1wiID8gaXRlbS5zcGxpdCgvXFxzKy8pIDogW10sXG4gICk7XG5cbiAgLy8gRXhlY3V0ZSBhbmltYXRpb24gd2l0aCBwcm9taXNlXG4gIHJldHVybiBleGVjdXRlQW5pbWF0aW9uKHRhcmdldEVsZW1lbnQsIHtcbiAgICBhbmltYXRpb246IGFuaW1hdGlvbkNsYXNzZXMsXG4gICAgZHVyYXRpb24sXG4gIH0pO1xufVxuXG4vKipcbiAqIEV4ZWN1dGUgYW5pbWF0aW9uIHNlcXVlbmNlIG9uIHRhcmdldCBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0RWxlbWVudCAtIEVsZW1lbnQgdG8gYW5pbWF0ZVxuICogQHBhcmFtIHtPYmplY3R9IGFuaW1PcHRpb25zIC0gQW5pbWF0aW9uIG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBhbmltYXRpb24gY29tcGxldGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGVjdXRlQW5pbWF0aW9uKHRhcmdldEVsZW1lbnQsIGFuaW1PcHRpb25zKSB7XG4gIGNvbnNvbGUubG9nKFwiQW5pbWF0aW5nXCIsIHRhcmdldEVsZW1lbnQsIGFuaW1PcHRpb25zKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3QgeyBhbmltYXRpb24sIGR1cmF0aW9uIH0gPSBhbmltT3B0aW9ucztcbiAgICBsZXQgW3RyYW5zaXRpb25SdW4sIHRyYW5zaXRpb25TdGFydCwgdHJhbnNpdGlvbkVuZF0gPSBhbmltYXRpb24gfHwgW1xuICAgICAgW10sXG4gICAgICBbXSxcbiAgICAgIFtdLFxuICAgIF07XG5cbiAgICAvLyBGaXJzdCBhbmltYXRpb24gZnJhbWU6IGFwcGx5IHN0YXJ0IGNsYXNzZXNcbiAgICBhZGRPclJlbW92ZUNsYXNzZXMoXG4gICAgICB0YXJnZXRFbGVtZW50LFxuICAgICAgdHJhbnNpdGlvblN0YXJ0LFxuICAgICAgW10uY29uY2F0KHRyYW5zaXRpb25SdW4pLmNvbmNhdCh0cmFuc2l0aW9uRW5kKSxcbiAgICApO1xuXG4gICAgLy8gTmV4dCBmcmFtZTogYXBwbHkgcnVubmluZyBjbGFzc2VzXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBhZGRPclJlbW92ZUNsYXNzZXModGFyZ2V0RWxlbWVudCwgdHJhbnNpdGlvblJ1biwgW10pO1xuXG4gICAgICAvLyBOZXh0IGZyYW1lOiBhcHBseSBlbmQgY2xhc3Nlc1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PlxuICAgICAgICBhZGRPclJlbW92ZUNsYXNzZXModGFyZ2V0RWxlbWVudCwgdHJhbnNpdGlvbkVuZCwgdHJhbnNpdGlvblN0YXJ0KSxcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICAvLyBBZnRlciBkdXJhdGlvbiwgY2xlYW4gdXAgY2xhc3NlcyBhbmQgcmVzb2x2ZSBwcm9taXNlXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBhZGRPclJlbW92ZUNsYXNzZXMoXG4gICAgICAgIHRhcmdldEVsZW1lbnQsXG4gICAgICAgIFtdLFxuICAgICAgICBbXS5jb25jYXQodHJhbnNpdGlvblJ1bikuY29uY2F0KHRyYW5zaXRpb25TdGFydCkuY29uY2F0KHRyYW5zaXRpb25FbmQpLFxuICAgICAgKTtcblxuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0sIGR1cmF0aW9uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogQWRkIGFuZCByZW1vdmUgQ1NTIGNsYXNzZXMgZnJvbSBhIHRhcmdldCBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0RWxlbWVudCAtIEVsZW1lbnQgdG8gbW9kaWZ5IGNsYXNzZXMgb25cbiAqIEBwYXJhbSB7QXJyYXl9IGFkZENsYXNzZXMgLSBDbGFzc2VzIHRvIGFkZFxuICogQHBhcmFtIHtBcnJheX0gcmVtb3ZlQ2xhc3NlcyAtIENsYXNzZXMgdG8gcmVtb3ZlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRPclJlbW92ZUNsYXNzZXMoXG4gIHRhcmdldEVsZW1lbnQsXG4gIGFkZENsYXNzZXMgPSBbXSxcbiAgcmVtb3ZlQ2xhc3NlcyA9IFtdLFxuKSB7XG4gIGlmICghdGFyZ2V0RWxlbWVudCkgcmV0dXJuO1xuXG4gIGlmIChhZGRDbGFzc2VzLmxlbmd0aCA+IDApIHtcbiAgICB0YXJnZXRFbGVtZW50LmNsYXNzTGlzdC5hZGQoLi4uYWRkQ2xhc3Nlcy5maWx0ZXIoQm9vbGVhbikpO1xuICB9XG4gIGlmIChyZW1vdmVDbGFzc2VzLmxlbmd0aCA+IDApIHtcbiAgICB0YXJnZXRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoLi4ucmVtb3ZlQ2xhc3Nlcy5maWx0ZXIoQm9vbGVhbikpO1xuICB9XG59XG4iLCAiLy8gc2FsYWR1aS9jb3JlL2NvbXBvbmVudC5qc1xuLyoqXG4gKiBCYXNlIENvbXBvbmVudCBjbGFzcyBmb3IgU2FsYWRVSSBmcmFtZXdvcmtcbiAqIFByb3ZpZGVzIHN0YXRlIG1hbmFnZW1lbnQsIGV2ZW50IGhhbmRsaW5nLCBhbmQgQVJJQSBzdXBwb3J0XG4gKi9cbmltcG9ydCBTdGF0ZU1hY2hpbmUgZnJvbSBcIi4vc3RhdGUtbWFjaGluZVwiO1xuaW1wb3J0IHsgYW5pbWF0ZVRyYW5zaXRpb24gfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5jbGFzcyBDb21wb25lbnQge1xuICBjb25zdHJ1Y3RvcihlbCwgb3B0aW9ucykge1xuICAgIGNvbnN0IHsgaG9va0NvbnRleHQsIGluaXRpYWxTdGF0ZSA9IFwiaWRsZVwiLCBpZ25vcmVJdGVtcyA9IHRydWUgfSA9IG9wdGlvbnM7XG5cbiAgICB0aGlzLmVsID0gZWw7XG4gICAgdGhpcy5ob29rID0gaG9va0NvbnRleHQ7XG5cbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIHByZXZlbnREZWZhdWx0S2V5czogW10sXG4gICAgfTtcblxuICAgIHRoaXMuaW5pdGlhbFN0YXRlID0gaW5pdGlhbFN0YXRlO1xuICAgIHRoaXMuZXZlbnRDb25maWcgPSB7fTtcbiAgICB0aGlzLmNvbXBvbmVudENvbmZpZyA9IHt9O1xuICAgIHRoaXMuaGlkZGVuQ29uZmlnID0ge307XG4gICAgdGhpcy5hcmlhQ29uZmlnID0ge307XG5cbiAgICAvLyBJbml0aWFsaXplIGNvbXBvbmVudFxuICAgIHRoaXMucGFyc2VPcHRpb25zKCk7XG4gICAgdGhpcy5kaXNhYmxlZCA9ICEhdGhpcy5vcHRpb25zLmRpc2FibGVkO1xuICAgIHRoaXMuaW5pdEV2ZW50TWFwcGluZ3MoKTtcbiAgICB0aGlzLmluaXRDb25maWcoKTtcbiAgICB0aGlzLmluaXRTdGF0ZU1hY2hpbmUodGhpcy5jb21wb25lbnRDb25maWcuc3RhdGVNYWNoaW5lLCB0aGlzLmluaXRpYWxTdGF0ZSk7XG4gICAgdGhpcy5hcmlhTWFuYWdlciA9IG5ldyBBcmlhTWFuYWdlcih0aGlzLCB0aGlzLmFyaWFDb25maWcpO1xuXG4gICAgLy8gaWdub3JlIGl0ZW0ncyBwYXJ0XG4gICAgdGhpcy5hbGxQYXJ0cyA9IEFycmF5LmZyb20odGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtcGFydF1cIikpLmNvbmNhdChbXG4gICAgICB0aGlzLmVsLFxuICAgIF0pO1xuICAgIGlmIChpZ25vcmVJdGVtcykge1xuICAgICAgdGhpcy5hbGxQYXJ0cyA9IHRoaXMuYWxsUGFydHMuZmlsdGVyKFxuICAgICAgICAoZWxlbWVudCkgPT5cbiAgICAgICAgICAhZWxlbWVudC5kYXRhc2V0LnBhcnQuc3RhcnRzV2l0aChcIml0ZW1cIikgJiZcbiAgICAgICAgICAhZWxlbWVudC5kYXRhc2V0LnBhcnQuZW5kc1dpdGgoXCItaXRlbVwiKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVVSSgpO1xuICAgIHRoaXMudXBkYXRlUGFydHNWaXNpYmlsaXR5KCk7XG5cbiAgICAvLyBNYXAgdG8gc3RvcmUgZXZlbnQgaGFuZGxlcnMgZm9yIGVhY2ggcGFydCBlbGVtZW50XG4gICAgdGhpcy5wYXJ0TW91c2VFdmVudEhhbmRsZXJzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMua2V5RXZlbnRIYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIHBhcnNlT3B0aW9ucygpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgb3B0aW9uc1N0cmluZyA9IHRoaXMuZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1vcHRpb25zXCIpO1xuICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1N0cmluZyA/IEpTT04ucGFyc2Uob3B0aW9uc1N0cmluZykgOiB7fTtcbiAgICAgIHRoaXMuaW5pdGlhbFN0YXRlID1cbiAgICAgICAgdGhpcy5lbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIpIHx8IHRoaXMuaW5pdGlhbFN0YXRlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiU2FsYWRVSTogRXJyb3IgcGFyc2luZyBjb21wb25lbnQgb3B0aW9uczpcIiwgZXJyb3IpO1xuICAgICAgdGhpcy5vcHRpb25zID0ge307XG4gICAgfVxuICB9XG5cbiAgaW5pdEV2ZW50TWFwcGluZ3MoKSB7XG4gICAgdGhpcy5vbkNsaWVudENvbW1hbmQgPSB0aGlzLm9uQ2xpZW50Q29tbWFuZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcInNhbGFkX3VpOmNvbW1hbmRcIiwgdGhpcy5vbkNsaWVudENvbW1hbmQpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1hcHBpbmdzU3RyaW5nID0gdGhpcy5lbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWV2ZW50LW1hcHBpbmdzXCIpO1xuICAgICAgdGhpcy5ldmVudE1hcHBpbmdzID0gbWFwcGluZ3NTdHJpbmcgPyBKU09OLnBhcnNlKG1hcHBpbmdzU3RyaW5nKSA6IHt9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiU2FsYWRVSTogRXJyb3IgcGFyc2luZyBldmVudCBtYXBwaW5nczpcIiwgZXJyb3IpO1xuICAgICAgdGhpcy5ldmVudE1hcHBpbmdzID0ge307XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgY29tcG9uZW50IGNvbmZpZ3VyYXRpb25cbiAgICogVGhpcyBtZXRob2Qgc2hvdWxkIHNldCB1cCB0aGUgY29tcG9uZW50Q29uZmlnIG9iamVjdCB3aXRoIHN0YXRlTWFjaGluZSwgZXZlbnRzLCBhbmQgYXJpYUNvbmZpZ1xuICAgKi9cbiAgaW5pdENvbmZpZygpIHtcbiAgICB0aGlzLmNvbXBvbmVudENvbmZpZyA9IHRoaXMuZ2V0Q29tcG9uZW50Q29uZmlnKCk7XG5cbiAgICAvLyBBZGQgZGVmYXVsdCBjb25maWdzIGlmIG5vdCBwcm92aWRlZFxuICAgIGlmICghdGhpcy5jb21wb25lbnRDb25maWcuc3RhdGVNYWNoaW5lKSB7XG4gICAgICB0aGlzLmNvbXBvbmVudENvbmZpZy5zdGF0ZU1hY2hpbmUgPSB7XG4gICAgICAgIGlkbGU6IHtcbiAgICAgICAgICBlbnRlcjogKCkgPT4ge30sXG4gICAgICAgICAgZXhpdDogKCkgPT4ge30sXG4gICAgICAgICAgdHJhbnNpdGlvbnM6IHt9LFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb21wb25lbnRDb25maWcuc3RhdGVNYWNoaW5lID0gdGhpcy5iaW5kU3RhdGVIYW5kbGVycyhcbiAgICAgICAgdGhpcy5jb21wb25lbnRDb25maWcuc3RhdGVNYWNoaW5lLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50Q29uZmlnID0gdGhpcy5jb21wb25lbnRDb25maWcuZXZlbnRzIHx8IHt9O1xuICAgIHRoaXMuaGlkZGVuQ29uZmlnID0gdGhpcy5jb21wb25lbnRDb25maWcuaGlkZGVuQ29uZmlnIHx8IHt9O1xuICAgIHRoaXMuYXJpYUNvbmZpZyA9IHRoaXMuY29tcG9uZW50Q29uZmlnLmFyaWFDb25maWcgfHwge307XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNvbXBvbmVudCBjb25maWd1cmF0aW9uXG4gICAqIE92ZXJyaWRlIGluIHN1YmNsYXNzZXMgdG8gcHJvdmlkZSBjb21wb25lbnQtc3BlY2lmaWMgY29uZmlndXJhdGlvblxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBDb25maWd1cmF0aW9uIG9iamVjdCB3aXRoIHN0YXRlTWFjaGluZSwgZXZlbnRzLCBhbmQgYXJpYUNvbmZpZ1xuICAgKi9cbiAgZ2V0Q29tcG9uZW50Q29uZmlnKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcImdldENvbXBvbmVudENvbmZpZygpIG11c3QgYmUgaW1wbGVtZW50ZWQgaW4gc3ViY2xhc3NcIik7XG4gIH1cblxuICBpbml0U3RhdGVNYWNoaW5lKHN0YXRlTWFjaGluZUNvbmZpZywgaW5pdGlhbFN0YXRlKSB7XG4gICAgdGhpcy5zdGF0ZU1hY2hpbmUgPSBuZXcgU3RhdGVNYWNoaW5lKHN0YXRlTWFjaGluZUNvbmZpZywgaW5pdGlhbFN0YXRlLCB7XG4gICAgICBvblN0YXRlQ2hhbmdlZDogdGhpcy5vblN0YXRlQ2hhbmdlZC5iaW5kKHRoaXMpLFxuICAgIH0pO1xuICB9XG5cbiAgLy8gSGFuZGxlIGNsaWVudCBjb21tYW5kc1xuICBvbkNsaWVudENvbW1hbmQoZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZyhldmVudCk7XG4gICAgY29uc3QgeyBjb21tYW5kLCBwYXJhbXMgfSA9IGV2ZW50LmRldGFpbDtcbiAgICBpZiAoY29tbWFuZCkge1xuICAgICAgdGhpcy5oYW5kbGVDb21tYW5kKGNvbW1hbmQsIHBhcmFtcyk7XG4gICAgfVxuICB9XG5cbiAgb25TdGF0ZUNoYW5nZWQocHJldlN0YXRlLCBuZXh0U3RhdGUsIHBhcmFtcykge1xuICAgIC8vIENoZWNrIGlmIHdlIHNob3VsZCBhbmltYXRlXG4gICAgY29uc3QgdHJhbnNpdGlvbk5hbWUgPSBgJHtwcmV2U3RhdGV9X3RvXyR7bmV4dFN0YXRlfWA7XG4gICAgY29uc3QgYW5pbUNvbmZpZyA9IHRoaXMub3B0aW9ucy5hbmltYXRpb25zPy5bdHJhbnNpdGlvbk5hbWVdO1xuICAgIHRoaXMudXBkYXRlVUkoKTtcblxuICAgIGlmICghYW5pbUNvbmZpZykge1xuICAgICAgLy8gTm8gYW5pbWF0aW9uLCB1cGRhdGUgdmlzaWJpbGl0eSBpbW1lZGlhdGVseVxuICAgICAgdGhpcy51cGRhdGVQYXJ0c1Zpc2liaWxpdHkobmV4dFN0YXRlKTtcbiAgICAgIHJldHVybiBudWxsOyAvLyBObyBwcm9taXNlXG4gICAgfVxuXG4gICAgLy8gR2V0IHRhcmdldCBlbGVtZW50IGZvciBhbmltYXRpb25cbiAgICBjb25zdCB0YXJnZXRFbGVtZW50ID0gYW5pbUNvbmZpZy50YXJnZXRfcGFydFxuICAgICAgPyB0aGlzLmdldFBhcnQoYW5pbUNvbmZpZy50YXJnZXRfcGFydClcbiAgICAgIDogdGhpcy5lbDtcblxuICAgIC8vIEFuaW1hdGUgd2l0aCB0aGUgY29uZmlnXG4gICAgcmV0dXJuIGFuaW1hdGVUcmFuc2l0aW9uKGFuaW1Db25maWcsIHRhcmdldEVsZW1lbnQpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVQYXJ0c1Zpc2liaWxpdHkobmV4dFN0YXRlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzIHRoZSBzdGF0ZSBtYWNoaW5lIGNvbmZpZ3VyYXRpb24gdG8gYXV0b21hdGljYWxseSBiaW5kIHN0cmluZyBtZXRob2QgcmVmZXJlbmNlc1xuICAgKiB0byBpbnN0YW5jZSBtZXRob2RzIGZvciBlbnRlciBhbmQgZXhpdCBoYW5kbGVyc1xuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gVGhlIG9yaWdpbmFsIHN0YXRlIG1hY2hpbmUgY29uZmlndXJhdGlvblxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIFRoZSBwcm9jZXNzZWQgY29uZmlndXJhdGlvbiB3aXRoIGJvdW5kIGVudGVyL2V4aXQgbWV0aG9kc1xuICAgKi9cbiAgYmluZFN0YXRlSGFuZGxlcnMoc3RhdGVNYWNoaW5lQ29uZmlnKSB7XG4gICAgLy8gUHJvY2VzcyBlYWNoIHN0YXRlXG4gICAgT2JqZWN0LmtleXMoc3RhdGVNYWNoaW5lQ29uZmlnKS5mb3JFYWNoKChzdGF0ZU5hbWUpID0+IHtcbiAgICAgIGNvbnN0IHN0YXRlQ29uZmlnID0gc3RhdGVNYWNoaW5lQ29uZmlnW3N0YXRlTmFtZV07XG5cbiAgICAgIFtcImVudGVyXCIsIFwiZXhpdFwiXS5mb3JFYWNoKChoYW5kbGVyTmFtZSkgPT4ge1xuICAgICAgICAvLyBQcm9jZXNzIGhhbmRsZXIgaWYgaXQncyBhIHN0cmluZ1xuICAgICAgICBpZiAodHlwZW9mIHN0YXRlQ29uZmlnW2hhbmRsZXJOYW1lXSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBzdGF0ZUNvbmZpZ1toYW5kbGVyTmFtZV07XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzW21ldGhvZE5hbWVdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHN0YXRlQ29uZmlnW2hhbmRsZXJOYW1lXSA9IHRoaXNbbWV0aG9kTmFtZV0uYmluZCh0aGlzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICBgTWV0aG9kICR7bWV0aG9kTmFtZX0gbm90IGZvdW5kIGZvciAke2hhbmRsZXJOYW1lfSBoYW5kbGVyIGluIHN0YXRlICR7c3RhdGVOYW1lfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3RhdGVNYWNoaW5lQ29uZmlnO1xuICB9XG5cbiAgc2V0dXBFdmVudHMoKSB7XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oYW5kbGVBY3Rpb25DbGljay5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuc2V0dXBLZXlFdmVudEhhbmRsZXJzKCk7XG4gICAgdGhpcy5zZXR1cE1vdXNlRXZlbnRIYW5kbGVycygpO1xuXG4gICAgdGhpcy5zZXR1cENvbXBvbmVudEV2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBjbGljayBldmVudHMgb24gYWN0aW9uIGVsZW1lbnRzXG4gICAqIFRyYW5zaXRpb24gd2l0aCB0aGUgYWN0aW9uIGF0dHJpYnV0ZSB2YWx1ZVxuICAgKi9cbiAgaGFuZGxlQWN0aW9uQ2xpY2soZXZlbnQpIHtcbiAgICBjb25zdCBhY3Rpb25FbGVtZW50ID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1hY3Rpb25dXCIpO1xuICAgIGlmICghYWN0aW9uRWxlbWVudCkgcmV0dXJuO1xuXG4gICAgY29uc3QgYWN0aW9uID0gYWN0aW9uRWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWFjdGlvblwiKTtcbiAgICB0aGlzLnRyYW5zaXRpb24oYWN0aW9uLCB7XG4gICAgICBvcmlnaW5hbEV2ZW50OiBldmVudCxcbiAgICAgIHRhcmdldDogYWN0aW9uRWxlbWVudCxcbiAgICB9KTtcbiAgfVxuXG4gIHNldHVwQ29tcG9uZW50RXZlbnRzKCkge1xuICAgIC8vIE92ZXJyaWRlIGluIGNvbXBvbmVudCBzdWJjbGFzc2VzXG4gIH1cblxuICAvKipcbiAgICogU2V0IHVwIGV2ZW50IGxpc3RlbmVycyBmb3IgbW91c2UgZXZlbnRzIGJhc2VkIG9uIHRoZSBjdXJyZW50IHN0YXRlXG4gICAqL1xuICBzZXR1cEtleUV2ZW50SGFuZGxlcnMoKSB7XG4gICAgT2JqZWN0LmtleXModGhpcy5ldmVudENvbmZpZykuZm9yRWFjaCgoc3RhdGVOYW1lKSA9PiB7XG4gICAgICBjb25zdCBzdGF0ZUV2ZW50cyA9IHRoaXMuZXZlbnRDb25maWdbc3RhdGVOYW1lXTtcbiAgICAgIGlmICghc3RhdGVFdmVudHMgfHwgIXN0YXRlRXZlbnRzLmtleU1hcCkgcmV0dXJuO1xuXG4gICAgICAvLyBDcmVhdGUgYSBib3VuZCBoYW5kbGVyIHRoYXQgd2lsbCBjaGVjayB0aGUgY3VycmVudCBzdGF0ZSBiZWZvcmUgZXhlY3V0aW5nXG4gICAgICBjb25zdCBib3VuZEhhbmRsZXIgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKHN0YXRlTmFtZSA9PSBcIl9hbGxcIiB8fCB0aGlzLnN0YXRlTWFjaGluZS5zdGF0ZSA9PT0gc3RhdGVOYW1lKSB7XG4gICAgICAgICAgY29uc3Qga2V5ID0gZXZlbnQua2V5O1xuICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IHN0YXRlRXZlbnRzLmtleU1hcFtrZXldO1xuXG4gICAgICAgICAgaWYgKGFjdGlvbikge1xuICAgICAgICAgICAgdGhpcy5leGVjdXRlSGFuZGxlcihhY3Rpb24sIGV2ZW50KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5wcmV2ZW50RGVmYXVsdEtleXMuaW5jbHVkZXMoa2V5KSkge1xuICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gR2V0IHRoZSB0YXJnZXQgZWxlbWVudCBmb3Iga2V5IGV2ZW50cywgaWYgbm90IHNwZWNpZmllZCwgdXNlIHRoZSByb290IGVsZW1lbnRcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmdldFBhcnQoc3RhdGVFdmVudHMua2V5RXZlbnRUYXJnZXQpIHx8IHRoaXMuZWw7XG5cbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgYm91bmRIYW5kbGVyKTtcbiAgICAgIHRoaXMua2V5RXZlbnRIYW5kbGVycy5zZXQoZWxlbWVudCwgYm91bmRIYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdXAgZXZlbnQgbGlzdGVuZXJzIGZvciBtb3VzZSBldmVudHMgYmFzZWQgb24gdGhlIGN1cnJlbnQgc3RhdGVcbiAgICovXG4gIHNldHVwTW91c2VFdmVudEhhbmRsZXJzKCkge1xuICAgIC8vIFByb2Nlc3MgYWxsIHN0YXRlcyBmb3IgdGhlaXIgbW91c2UgZXZlbnRzXG4gICAgT2JqZWN0LmtleXModGhpcy5ldmVudENvbmZpZykuZm9yRWFjaCgoc3RhdGVOYW1lKSA9PiB7XG4gICAgICBjb25zdCBzdGF0ZUV2ZW50cyA9IHRoaXMuZXZlbnRDb25maWdbc3RhdGVOYW1lXTtcbiAgICAgIGlmICghc3RhdGVFdmVudHMgfHwgIXN0YXRlRXZlbnRzLm1vdXNlTWFwKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IG1vdXNlTWFwID0gc3RhdGVFdmVudHMubW91c2VNYXA7XG5cbiAgICAgIC8vIEZvciBlYWNoIHBhcnQgaW4gdGhlIG1vdXNlTWFwXG4gICAgICBPYmplY3Qua2V5cyhtb3VzZU1hcCkuZm9yRWFjaCgocGFydE5hbWUpID0+IHtcbiAgICAgICAgLy8gR2V0IGFsbCBlbGVtZW50cyB3aXRoIHRoaXMgcGFydCBuYW1lXG4gICAgICAgIGNvbnN0IHBhcnRFbGVtZW50cyA9IHRoaXMuZ2V0QWxsUGFydHMocGFydE5hbWUpO1xuXG4gICAgICAgIGlmICghcGFydEVsZW1lbnRzLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIEZvciBlYWNoIGV2ZW50IHR5cGUgb24gdGhpcyBwYXJ0XG4gICAgICAgIE9iamVjdC5rZXlzKG1vdXNlTWFwW3BhcnROYW1lXSkuZm9yRWFjaCgoZXZlbnRUeXBlKSA9PiB7XG4gICAgICAgICAgY29uc3QgaGFuZGxlckFjdGlvbiA9IG1vdXNlTWFwW3BhcnROYW1lXVtldmVudFR5cGVdO1xuXG4gICAgICAgICAgLy8gQ3JlYXRlIGEgYm91bmQgaGFuZGxlciB0aGF0IHdpbGwgY2hlY2sgdGhlIGN1cnJlbnQgc3RhdGUgYmVmb3JlIGV4ZWN1dGluZ1xuICAgICAgICAgIGNvbnN0IGJvdW5kSGFuZGxlciA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgLy8gT25seSBleGVjdXRlIHRoZSBoYW5kbGVyIGlmIHdlJ3JlIGluIHRoZSBjb3JyZWN0IHN0YXRlXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50U3RhdGUgPSB0aGlzLnN0YXRlTWFjaGluZS5zdGF0ZTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50U3RhdGUgPT09IHN0YXRlTmFtZSkge1xuICAgICAgICAgICAgICB0aGlzLmV4ZWN1dGVIYW5kbGVyKGhhbmRsZXJBY3Rpb24sIGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gRm9yIGVhY2ggZWxlbWVudCB3aXRoIHRoaXMgcGFydFxuICAgICAgICAgIHBhcnRFbGVtZW50cy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXIgZGlyZWN0bHkgdG8gdGhlIHBhcnQgZWxlbWVudFxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgYm91bmRIYW5kbGVyKTtcblxuICAgICAgICAgICAgLy8gU3RvcmUgdGhlIGhhbmRsZXIgcmVmZXJlbmNlIGZvciByZW1vdmFsIGxhdGVyXG4gICAgICAgICAgICBpZiAoIXRoaXMucGFydE1vdXNlRXZlbnRIYW5kbGVycy5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5wYXJ0TW91c2VFdmVudEhhbmRsZXJzLnNldChlbGVtZW50LCBuZXcgTWFwKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50SGFuZGxlcnMgPSB0aGlzLnBhcnRNb3VzZUV2ZW50SGFuZGxlcnMuZ2V0KGVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKCFlbGVtZW50SGFuZGxlcnMuaGFzKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgICAgZWxlbWVudEhhbmRsZXJzLnNldChldmVudFR5cGUsIFtdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxlbWVudEhhbmRsZXJzLmdldChldmVudFR5cGUpLnB1c2goYm91bmRIYW5kbGVyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZUtleUV2ZW50SGFuZGxlcnMoKSB7XG4gICAgaWYgKHRoaXMua2V5RXZlbnRIYW5kbGVycykge1xuICAgICAgLy8gRm9yIGVhY2ggZWxlbWVudCB0aGF0IGhhcyBldmVudCBoYW5kbGVyc1xuICAgICAgdGhpcy5rZXlFdmVudEhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIsIGVsZW1lbnQpID0+IHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVyKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBDbGVhciB0aGUgbWFwIGZvciBmdXR1cmUgdXNlXG4gICAgICB0aGlzLmtleUV2ZW50SGFuZGxlcnMuY2xlYXIoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBhY3RpdmUgbW91c2UgZXZlbnQgbGlzdGVuZXJzXG4gICAqL1xuICByZW1vdmVNb3VzZUV2ZW50TGlzdGVuZXJzKCkge1xuICAgIGlmICh0aGlzLnBhcnRNb3VzZUV2ZW50SGFuZGxlcnMpIHtcbiAgICAgIC8vIEZvciBlYWNoIGVsZW1lbnQgdGhhdCBoYXMgZXZlbnQgaGFuZGxlcnNcbiAgICAgIHRoaXMucGFydE1vdXNlRXZlbnRIYW5kbGVycy5mb3JFYWNoKChldmVudEhhbmRsZXJzLCBlbGVtZW50KSA9PiB7XG4gICAgICAgIC8vIEZvciBlYWNoIGV2ZW50IHR5cGUgb24gdGhpcyBlbGVtZW50XG4gICAgICAgIGV2ZW50SGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcnMsIGV2ZW50VHlwZSkgPT4ge1xuICAgICAgICAgIC8vIFJlbW92ZSBhbGwgaGFuZGxlcnMgZm9yIHRoaXMgZXZlbnQgdHlwZVxuICAgICAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGhhbmRsZXIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBDbGVhciB0aGUgbWFwIGZvciBmdXR1cmUgdXNlXG4gICAgICB0aGlzLnBhcnRNb3VzZUV2ZW50SGFuZGxlcnMuY2xlYXIoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZSBhIGhhbmRsZXIgZnJvbSBhIG1vdXNlTWFwIG9yIGtleU1hcFxuICAgKi9cbiAgZXhlY3V0ZUhhbmRsZXIoaGFuZGxlciwgZXZlbnQsIHRhcmdldEVsZW1lbnQpIHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbaGFuZGxlcl0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aGlzW2hhbmRsZXJdKGV2ZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIGl0J3Mgbm90IGEgbWV0aG9kIG5hbWUsIHRyZWF0IGFzIHRyYW5zaXRpb25cbiAgICAgICAgdGhpcy50cmFuc2l0aW9uKGhhbmRsZXIsIHtcbiAgICAgICAgICBvcmlnaW5hbEV2ZW50OiBldmVudCxcbiAgICAgICAgICB0YXJnZXQ6IHRhcmdldEVsZW1lbnQsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2l0aW9uIHRvIGEgbmV3IHN0YXRlIC0gZGVsZWdhdGVzIHRvIHRoZSBzdGF0ZSBtYWNoaW5lXG4gICAqL1xuICB0cmFuc2l0aW9uKGV2ZW50LCBwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlTWFjaGluZS50cmFuc2l0aW9uKGV2ZW50LCBwYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBVSSB0byByZWZsZWN0IGN1cnJlbnQgc3RhdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIE9wdGlvbmFsIHBhcmFtZXRlcnMgZnJvbSBzdGF0ZSB0cmFuc2l0aW9uXG4gICAqL1xuICB1cGRhdGVVSShwYXJhbXMgPSB7fSkge1xuICAgIGNvbnNvbGUubG9nKFwiVXBkYXRpbmcgVUlcIiwgdGhpcy5zdGF0ZU1hY2hpbmUuc3RhdGUpO1xuICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9IHRoaXMuc3RhdGVNYWNoaW5lLnN0YXRlO1xuXG4gICAgLy8gVXBkYXRlIGRhdGEtc3RhdGUgYXR0cmlidXRlcyBvbiBhbGwgcGFydHMgYW5kIHJvb3QgZWxlbWVudFxuICAgIHRoaXMuYWxsUGFydHMuZm9yRWFjaCgoZWwpID0+IGVsLnNldEF0dHJpYnV0ZShcImRhdGEtc3RhdGVcIiwgY3VycmVudFN0YXRlKSk7XG4gICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIsIGN1cnJlbnRTdGF0ZSk7XG5cbiAgICAvLyBBcHBseSBBUklBIGF0dHJpYnV0ZXNcbiAgICB0aGlzLmFyaWFNYW5hZ2VyLmFwcGx5QXJpYUF0dHJpYnV0ZXMoY3VycmVudFN0YXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgcGFydCB2aXNpYmlsaXR5IGJhc2VkIG9uIGN1cnJlbnQgc3RhdGUgY29uZmlndXJhdGlvblxuICAgKi9cbiAgdXBkYXRlUGFydHNWaXNpYmlsaXR5KCkge1xuICAgIGNvbnNvbGUubG9nKFwiVXBkYXRpbmcgdmlzaWJpbGl0eVwiKTtcbiAgICBjb25zdCBjdXJyZW50U3RhdGUgPSB0aGlzLnN0YXRlTWFjaGluZS5zdGF0ZTtcbiAgICBjb25zdCBzdGF0ZVZpc2liaWxpdHkgPSB0aGlzLmhpZGRlbkNvbmZpZ1tjdXJyZW50U3RhdGVdO1xuICAgIGlmICghc3RhdGVWaXNpYmlsaXR5KSByZXR1cm47XG5cbiAgICBPYmplY3QuZW50cmllcyhzdGF0ZVZpc2liaWxpdHkpLmZvckVhY2goKFtwYXJ0TmFtZSwgaGlkZGVuXSkgPT4ge1xuICAgICAgY29uc3QgcGFydEVsZW1lbnRzID0gdGhpcy5nZXRBbGxQYXJ0cyhwYXJ0TmFtZSk7XG4gICAgICBwYXJ0RWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgIGVsZW1lbnQuaGlkZGVuID0gaGlkZGVuO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiU2V0dGluZyBoaWRkZW5cIiwgcGFydE5hbWUsIGhpZGRlbiwgRGF0ZS5ub3coKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0UGFydChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsUGFydHMuZmluZCgocGFydCkgPT4gcGFydC5kYXRhc2V0LnBhcnQgPT09IG5hbWUpO1xuICB9XG5cbiAgZ2V0QWxsUGFydHMobmFtZSkge1xuICAgIHJldHVybiB0aGlzLmFsbFBhcnRzLmZpbHRlcigocGFydCkgPT4gcGFydC5kYXRhc2V0LnBhcnQgPT09IG5hbWUpO1xuICB9XG5cbiAgZ2V0UGFydElkKHBhcnROYW1lKSB7XG4gICAgY29uc3QgcGFydCA9IHRoaXMuZ2V0UGFydChwYXJ0TmFtZSk7XG4gICAgaWYgKCFwYXJ0KSByZXR1cm4gbnVsbDtcblxuICAgIGlmICghcGFydC5pZCkge1xuICAgICAgcGFydC5pZCA9IGAke3RoaXMuZWwuaWR9LSR7cGFydE5hbWV9YDtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnQuaWQ7XG4gIH1cblxuICAvLyBQdXNoIGV2ZW50IHRvIHNlcnZlciAoZm9yIGZyYW1ld29ya3MgbGlrZSBQaG9lbml4IExpdmVWaWV3KVxuICBwdXNoRXZlbnQoY2xpZW50RXZlbnQsIHBheWxvYWQgPSB7fSwgY29udGV4dCkge1xuICAgIGlmICghdGhpcy5ob29rIHx8ICF0aGlzLmhvb2sucHVzaEV2ZW50VG8pIHJldHVybjtcblxuICAgIGNvbnN0IGV2ZW50SGFuZGxlciA9IHRoaXMuZXZlbnRNYXBwaW5nc1tjbGllbnRFdmVudF07XG4gICAgY29uc3QgZWwgPSBjb250ZXh0IHx8IHRoaXMuZWw7XG5cbiAgICBpZiAoZXZlbnRIYW5kbGVyKSB7XG4gICAgICBpZiAodHlwZW9mIGV2ZW50SGFuZGxlciA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBjb25zdCBmdWxsUGF5bG9hZCA9IHtcbiAgICAgICAgICAuLi5wYXlsb2FkLFxuICAgICAgICAgIGNvbXBvbmVudElkOiBlbC5pZCxcbiAgICAgICAgICBjb21wb25lbnQ6IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtY29tcG9uZW50XCIpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaG9vay5wdXNoRXZlbnRUbyh0aGlzLmVsLCBldmVudEhhbmRsZXIsIGZ1bGxQYXlsb2FkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaG9vay5saXZlU29ja2V0LmV4ZWNKUyh0aGlzLmVsLCBKU09OLnN0cmluZ2lmeShldmVudEhhbmRsZXIpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBHZXQgY3VycmVudCBzdGF0ZSBmcm9tIHN0YXRlIG1hY2hpbmVcbiAgZ2V0IHN0YXRlKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlTWFjaGluZS5zdGF0ZTtcbiAgfVxuXG4gIC8vIEdldCBwcmV2aW91cyBzdGF0ZSBmcm9tIHN0YXRlIG1hY2hpbmVcbiAgZ2V0IHByZXZpb3VzU3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGVNYWNoaW5lLnByZXZpb3VzU3RhdGU7XG4gIH1cblxuICAvLyBDbGVhbnVwIG1ldGhvZCB0byByZW1vdmUgZXZlbnQgbGlzdGVuZXJzIGFuZCByZWZlcmVuY2VzXG4gIGRlc3Ryb3koKSB7XG4gICAgLy8gTGlmZWN5Y2xlIGhvb2sgYmVmb3JlIGRlc3RydWN0aW9uXG4gICAgdGhpcy5iZWZvcmVEZXN0cm95KCk7XG5cbiAgICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2FsYWRfdWk6Y29tbWFuZFwiLCB0aGlzLm9uQ2xpZW50Q29tbWFuZCk7XG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oYW5kbGVBY3Rpb25DbGljayk7XG4gICAgdGhpcy5yZW1vdmVLZXlFdmVudEhhbmRsZXJzKCk7XG4gICAgdGhpcy5yZW1vdmVNb3VzZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgdGhpcy5hcmlhTWFuYWdlciA9IG51bGw7XG5cbiAgICAvLyBBbGxvdyBnYXJiYWdlIGNvbGxlY3Rpb25cbiAgICB0aGlzLnN0YXRlTWFjaGluZSA9IG51bGw7XG4gICAgdGhpcy5lbCA9IG51bGw7XG4gICAgdGhpcy5ob29rID0gbnVsbDtcbiAgICB0aGlzLm9wdGlvbnMgPSBudWxsO1xuICAgIHRoaXMuY29tcG9uZW50Q29uZmlnID0gbnVsbDtcbiAgfVxuXG4gIC8vIExpZmVjeWNsZSBob29rc1xuICBiZWZvcmVEZXN0cm95KCkge31cblxuICAvLyBBbGlhcyBmb3IgdHJhbnNpdGlvbigpXG4gIGhhbmRsZUNvbW1hbmQoY29tbWFuZCwgcGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2l0aW9uKGNvbW1hbmQsIHBhcmFtcyk7XG4gIH1cblxuICAvLyBBbGlhcyBmb3IgdHJhbnNpdGlvbigpXG4gIHRyaWdnZXIoZXZlbnQsIHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNpdGlvbihldmVudCwgcGFyYW1zKTtcbiAgfVxufVxuXG4vKipcbiAqIEFyaWFNYW5hZ2VyIGNsYXNzIGZvciBoYW5kbGluZyBhY2Nlc3NpYmlsaXR5IGF0dHJpYnV0ZXNcbiAqL1xuY2xhc3MgQXJpYU1hbmFnZXIge1xuICBjb25zdHJ1Y3Rvcihjb21wb25lbnQsIGFyaWFDb25maWcpIHtcbiAgICB0aGlzLmNvbXBvbmVudCA9IGNvbXBvbmVudDtcbiAgICB0aGlzLmFyaWFDb25maWcgPSBhcmlhQ29uZmlnIHx8IHt9O1xuICB9XG5cbiAgYXBwbHlBcmlhQXR0cmlidXRlcyhjdXJyZW50U3RhdGUpIHtcbiAgICBpZiAoIXRoaXMuYXJpYUNvbmZpZykgcmV0dXJuO1xuXG4gICAgT2JqZWN0LmVudHJpZXModGhpcy5hcmlhQ29uZmlnKS5mb3JFYWNoKChbcGFydE5hbWUsIHN0YXRlc10pID0+IHtcbiAgICAgIC8vIEdldCBhbGwgZWxlbWVudHMgd2l0aCB0aGlzIGRhdGEtcGFydCwgbm90IGp1c3QgdGhlIGZpcnN0IG9uZVxuICAgICAgY29uc3QgcGFydHMgPSB0aGlzLmNvbXBvbmVudC5nZXRBbGxQYXJ0cyhwYXJ0TmFtZSk7XG4gICAgICBpZiAoIXBhcnRzIHx8IHBhcnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgICAvLyBBcHBseSBhdHRyaWJ1dGVzIHRvIGFsbCBtYXRjaGluZyBlbGVtZW50c1xuICAgICAgcGFydHMuZm9yRWFjaCgocGFydCwgaW5kZXgpID0+IHtcbiAgICAgICAgLy8gU2V0IElEIGlmIG5vdCBhbHJlYWR5IGRlZmluZWRcbiAgICAgICAgaWYgKCFwYXJ0LmlkKSB7XG4gICAgICAgICAgcGFydC5pZCA9IGAke3RoaXMuY29tcG9uZW50LmVsLmlkfS0ke3BhcnROYW1lfSR7cGFydHMubGVuZ3RoID4gMSA/IGAtJHtpbmRleH1gIDogXCJcIn1gO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hcHBseUdsb2JhbEFyaWFBdHRyaWJ1dGVzKHBhcnQsIHN0YXRlcyk7XG4gICAgICAgIHRoaXMuYXBwbHlTdGF0ZVNwZWNpZmljQXJpYUF0dHJpYnV0ZXMocGFydCwgc3RhdGVzLCBjdXJyZW50U3RhdGUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBhcHBseUdsb2JhbEFyaWFBdHRyaWJ1dGVzKHBhcnQsIHN0YXRlcykge1xuICAgIGlmICghc3RhdGVzLmFsbCkgcmV0dXJuO1xuXG4gICAgT2JqZWN0LmVudHJpZXMoc3RhdGVzLmFsbCkuZm9yRWFjaCgoW2F0dHIsIHZhbHVlXSkgPT4ge1xuICAgICAgdGhpcy5hcHBseUFyaWFBdHRyaWJ1dGUocGFydCwgYXR0ciwgdmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgYXBwbHlTdGF0ZVNwZWNpZmljQXJpYUF0dHJpYnV0ZXMocGFydCwgc3RhdGVzLCBjdXJyZW50U3RhdGUpIHtcbiAgICBjb25zdCBzdGF0ZUNvbmZpZyA9IHN0YXRlc1tjdXJyZW50U3RhdGVdO1xuICAgIGlmICghc3RhdGVDb25maWcpIHJldHVybjtcblxuICAgIE9iamVjdC5lbnRyaWVzKHN0YXRlQ29uZmlnKS5mb3JFYWNoKChbYXR0ciwgdmFsdWVdKSA9PiB7XG4gICAgICB0aGlzLmFwcGx5QXJpYUF0dHJpYnV0ZShwYXJ0LCBhdHRyLCB2YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBhcHBseUFyaWFBdHRyaWJ1dGUocGFydCwgYXR0ciwgdmFsdWUpIHtcbiAgICBjb25zdCByZXNvbHZlZFZhbHVlID1cbiAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gdmFsdWUuY2FsbCh0aGlzLmNvbXBvbmVudCwgcGFydCkgOiB2YWx1ZTtcblxuICAgIGlmIChyZXNvbHZlZFZhbHVlID09PSBudWxsIHx8IHJlc29sdmVkVmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gICAgaWYgKGF0dHIgPT09IFwicm9sZVwiKSB7XG4gICAgICBwYXJ0LnNldEF0dHJpYnV0ZShcInJvbGVcIiwgcmVzb2x2ZWRWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnQuc2V0QXR0cmlidXRlKGBhcmlhLSR7YXR0cn1gLCByZXNvbHZlZFZhbHVlKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9uZW50O1xuIiwgIi8vIHNhbGFkdWkvY29yZS9mYWN0b3J5LmpzXG5jbGFzcyBDb21wb25lbnRSZWdpc3RyeSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucmVnaXN0cnkgPSBuZXcgTWFwKCk7XG4gIH1cblxuICByZWdpc3Rlcih0eXBlLCBDb21wb25lbnRDbGFzcykge1xuICAgIHRoaXMucmVnaXN0cnkuc2V0KHR5cGUsIENvbXBvbmVudENsYXNzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGNyZWF0ZSh0eXBlLCBlbCwgaG9va0NvbnRleHQpIHtcbiAgICBjb25zdCBDb21wb25lbnRDbGFzcyA9IHRoaXMucmVnaXN0cnkuZ2V0KHR5cGUpO1xuICAgIGlmICghQ29tcG9uZW50Q2xhc3MpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYENvbXBvbmVudCB0eXBlICcke3R5cGV9JyBub3QgcmVnaXN0ZXJlZGApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgQ29tcG9uZW50Q2xhc3MoZWwsIGhvb2tDb250ZXh0KTtcblxuICAgIC8vIENhbGwgc2V0dXBFdmVudHMgYWZ0ZXIgdGhlIGNvbXBvbmVudCBpcyBmdWxseSBpbml0aWFsaXplZFxuICAgIGluc3RhbmNlLnNldHVwRXZlbnRzKCk7XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cbn1cblxuY29uc3QgcmVnaXN0cnkgPSBuZXcgQ29tcG9uZW50UmVnaXN0cnkoKTtcblxuZXhwb3J0IHsgcmVnaXN0cnkgfTtcbiIsICIvLyBzYWxhZHVpL2NvcmUvaG9vay5qc1xuaW1wb3J0IHsgcmVnaXN0cnkgfSBmcm9tIFwiLi9mYWN0b3J5XCI7XG5cbmNvbnN0IFNhbGFkVUlIb29rID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMuaW5pdENvbXBvbmVudCgpO1xuICAgIHRoaXMuc2V0dXBTZXJ2ZXJFdmVudHMoKTtcbiAgfSxcblxuICBpbml0Q29tcG9uZW50KCkge1xuICAgIGNvbnN0IGVsID0gdGhpcy5lbDtcbiAgICBjb25zdCBjb21wb25lbnRUeXBlID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1jb21wb25lbnRcIik7XG5cbiAgICBpZiAoIWNvbXBvbmVudFR5cGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIFwiU2FsYWRVSTogQ29tcG9uZW50IGVsZW1lbnQgaXMgbWlzc2luZyBkYXRhLWNvbXBvbmVudCBhdHRyaWJ1dGVcIixcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVGhlIHJlZ2lzdHJ5LmNyZWF0ZSBtZXRob2Qgd2lsbCBoYW5kbGUgY3JlYXRpbmcgdGhlIGNvbXBvbmVudCBhbmQgY2FsbGluZyBzZXR1cEV2ZW50c1xuICAgIHRoaXMuY29tcG9uZW50ID0gcmVnaXN0cnkuY3JlYXRlKGNvbXBvbmVudFR5cGUsIGVsLCB0aGlzKTtcbiAgfSxcblxuICBzZXR1cFNlcnZlckV2ZW50cygpIHtcbiAgICBpZiAoIXRoaXMuY29tcG9uZW50KSByZXR1cm47XG5cbiAgICB0aGlzLmhhbmRsZUV2ZW50KFwic2FsYWR1aTpjb21tYW5kXCIsICh7IGNvbW1hbmQsIHBhcmFtcyA9IHt9LCB0YXJnZXQgfSkgPT4ge1xuICAgICAgaWYgKHRhcmdldCAmJiB0YXJnZXQgIT09IHRoaXMuZWwuaWQpIHJldHVybjtcblxuICAgICAgaWYgKHRoaXMuY29tcG9uZW50KSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50LmhhbmRsZUNvbW1hbmQoY29tbWFuZCwgcGFyYW1zKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICB1cGRhdGVkKCkge1xuICAgIGlmICh0aGlzLmNvbXBvbmVudCkge1xuICAgICAgdGhpcy5jb21wb25lbnQucGFyc2VPcHRpb25zKCk7XG4gICAgICB0aGlzLmNvbXBvbmVudC51cGRhdGVQYXJ0c1Zpc2liaWxpdHkoKTtcbiAgICAgIHRoaXMuY29tcG9uZW50LnVwZGF0ZVVJKCk7XG4gICAgfVxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICB0aGlzLmNvbXBvbmVudCA9IG51bGw7XG4gIH0sXG59O1xuXG5leHBvcnQgeyBTYWxhZFVJSG9vayB9O1xuIiwgIi8vIHNhbGFkdWkvaW5kZXguanNcbmltcG9ydCBDb21wb25lbnQgZnJvbSBcIi4vY29yZS9jb21wb25lbnRcIjtcbmltcG9ydCB7IHJlZ2lzdHJ5IH0gZnJvbSBcIi4vY29yZS9mYWN0b3J5XCI7XG5pbXBvcnQgeyBTYWxhZFVJSG9vayB9IGZyb20gXCIuL2NvcmUvaG9va1wiO1xuXG5mdW5jdGlvbiByZWdpc3Rlcih0eXBlLCBDb21wb25lbnRDbGFzcykge1xuICByZWdpc3RyeS5yZWdpc3Rlcih0eXBlLCBDb21wb25lbnRDbGFzcyk7XG59XG5cbmNvbnN0IFNhbGFkVUkgPSB7XG4gIENvbXBvbmVudCxcbiAgcmVnaXN0ZXIsXG4gIFNhbGFkVUlIb29rLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgU2FsYWRVSTtcbiIsICJpbXBvcnQgQ29tcG9uZW50IGZyb20gXCIuLi9jb3JlL2NvbXBvbmVudFwiO1xuaW1wb3J0IFNhbGFkVUkgZnJvbSBcIi4uXCI7XG5cbi8qKlxuICogQ29tbWFuZENvbXBvbmVudCBmb3IgU2FsYWRVSVxuICogSW1wbGVtZW50cyBmaWx0ZXJpbmcsIGtleWJvYXJkIG5hdmlnYXRpb24sIGFuZCBzZWxlY3Rpb24gZm9yIGEgY29tbWFuZCBwYWxldHRlL2xpc3QuXG4gKi9cbmNsYXNzIENvbW1hbmRDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICBjb25zdHJ1Y3RvcihlbCwgaG9va0NvbnRleHQpIHtcbiAgICBzdXBlcihlbCwgeyBob29rQ29udGV4dCwgaWdub3JlSXRlbXM6IGZhbHNlIH0pO1xuXG4gICAgLy8gU2V0IGRlZmF1bHQgZmllbGQgc3RhdGVcbiAgICB0aGlzLmN1cnJlbnRJdGVtSWR4ID0gMDtcblxuICAgIC8vIENvcmUgZWxlbWVudHNcbiAgICB0aGlzLmlucHV0ID0gdGhpcy5nZXRQYXJ0KFwiaW5wdXRcIik7XG4gICAgdGhpcy5saXN0ID0gdGhpcy5nZXRQYXJ0KFwibGlzdFwiKTtcbiAgICB0aGlzLmVtcHR5ID0gdGhpcy5nZXRQYXJ0KFwiZW1wdHlcIik7XG4gICAgdGhpcy5ncm91cHMgPSB0aGlzLmdldEFsbFBhcnRzKFwiZ3JvdXBcIik7XG4gICAgdGhpcy5pdGVtcyA9IHRoaXMuZ2V0QWxsUGFydHMoXCJpdGVtXCIpO1xuXG4gICAgLy8gQmluZCBldmVudCBoYW5kbGVyc1xuICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHRoaXMuaGFuZGxlU2VhcmNoKTtcblxuICAgIC8vIEluaXRpYWwgc2VhcmNoL2ZpbHRlclxuICAgIHRoaXMuaGFuZGxlU2VhcmNoKCk7XG5cbiAgICAvLyBQcmV2ZW50IGRlZmF1bHQgZm9yIG5hdmlnYXRpb24ga2V5c1xuICAgIHRoaXMuY29uZmlnLnByZXZlbnREZWZhdWx0S2V5cyA9IFtcIkVzY2FwZVwiLCBcIkFycm93RG93blwiLCBcIkFycm93VXBcIl07XG4gIH1cblxuICBnZXRDb21wb25lbnRDb25maWcoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXRlTWFjaGluZToge1xuICAgICAgICBpZGxlOiB7IHRyYW5zaXRpb25zOiB7fSB9LFxuICAgICAgfSxcbiAgICAgIGV2ZW50czoge1xuICAgICAgICBpZGxlOiB7XG4gICAgICAgICAga2V5TWFwOiB7XG4gICAgICAgICAgICBFbnRlcjogXCJzZWxlY3RJdGVtXCIsXG4gICAgICAgICAgICBBcnJvd0Rvd246IFwiZm9jdXNOZXh0SXRlbVwiLFxuICAgICAgICAgICAgQXJyb3dVcDogXCJmb2N1c1ByZXZJdGVtXCIsXG4gICAgICAgICAgICBFc2NhcGU6IFwiYmx1cklucHV0XCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIC8vIEZvY3VzIGl0ZW0gYnkgaW5kZXgsIHdyYXAgYXJvdW5kIGlmIG5lZWRlZFxuICBmb2N1c0l0ZW0oaW5kZXgpIHtcbiAgICBpZiAoIXRoaXMuc2VsZWN0YWJsZUl0ZW1zPy5sZW5ndGgpIHJldHVybjtcblxuICAgIC8vIFdyYXAgaW5kZXhcbiAgICBpZiAoaW5kZXggPCAwKSBpbmRleCA9IHRoaXMuc2VsZWN0YWJsZUl0ZW1zLmxlbmd0aCAtIDE7XG4gICAgaWYgKGluZGV4ID49IHRoaXMuc2VsZWN0YWJsZUl0ZW1zLmxlbmd0aCkgaW5kZXggPSAwO1xuXG4gICAgdGhpcy5jdXJyZW50SXRlbUlkeCA9IGluZGV4O1xuXG4gICAgLy8gRGVzZWxlY3QgYWxsXG4gICAgdGhpcy5pdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBpdGVtLnNldEF0dHJpYnV0ZShcImRhdGEtc2VsZWN0ZWRcIiwgXCJmYWxzZVwiKTtcbiAgICAgIGl0ZW0uc2V0QXR0cmlidXRlKFwiYXJpYS1zZWxlY3RlZFwiLCBcImZhbHNlXCIpO1xuICAgIH0pO1xuXG4gICAgLy8gU2VsZWN0IGN1cnJlbnRcbiAgICBjb25zdCBzZWxlY3RlZEl0ZW0gPSB0aGlzLnNlbGVjdGFibGVJdGVtc1tpbmRleF07XG4gICAgc2VsZWN0ZWRJdGVtLnNldEF0dHJpYnV0ZShcImRhdGEtc2VsZWN0ZWRcIiwgXCJ0cnVlXCIpO1xuICAgIHNlbGVjdGVkSXRlbS5zZXRBdHRyaWJ1dGUoXCJhcmlhLXNlbGVjdGVkXCIsIFwidHJ1ZVwiKTtcbiAgfVxuXG4gIGZvY3VzTmV4dEl0ZW0gPSAoKSA9PiB0aGlzLmZvY3VzSXRlbSh0aGlzLmN1cnJlbnRJdGVtSWR4ICsgMSk7XG4gIGZvY3VzUHJldkl0ZW0gPSAoKSA9PiB0aGlzLmZvY3VzSXRlbSh0aGlzLmN1cnJlbnRJdGVtSWR4IC0gMSk7XG5cbiAgYmx1cklucHV0ID0gKCkgPT4gdGhpcy5pbnB1dD8uYmx1cigpO1xuXG4gIHNlbGVjdEl0ZW0gPSAoKSA9PiB7XG4gICAgaWYgKHRoaXMuY3VycmVudEl0ZW1JZHggPT09IC0xKSByZXR1cm47XG4gICAgY29uc3QgaXRlbSA9IHRoaXMuc2VsZWN0YWJsZUl0ZW1zW3RoaXMuY3VycmVudEl0ZW1JZHhdO1xuICAgIGl0ZW0uY2xpY2soKTtcbiAgfTtcblxuICAvLyBIYW5kbGUgc2VhcmNoL2ZpbHRlcmluZ1xuICBoYW5kbGVTZWFyY2ggPSAoKSA9PiB7XG4gICAgY29uc3QgcXVlcnkgPSB0aGlzLmlucHV0LnZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgLy8gRmlsdGVyIGl0ZW1zXG4gICAgdGhpcy5pdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCB0ZXh0ID0gaXRlbS50ZXh0Q29udGVudC50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGNvbnN0IHZpc2libGUgPSBxdWVyeSA9PT0gXCJcIiB8fCB0ZXh0LmluY2x1ZGVzKHF1ZXJ5KTtcbiAgICAgIGl0ZW0uc2V0QXR0cmlidXRlKFwiZGF0YS12aXNpYmxlXCIsIHZpc2libGUgPyBcInRydWVcIiA6IFwiZmFsc2VcIik7XG4gICAgfSk7XG5cbiAgICB0aGlzLnZpc2libGVJdGVtcyA9IHRoaXMuaXRlbXMuZmlsdGVyKFxuICAgICAgKGVsKSA9PiBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXZpc2libGVcIikgPT09IFwidHJ1ZVwiLFxuICAgICk7XG5cbiAgICB0aGlzLnNlbGVjdGFibGVJdGVtcyA9IHRoaXMudmlzaWJsZUl0ZW1zLmZpbHRlcihcbiAgICAgIChlbCkgPT4gIWVsLmhhc0F0dHJpYnV0ZShcImRpc2FibGVkXCIpLFxuICAgICk7XG5cbiAgICB0aGlzLmdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xuICAgICAgY29uc3QgdmlzaWJsZU9wdGlvbnMgPSBncm91cC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtdmlzaWJsZT0ndHJ1ZSddXCIpO1xuICAgICAgZ3JvdXAuc2V0QXR0cmlidXRlKFxuICAgICAgICBcImRhdGEtdmlzaWJsZVwiLFxuICAgICAgICB2aXNpYmxlT3B0aW9ucy5sZW5ndGggPiAwID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIsXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgdGhpcy5mb2N1c0l0ZW0oMCk7XG5cbiAgICBjb25zdCBub0l0ZW1zID0gdGhpcy52aXNpYmxlSXRlbXMubGVuZ3RoID09PSAwO1xuXG4gICAgaWYgKG5vSXRlbXMpIHtcbiAgICAgIHRoaXMuZW1wdHkuc2V0QXR0cmlidXRlKFwiZGF0YS12aXNpYmxlXCIsIFwidHJ1ZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbXB0eS5zZXRBdHRyaWJ1dGUoXCJkYXRhLXZpc2libGVcIiwgXCJmYWxzZVwiKTtcbiAgICB9XG4gIH07XG5cbiAgYmVmb3JlRGVzdHJveSgpIHtcbiAgICB0aGlzLmlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB0aGlzLmhhbmRsZVNlYXJjaCk7XG4gIH1cbn1cblxuLy8gUmVnaXN0ZXIgdGhlIGNvbXBvbmVudFxuU2FsYWRVSS5yZWdpc3RlcihcImNvbW1hbmRcIiwgQ29tbWFuZENvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IENvbW1hbmRDb21wb25lbnQ7XG4iLCAiLy8gc2FsYWR1aS9jb3JlL3Bvc2l0aW9uZXIuanMgLSBVcGRhdGVkIHRvIHVzZSBmaXhlZCBwb3NpdGlvbmluZ1xuLyoqXG4gKiBDb3JlIFBvc2l0aW9uaW5nIHV0aWxpdHkgZm9yIFNhbGFkVUkgY29tcG9uZW50c1xuICogSGFuZGxlcyBwdXJlIHBvc2l0aW9uaW5nIGNhbGN1bGF0aW9ucyB3aXRob3V0IHNpZGUgZWZmZWN0c1xuICovXG5jbGFzcyBQb3NpdGlvbmVyIHtcbiAgLyoqXG4gICAqIENhbGN1bGF0ZSBwb3NpdGlvbiBmb3IgYW4gZWxlbWVudCByZWxhdGl2ZSB0byBhIHJlZmVyZW5jZSBlbGVtZW50XG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBUaGUgZWxlbWVudCB0byBwb3NpdGlvblxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSByZWZlcmVuY2UgLSBUaGUgcmVmZXJlbmNlIGVsZW1lbnQgdG8gcG9zaXRpb24gYWdhaW5zdFxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIFBvc2l0aW9uaW5nIG9wdGlvbnNcbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIGNvbXB1dGVkIHBvc2l0aW9uIGRhdGFcbiAgICovXG4gIHN0YXRpYyBjYWxjdWxhdGUoZWxlbWVudCwgcmVmZXJlbmNlLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7XG4gICAgICBwbGFjZW1lbnQgPSBcImJvdHRvbVwiLFxuICAgICAgYWxpZ25tZW50ID0gXCJjZW50ZXJcIixcbiAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmJvZHksXG4gICAgICBmbGlwID0gdHJ1ZSxcbiAgICAgIGFsaWduT2Zmc2V0ID0gMCxcbiAgICAgIHNpZGVPZmZzZXQgPSA4LFxuICAgIH0gPSBvcHRpb25zO1xuXG4gICAgLy8gR2V0IGVsZW1lbnQgYW5kIHJlZmVyZW5jZSByZWN0cyBmb3IgcG9zaXRpb25pbmdcbiAgICBjb25zdCByZWZlcmVuY2VSZWN0ID0gcmVmZXJlbmNlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGVsZW1lbnRSZWN0ID0ge1xuICAgICAgd2lkdGg6IGVsZW1lbnQub2Zmc2V0V2lkdGgsXG4gICAgICBoZWlnaHQ6IGVsZW1lbnQub2Zmc2V0SGVpZ2h0LFxuICAgIH07XG5cbiAgICAvLyBGaW5kIGNvbnRhaW5lciBib3VuZHNcbiAgICBsZXQgY29udGFpbmVyUmVjdDtcbiAgICBpZiAoY29udGFpbmVyID09PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICBjb250YWluZXJSZWN0ID0ge1xuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHJpZ2h0OiB3aW5kb3cuaW5uZXJXaWR0aCxcbiAgICAgICAgYm90dG9tOiB3aW5kb3cuaW5uZXJIZWlnaHQsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCxcbiAgICAgICAgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXJSZWN0ID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIH1cblxuICAgIC8vIENhbGN1bGF0ZSBpbml0aWFsIHBvc2l0aW9uXG4gICAgbGV0IHsgeCwgeSB9ID0gdGhpcy5nZXRCYXNlUG9zaXRpb24oXG4gICAgICBwbGFjZW1lbnQsXG4gICAgICBhbGlnbm1lbnQsXG4gICAgICBlbGVtZW50UmVjdCxcbiAgICAgIHJlZmVyZW5jZVJlY3QsXG4gICAgICBhbGlnbk9mZnNldCxcbiAgICAgIHNpZGVPZmZzZXQsXG4gICAgKTtcblxuICAgIC8vIEFwcGx5IGZsaXBwaW5nIGlmIG5lZWRlZFxuICAgIGxldCBhY3R1YWxQbGFjZW1lbnQgPSBwbGFjZW1lbnQ7XG4gICAgaWYgKGZsaXApIHtcbiAgICAgIGNvbnN0IGZsaXBwZWRQbGFjZW1lbnQgPSB0aGlzLmdldEZsaXBwZWRQbGFjZW1lbnQoXG4gICAgICAgIHBsYWNlbWVudCxcbiAgICAgICAgeyB4LCB5LCB3aWR0aDogZWxlbWVudFJlY3Qud2lkdGgsIGhlaWdodDogZWxlbWVudFJlY3QuaGVpZ2h0IH0sXG4gICAgICAgIGNvbnRhaW5lclJlY3QsXG4gICAgICApO1xuXG4gICAgICBpZiAoZmxpcHBlZFBsYWNlbWVudCAhPT0gcGxhY2VtZW50KSB7XG4gICAgICAgIGFjdHVhbFBsYWNlbWVudCA9IGZsaXBwZWRQbGFjZW1lbnQ7XG4gICAgICAgIGNvbnN0IGZsaXBwZWRQb3NpdGlvbiA9IHRoaXMuZ2V0QmFzZVBvc2l0aW9uKFxuICAgICAgICAgIGZsaXBwZWRQbGFjZW1lbnQsXG4gICAgICAgICAgYWxpZ25tZW50LFxuICAgICAgICAgIGVsZW1lbnRSZWN0LFxuICAgICAgICAgIHJlZmVyZW5jZVJlY3QsXG4gICAgICAgICAgYWxpZ25PZmZzZXQsXG4gICAgICAgICAgc2lkZU9mZnNldCxcbiAgICAgICAgKTtcbiAgICAgICAgeCA9IGZsaXBwZWRQb3NpdGlvbi54O1xuICAgICAgICB5ID0gZmxpcHBlZFBvc2l0aW9uLnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHgsXG4gICAgICB5LFxuICAgICAgcGxhY2VtZW50OiBhY3R1YWxQbGFjZW1lbnQsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSBwb3NpdGlvbiB0byBhbiBlbGVtZW50XG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBFbGVtZW50IHRvIHBvc2l0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gWCBjb29yZGluYXRlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gWSBjb29yZGluYXRlXG4gICAqL1xuICBzdGF0aWMgYXBwbHlQb3NpdGlvbihlbGVtZW50LCB4LCB5KSB7XG4gICAgZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiZml4ZWRcIjtcbiAgICAvLyBlbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHt4fXB4LCAke3l9cHgpYDtcbiAgICBlbGVtZW50LnN0eWxlLnRvcCA9IHkgKyBcInB4XCI7XG4gICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcbiAgICBlbGVtZW50LnN0eWxlLm1hcmdpbiA9IFwiMFwiOyAvLyBSZXNldCBtYXJnaW5zIHRvIGF2b2lkIHBvc2l0aW9uaW5nIGlzc3Vlc1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSBiYXNlIHBvc2l0aW9uIGJhc2VkIG9uIHBsYWNlbWVudCBhbmQgYWxpZ25tZW50XG4gICAqL1xuICBzdGF0aWMgZ2V0QmFzZVBvc2l0aW9uKFxuICAgIHBsYWNlbWVudCxcbiAgICBhbGlnbm1lbnQsXG4gICAgZWxlbWVudFJlY3QsXG4gICAgcmVmZXJlbmNlUmVjdCxcbiAgICBhbGlnbk9mZnNldCA9IDAsXG4gICAgc2lkZU9mZnNldCA9IDgsXG4gICkge1xuICAgIGxldCB4ID0gMDtcbiAgICBsZXQgeSA9IDA7XG5cbiAgICAvLyBQb3NpdGlvbiBiYXNlZCBvbiBwbGFjZW1lbnRcbiAgICBzd2l0Y2ggKHBsYWNlbWVudCkge1xuICAgICAgY2FzZSBcInRvcFwiOlxuICAgICAgICB5ID0gcmVmZXJlbmNlUmVjdC50b3AgLSBlbGVtZW50UmVjdC5oZWlnaHQgLSBzaWRlT2Zmc2V0O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJyaWdodFwiOlxuICAgICAgICB4ID0gcmVmZXJlbmNlUmVjdC5yaWdodCArIHNpZGVPZmZzZXQ7XG4gICAgICAgIHkgPSByZWZlcmVuY2VSZWN0LnRvcDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiYm90dG9tXCI6XG4gICAgICAgIHkgPSByZWZlcmVuY2VSZWN0LmJvdHRvbSArIHNpZGVPZmZzZXQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImxlZnRcIjpcbiAgICAgICAgeCA9IHJlZmVyZW5jZVJlY3QubGVmdCAtIGVsZW1lbnRSZWN0LndpZHRoIC0gc2lkZU9mZnNldDtcbiAgICAgICAgeSA9IHJlZmVyZW5jZVJlY3QudG9wO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBBZGp1c3QgYmFzZWQgb24gYWxpZ25tZW50XG4gICAgc3dpdGNoIChhbGlnbm1lbnQpIHtcbiAgICAgIGNhc2UgXCJzdGFydFwiOlxuICAgICAgICBpZiAocGxhY2VtZW50ID09PSBcInRvcFwiIHx8IHBsYWNlbWVudCA9PT0gXCJib3R0b21cIikge1xuICAgICAgICAgIHggPSByZWZlcmVuY2VSZWN0LmxlZnQgKyBhbGlnbk9mZnNldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB5ID0gcmVmZXJlbmNlUmVjdC50b3AgKyBhbGlnbk9mZnNldDtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJjZW50ZXJcIjpcbiAgICAgICAgaWYgKHBsYWNlbWVudCA9PT0gXCJ0b3BcIiB8fCBwbGFjZW1lbnQgPT09IFwiYm90dG9tXCIpIHtcbiAgICAgICAgICB4ID1cbiAgICAgICAgICAgIHJlZmVyZW5jZVJlY3QubGVmdCArXG4gICAgICAgICAgICByZWZlcmVuY2VSZWN0LndpZHRoIC8gMiAtXG4gICAgICAgICAgICBlbGVtZW50UmVjdC53aWR0aCAvIDIgK1xuICAgICAgICAgICAgYWxpZ25PZmZzZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeSA9XG4gICAgICAgICAgICByZWZlcmVuY2VSZWN0LnRvcCArXG4gICAgICAgICAgICByZWZlcmVuY2VSZWN0LmhlaWdodCAvIDIgLVxuICAgICAgICAgICAgZWxlbWVudFJlY3QuaGVpZ2h0IC8gMiArXG4gICAgICAgICAgICBhbGlnbk9mZnNldDtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgaWYgKHBsYWNlbWVudCA9PT0gXCJ0b3BcIiB8fCBwbGFjZW1lbnQgPT09IFwiYm90dG9tXCIpIHtcbiAgICAgICAgICB4ID0gcmVmZXJlbmNlUmVjdC5yaWdodCAtIGVsZW1lbnRSZWN0LndpZHRoICsgYWxpZ25PZmZzZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeSA9IHJlZmVyZW5jZVJlY3QuYm90dG9tIC0gZWxlbWVudFJlY3QuaGVpZ2h0ICsgYWxpZ25PZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgeCwgeSB9O1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSBpZiBwbGFjZW1lbnQgc2hvdWxkIGJlIGZsaXBwZWQgZHVlIHRvIGxhY2sgb2Ygc3BhY2VcbiAgICovXG4gIHN0YXRpYyBnZXRGbGlwcGVkUGxhY2VtZW50KHBsYWNlbWVudCwgZWxlbWVudENvb3JkcywgY29udGFpbmVyUmVjdCkge1xuICAgIGNvbnN0IHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9ID0gZWxlbWVudENvb3JkcztcblxuICAgIC8vIENoZWNrIGlmIGVsZW1lbnQgd291bGQgb3ZlcmZsb3cgY29udGFpbmVyXG4gICAgY29uc3Qgb3ZlcmZsb3dUb3AgPSB5IDwgY29udGFpbmVyUmVjdC50b3A7XG4gICAgY29uc3Qgb3ZlcmZsb3dSaWdodCA9IHggKyB3aWR0aCA+IGNvbnRhaW5lclJlY3QucmlnaHQ7XG4gICAgY29uc3Qgb3ZlcmZsb3dCb3R0b20gPSB5ICsgaGVpZ2h0ID4gY29udGFpbmVyUmVjdC5ib3R0b207XG4gICAgY29uc3Qgb3ZlcmZsb3dMZWZ0ID0geCA8IGNvbnRhaW5lclJlY3QubGVmdDtcblxuICAgIC8vIERldGVybWluZSBpZiB3ZSBuZWVkIHRvIGZsaXBcbiAgICBzd2l0Y2ggKHBsYWNlbWVudCkge1xuICAgICAgY2FzZSBcInRvcFwiOlxuICAgICAgICBpZiAob3ZlcmZsb3dUb3AgJiYgIW92ZXJmbG93Qm90dG9tKSB7XG4gICAgICAgICAgcmV0dXJuIFwiYm90dG9tXCI7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwicmlnaHRcIjpcbiAgICAgICAgaWYgKG92ZXJmbG93UmlnaHQgJiYgIW92ZXJmbG93TGVmdCkge1xuICAgICAgICAgIHJldHVybiBcImxlZnRcIjtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJib3R0b21cIjpcbiAgICAgICAgaWYgKG92ZXJmbG93Qm90dG9tICYmICFvdmVyZmxvd1RvcCkge1xuICAgICAgICAgIHJldHVybiBcInRvcFwiO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImxlZnRcIjpcbiAgICAgICAgaWYgKG92ZXJmbG93TGVmdCAmJiAhb3ZlcmZsb3dSaWdodCkge1xuICAgICAgICAgIHJldHVybiBcInJpZ2h0XCI7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBsYWNlbWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IG1ldGhvZCB0byBmaW5kIGFsbCBzY3JvbGxhYmxlIHBhcmVudCBlbGVtZW50c1xuICAgKi9cbiAgc3RhdGljIGZpbmRTY3JvbGxhYmxlUGFyZW50cyhlbGVtZW50KSB7XG4gICAgY29uc3Qgc2Nyb2xsYWJsZVBhcmVudHMgPSBbXTtcbiAgICBsZXQgY3VycmVudEVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgd2hpbGUgKGN1cnJlbnRFbGVtZW50ICYmIGN1cnJlbnRFbGVtZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGN1cnJlbnRFbGVtZW50KTtcbiAgICAgIGlmIChcbiAgICAgICAgc3R5bGUub3ZlcmZsb3cgPT09IFwiYXV0b1wiIHx8XG4gICAgICAgIHN0eWxlLm92ZXJmbG93ID09PSBcInNjcm9sbFwiIHx8XG4gICAgICAgIHN0eWxlLm92ZXJmbG93WCA9PT0gXCJhdXRvXCIgfHxcbiAgICAgICAgc3R5bGUub3ZlcmZsb3dYID09PSBcInNjcm9sbFwiIHx8XG4gICAgICAgIHN0eWxlLm92ZXJmbG93WSA9PT0gXCJhdXRvXCIgfHxcbiAgICAgICAgc3R5bGUub3ZlcmZsb3dZID09PSBcInNjcm9sbFwiXG4gICAgICApIHtcbiAgICAgICAgc2Nyb2xsYWJsZVBhcmVudHMucHVzaChjdXJyZW50RWxlbWVudCk7XG4gICAgICB9XG4gICAgICBjdXJyZW50RWxlbWVudCA9IGN1cnJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLy8gQWx3YXlzIGluY2x1ZGUgd2luZG93IGZvciBnbG9iYWwgc2Nyb2xsaW5nXG4gICAgc2Nyb2xsYWJsZVBhcmVudHMucHVzaCh3aW5kb3cpO1xuXG4gICAgcmV0dXJuIHNjcm9sbGFibGVQYXJlbnRzO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBvc2l0aW9uZXI7XG4iLCAiLy8gc2FsYWR1aS9jb3JlL2ZvY3VzLXRyYXAuanNcbi8qKlxuICogRm9jdXNUcmFwIHV0aWxpdHkgZm9yIFNhbGFkVUkgY29tcG9uZW50c1xuICogTWFuYWdlcyBmb2N1cyBiZWhhdmlvciBmb3IgbW9kYWxzLCBwb3BvdmVycywgYW5kIHNpbWlsYXIgY29tcG9uZW50c1xuICovXG5jbGFzcyBGb2N1c1RyYXAge1xuICAvKipcbiAgICogQ3JlYXRlIGEgZm9jdXMgdHJhcCBmb3IgYSBzcGVjaWZpYyBlbGVtZW50XG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBUaGUgZWxlbWVudCB0byB0cmFwIGZvY3VzIHdpdGhpblxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIEZvY3VzIHRyYXAgb3B0aW9uc1xuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICBmb2N1c2FibGVTZWxlY3RvcjpcbiAgICAgICAgJ2FbaHJlZl0sIGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksIGlucHV0Om5vdChbZGlzYWJsZWRdKSwgc2VsZWN0Om5vdChbZGlzYWJsZWRdKSwgdGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pLCBbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XCItMVwiXSknLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9O1xuXG4gICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZCA9IG51bGw7XG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcblxuICAgIC8vIEJpbmQgbWV0aG9kcyB0aGF0IHdpbGwgYmUgdXNlZCBhcyBldmVudCBoYW5kbGVyc1xuICAgIHRoaXMuaGFuZGxlS2V5RG93biA9IHRoaXMuaGFuZGxlS2V5RG93bi5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlIHRoZSBmb2N1cyB0cmFwXG4gICAqL1xuICBhY3RpdmF0ZSgpIHtcbiAgICBpZiAodGhpcy5hY3RpdmUpIHJldHVybjtcblxuICAgIC8vIFN0b3JlIGN1cnJlbnRseSBmb2N1c2VkIGVsZW1lbnQgdG8gcmVzdG9yZSBsYXRlclxuICAgIHRoaXMucHJldmlvdXNseUZvY3VzZWQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcblxuICAgIC8vIFNldCB1cCBldmVudCBsaXN0ZW5lciBmb3Iga2V5Ym9hcmQgbmF2aWdhdGlvblxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmhhbmRsZUtleURvd24pO1xuXG4gICAgLy8gRm9jdXMgdGhlIGZpcnN0IGZvY3VzYWJsZSBlbGVtZW50IG9yIHRoZSBlbGVtZW50IGl0c2VsZlxuICAgIHRoaXMuc2V0SW5pdGlhbEZvY3VzKCk7XG4gIH1cblxuICAvKipcbiAgICogRGVhY3RpdmF0ZSB0aGUgZm9jdXMgdHJhcCBhbmQgcmVzdG9yZSBwcmV2aW91cyBmb2N1c1xuICAgKi9cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAoIXRoaXMuYWN0aXZlKSByZXR1cm47XG5cbiAgICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuaGFuZGxlS2V5RG93bik7XG5cbiAgICAvLyBSZXN0b3JlIGZvY3VzIGlmIHBvc3NpYmxlXG4gICAgaWYgKFxuICAgICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZCAmJlxuICAgICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZC5mb2N1cyAmJlxuICAgICAgdGhpcy5pc0VsZW1lbnRJblZpZXdwb3J0KHRoaXMucHJldmlvdXNseUZvY3VzZWQpXG4gICAgKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZC5mb2N1cygpO1xuICAgICAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkID0gbnVsbDtcbiAgICAgIH0sIDApO1xuICAgIH1cblxuICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGluaXRpYWwgZm9jdXMgd2hlbiB0cmFwIGlzIGFjdGl2YXRlZFxuICAgKi9cbiAgc2V0SW5pdGlhbEZvY3VzKCkge1xuICAgIC8vIEZpbmQgYWxsIGZvY3VzYWJsZSBlbGVtZW50c1xuICAgIGNvbnN0IGZvY3VzYWJsZUVsZW1lbnRzID0gdGhpcy5nZXRGb2N1c2FibGVFbGVtZW50cygpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAoZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBMb29rIGZvciBhbiBlbGVtZW50IHdpdGggYXV0b2ZvY3VzIGF0dHJpYnV0ZSBmaXJzdFxuICAgICAgICBjb25zdCBhdXRvRm9jdXNFbCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiW2F1dG9mb2N1c11cIik7XG4gICAgICAgIGNvbnN0IGluaXRpYWxGb2N1c0VsID0gYXV0b0ZvY3VzRWwgfHwgZm9jdXNhYmxlRWxlbWVudHNbMF07XG4gICAgICAgIGluaXRpYWxGb2N1c0VsLmZvY3VzKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiBubyBmb2N1c2FibGUgZWxlbWVudHMsIG1ha2UgdGhlIGVsZW1lbnQgaXRzZWxmIGZvY3VzYWJsZVxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCItMVwiKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSwgNTApOyAvLyBTbWFsbCBkZWxheSB0byBlbnN1cmUgRE9NIGlzIHJlYWR5XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGtleWRvd24gZXZlbnRzIGZvciB0YWIgdHJhcHBpbmcgYW5kIGVzY2FwZSBoYW5kbGluZ1xuICAgKi9cbiAgaGFuZGxlS2V5RG93bihldmVudCkge1xuICAgIC8vIEhhbmRsZSBUYWIga2V5IGZvciBmb2N1cyB0cmFwcGluZ1xuICAgIGlmIChldmVudC5rZXkgPT09IFwiVGFiXCIpIHtcbiAgICAgIGNvbnN0IGZvY3VzYWJsZUVsZW1lbnRzID0gdGhpcy5nZXRGb2N1c2FibGVFbGVtZW50cygpO1xuXG4gICAgICBpZiAoZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGZpcnN0RWxlbWVudCA9IGZvY3VzYWJsZUVsZW1lbnRzWzBdO1xuICAgICAgY29uc3QgbGFzdEVsZW1lbnQgPSBmb2N1c2FibGVFbGVtZW50c1tmb2N1c2FibGVFbGVtZW50cy5sZW5ndGggLSAxXTtcbiAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXG4gICAgICAvLyBDcmVhdGUgZm9jdXMgbG9vcFxuICAgICAgaWYgKCFldmVudC5zaGlmdEtleSAmJiBhY3RpdmVFbGVtZW50ID09PSBsYXN0RWxlbWVudCkge1xuICAgICAgICBmaXJzdEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH0gZWxzZSBpZiAoZXZlbnQuc2hpZnRLZXkgJiYgYWN0aXZlRWxlbWVudCA9PT0gZmlyc3RFbGVtZW50KSB7XG4gICAgICAgIGxhc3RFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiB0aGUgdHJhcFxuICAgKi9cbiAgZ2V0Rm9jdXNhYmxlRWxlbWVudHMoKSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oXG4gICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdGlvbnMuZm9jdXNhYmxlU2VsZWN0b3IpLFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYW4gZWxlbWVudCBpcyBjdXJyZW50bHkgdmlzaWJsZSBpbiB0aGUgdmlld3BvcnRcbiAgICovXG4gIGlzRWxlbWVudEluVmlld3BvcnQoZWxlbWVudCkge1xuICAgIGlmICghZWxlbWVudCB8fCAhZG9jdW1lbnQuYm9keS5jb250YWlucyhlbGVtZW50KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIHJlY3QudG9wID49IDAgJiZcbiAgICAgIHJlY3QubGVmdCA+PSAwICYmXG4gICAgICByZWN0LmJvdHRvbSA8PVxuICAgICAgICAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpICYmXG4gICAgICByZWN0LnJpZ2h0IDw9ICh3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhbiB1cCBhbGwgcmVmZXJlbmNlcyB3aGVuIG5vIGxvbmdlciBuZWVkZWRcbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLm9wdGlvbnMgPSBudWxsO1xuICAgIHRoaXMucHJldmlvdXNseUZvY3VzZWQgPSBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZvY3VzVHJhcDtcbiIsICIvLyBzYWxhZHVpL2NvcmUvY2xpY2stb3V0c2lkZS5qc1xuLyoqXG4gKiBDbGlja091dHNpZGVNb25pdG9yIHV0aWxpdHkgZm9yIFNhbGFkVUkgY29tcG9uZW50c1xuICogRGV0ZWN0cyBjbGlja3Mgb3V0c2lkZSBvZiBzcGVjaWZpZWQgZWxlbWVudHMgYW5kIHRyaWdnZXJzIGEgY2FsbGJhY2tcbiAqL1xuY2xhc3MgQ2xpY2tPdXRzaWRlTW9uaXRvciB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBjbGljayBvdXRzaWRlIG1vbml0b3JcbiAgICpcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxIVE1MRWxlbWVudFtdfSBlbGVtZW50cyAtIEVsZW1lbnQocykgdG8gbW9uaXRvciBjbGlja3Mgb3V0c2lkZSBvZlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBjbGljayBvdXRzaWRlIGlzIGRldGVjdGVkXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gQWRkaXRpb25hbCBvcHRpb25zXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50cywgY2FsbGJhY2ssIG9wdGlvbnMgPSB7fSkge1xuICAgIC8vIE5vcm1hbGl6ZSBlbGVtZW50cyB0byBhbiBhcnJheVxuICAgIHRoaXMuZWxlbWVudHMgPSBBcnJheS5pc0FycmF5KGVsZW1lbnRzKSA/IGVsZW1lbnRzIDogW2VsZW1lbnRzXTtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgLy8gV2hldGhlciB0byBhbHNvIG1vbml0b3IgdG91Y2hlbmQgZXZlbnRzIChmb3IgbW9iaWxlKVxuICAgICAgdHJhY2tUb3VjaDogdHJ1ZSxcbiAgICAgIC8vIE9wdGlvbmFsIGZpbHRlciBmdW5jdGlvbiB0byBkZXRlcm1pbmUgaWYgYSBjbGljayBzaG91bGQgdHJpZ2dlciB0aGUgY2FsbGJhY2tcbiAgICAgIGZpbHRlcjogbnVsbCxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfTtcblxuICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG5cbiAgICAvLyBCaW5kIG1ldGhvZHMgdG8gbWFpbnRhaW4gY29ycmVjdCB0aGlzIGNvbnRleHRcbiAgICB0aGlzLmhhbmRsZUNsaWNrID0gdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpO1xuICAgIHRoaXMuaGFuZGxlVG91Y2hFbmQgPSB0aGlzLmhhbmRsZVRvdWNoRW5kLmJpbmQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgbW9uaXRvcmluZyBjbGlja3Mgb3V0c2lkZSB0aGUgZWxlbWVudChzKVxuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSByZXR1cm47XG5cbiAgICAvLyBBZGQgZG9jdW1lbnQtbGV2ZWwgZXZlbnQgbGlzdGVuZXJzXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuaGFuZGxlQ2xpY2spO1xuICAgIGlmICh0aGlzLm9wdGlvbnMudHJhY2tUb3VjaCkge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsIHRoaXMuaGFuZGxlVG91Y2hFbmQpO1xuICAgIH1cblxuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIG1vbml0b3JpbmcgY2xpY2tzXG4gICAqL1xuICBzdG9wKCkge1xuICAgIGlmICghdGhpcy5hY3RpdmUpIHJldHVybjtcblxuICAgIC8vIFJlbW92ZSBkb2N1bWVudC1sZXZlbCBldmVudCBsaXN0ZW5lcnNcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oYW5kbGVDbGljayk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy50cmFja1RvdWNoKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgdGhpcy5oYW5kbGVUb3VjaEVuZCk7XG4gICAgfVxuXG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgY2xpY2sgZXZlbnRzXG4gICAqL1xuICBoYW5kbGVDbGljayhldmVudCkge1xuICAgIHRoaXMuY2hlY2tPdXRzaWRlQ2xpY2soZXZlbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSB0b3VjaGVuZCBldmVudHNcbiAgICovXG4gIGhhbmRsZVRvdWNoRW5kKGV2ZW50KSB7XG4gICAgdGhpcy5jaGVja091dHNpZGVDbGljayhldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgY2xpY2svdG91Y2ggd2FzIG91dHNpZGUgbW9uaXRvcmVkIGVsZW1lbnRzXG4gICAqL1xuICBjaGVja091dHNpZGVDbGljayhldmVudCkge1xuICAgIC8vIFNraXAgaWYgbm90IGFjdGl2ZSBvciBubyBjYWxsYmFja1xuICAgIGlmICghdGhpcy5hY3RpdmUgfHwgIXRoaXMuY2FsbGJhY2spIHJldHVybjtcblxuICAgIC8vIEFwcGx5IGN1c3RvbSBmaWx0ZXIgaWYgcHJvdmlkZWRcbiAgICBpZiAodGhpcy5vcHRpb25zLmZpbHRlciAmJiAhdGhpcy5vcHRpb25zLmZpbHRlcihldmVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIGV2ZW50IHRhcmdldFxuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcblxuICAgIC8vIENoZWNrIGlmIGNsaWNrIHdhcyBvdXRzaWRlIGFsbCBtb25pdG9yZWQgZWxlbWVudHNcbiAgICBjb25zdCBpc091dHNpZGUgPSAhdGhpcy5lbGVtZW50cy5zb21lKChlbGVtZW50KSA9PiB7XG4gICAgICByZXR1cm4gZWxlbWVudCAmJiAoZWxlbWVudCA9PT0gdGFyZ2V0IHx8IGVsZW1lbnQuY29udGFpbnModGFyZ2V0KSk7XG4gICAgfSk7XG5cbiAgICAvLyBJZiBjbGljayB3YXMgb3V0c2lkZSwgY2FsbCB0aGUgY2FsbGJhY2tcbiAgICBpZiAoaXNPdXRzaWRlKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBtb25pdG9yZWQgZWxlbWVudHNcbiAgICovXG4gIHVwZGF0ZUVsZW1lbnRzKGVsZW1lbnRzKSB7XG4gICAgdGhpcy5lbGVtZW50cyA9IEFycmF5LmlzQXJyYXkoZWxlbWVudHMpID8gZWxlbWVudHMgOiBbZWxlbWVudHNdO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFuIHVwIGFsbCByZWZlcmVuY2VzXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuc3RvcCgpO1xuICAgIHRoaXMuZWxlbWVudHMgPSBudWxsO1xuICAgIHRoaXMuY2FsbGJhY2sgPSBudWxsO1xuICAgIHRoaXMub3B0aW9ucyA9IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2xpY2tPdXRzaWRlTW9uaXRvcjtcbiIsICIvLyBzYWxhZHVpL2NvcmUvcG9ydGFsLmpzXG4vKipcbiAqIFBvcnRhbCB1dGlsaXR5IGZvciBTYWxhZFVJIGNvbXBvbmVudHNcbiAqIE1hbmFnZXMgbW92aW5nIGVsZW1lbnRzIHRvIGEgZGlmZmVyZW50IERPTSBjb250ZXh0ICh1c3VhbGx5IGJvZHkpXG4gKiB0byBhdm9pZCB6LWluZGV4IGFuZCBvdmVyZmxvdyBpc3N1ZXNcbiAqL1xuY2xhc3MgUG9ydGFsIHtcbiAgLy8gU3RhdGljIHN0b3JhZ2UgZm9yIGVsZW1lbnQgbWV0YWRhdGFcbiAgc3RhdGljIHBvcnRhbFJlZ2lzdHJ5ID0gbmV3IFdlYWtNYXAoKTtcblxuICAvKipcbiAgICogTW92ZSBhbiBlbGVtZW50IHRvIGEgcG9ydGFsIGNvbnRhaW5lclxuICAgKlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IC0gRWxlbWVudCB0byBtb3ZlIHRvIHRoZSBwb3J0YWxcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIC0gQ29udGFpbmVyIHRvIG1vdmUgdGhlIGVsZW1lbnQgdG8gKGRlZmF1bHQ6IGRvY3VtZW50LmJvZHkpXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBTdWNjZXNzIHN0YXR1c1xuICAgKi9cbiAgc3RhdGljIG1vdmUoZWxlbWVudCwgY29udGFpbmVyID0gZG9jdW1lbnQuYm9keSkge1xuICAgIGlmICghZWxlbWVudCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gU3RvcmUgb3JpZ2luYWwgaW5mb3JtYXRpb24gZm9yIHJlc3RvcmF0aW9uXG4gICAgY29uc3Qgb3JpZ2luYWxEYXRhID0ge1xuICAgICAgcGFyZW50OiBlbGVtZW50LnBhcmVudEVsZW1lbnQsXG4gICAgICBzdHlsZXM6IHtcbiAgICAgICAgcG9zaXRpb246IGVsZW1lbnQuc3R5bGUucG9zaXRpb24sXG4gICAgICAgIHRvcDogZWxlbWVudC5zdHlsZS50b3AsXG4gICAgICAgIGxlZnQ6IGVsZW1lbnQuc3R5bGUubGVmdCxcbiAgICAgICAgekluZGV4OiBlbGVtZW50LnN0eWxlLnpJbmRleCxcbiAgICAgICAgbWFyZ2luOiBlbGVtZW50LnN0eWxlLm1hcmdpbixcbiAgICAgICAgdHJhbnNmb3JtOiBlbGVtZW50LnN0eWxlLnRyYW5zZm9ybSxcbiAgICAgICAgcG9pbnRlckV2ZW50czogZWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzLFxuICAgICAgfSxcbiAgICAgIGluUG9ydGFsOiB0cnVlLFxuICAgIH07XG5cbiAgICAvLyBTdG9yZSB0aGUgbWV0YWRhdGEgaW4gb3VyIHJlZ2lzdHJ5XG4gICAgdGhpcy5wb3J0YWxSZWdpc3RyeS5zZXQoZWxlbWVudCwgb3JpZ2luYWxEYXRhKTtcblxuICAgIC8vIE1vdmUgdGhlIGVsZW1lbnQgdG8gdGhlIHBvcnRhbCBjb250YWluZXJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG5cbiAgICAvLyBBcHBseSBwb3J0YWwgc3R5bGVzXG4gICAgZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IFwiOTk5OVwiO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVzdG9yZSBhbiBlbGVtZW50IGZyb20gcG9ydGFsIHRvIGl0cyBvcmlnaW5hbCBwb3NpdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IC0gRWxlbWVudCB0byByZXN0b3JlXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBTdWNjZXNzIHN0YXR1c1xuICAgKi9cbiAgc3RhdGljIHJlc3RvcmUoZWxlbWVudCkge1xuICAgIGlmICghZWxlbWVudCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gR2V0IHRoZSBvcmlnaW5hbCBkYXRhIGZyb20gb3VyIHJlZ2lzdHJ5XG4gICAgY29uc3Qgb3JpZ2luYWxEYXRhID0gdGhpcy5wb3J0YWxSZWdpc3RyeS5nZXQoZWxlbWVudCk7XG5cbiAgICBpZiAoIW9yaWdpbmFsRGF0YSB8fCAhb3JpZ2luYWxEYXRhLnBhcmVudCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAvLyBNb3ZlIGJhY2sgdG8gb3JpZ2luYWwgcGFyZW50XG4gICAgICBvcmlnaW5hbERhdGEucGFyZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuXG4gICAgICAvLyBSZXN0b3JlIG9yaWdpbmFsIHN0eWxlc1xuICAgICAgY29uc3Qgc3R5bGVzID0gb3JpZ2luYWxEYXRhLnN0eWxlcztcbiAgICAgIGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSBzdHlsZXMucG9zaXRpb24gfHwgXCJcIjtcbiAgICAgIGVsZW1lbnQuc3R5bGUudG9wID0gc3R5bGVzLnRvcCB8fCBcIlwiO1xuICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gc3R5bGVzLmxlZnQgfHwgXCJcIjtcbiAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gc3R5bGVzLnpJbmRleCB8fCBcIlwiO1xuICAgICAgZWxlbWVudC5zdHlsZS5tYXJnaW4gPSBzdHlsZXMubWFyZ2luIHx8IFwiXCI7XG4gICAgICBlbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IHN0eWxlcy50cmFuc2Zvcm0gfHwgXCJcIjtcbiAgICAgIGVsZW1lbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9IHN0eWxlcy5wb2ludGVyRXZlbnRzIHx8IFwiXCI7XG5cbiAgICAgIC8vIFVwZGF0ZSBwb3J0YWwgc3RhdGVcbiAgICAgIG9yaWdpbmFsRGF0YS5pblBvcnRhbCA9IGZhbHNlO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS53YXJuKFwiU2FsYWRVSSBQb3J0YWw6IEZhaWxlZCB0byByZXN0b3JlIGVsZW1lbnRcIiwgZXJyb3IpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhbiBlbGVtZW50IGlzIGN1cnJlbnRseSBpbiBhIHBvcnRhbFxuICAgKlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IC0gRWxlbWVudCB0byBjaGVja1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciB0aGUgZWxlbWVudCBpcyBpbiBhIHBvcnRhbFxuICAgKi9cbiAgc3RhdGljIGlzSW5Qb3J0YWwoZWxlbWVudCkge1xuICAgIGlmICghZWxlbWVudCkgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLnBvcnRhbFJlZ2lzdHJ5LmdldChlbGVtZW50KTtcbiAgICByZXR1cm4gZGF0YT8uaW5Qb3J0YWwgPT09IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogU2V0dXAgc2Nyb2xsIGV2ZW50IHBhc3N0aHJvdWdoIGZvciBhIHBvcnRhbCBlbGVtZW50XG4gICAqIE1ha2VzIHRoZSBwb3J0YWwgZWxlbWVudCB0cmFuc3BhcmVudCB0byBwb2ludGVyIGV2ZW50cyBleGNlcHQgZm9yIGludGVyYWN0aXZlIGVsZW1lbnRzXG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBQb3J0YWwgZWxlbWVudCB0byBzZXQgdXAgc2Nyb2xsIHBhc3N0aHJvdWdoIGZvclxuICAgKi9cbiAgc3RhdGljIHNldHVwU2Nyb2xsUGFzc3Rocm91Z2goZWxlbWVudCkge1xuICAgIGlmICghZWxlbWVudCkgcmV0dXJuO1xuXG4gICAgLy8gR2V0IG9yaWdpbmFsIGRhdGEgZnJvbSByZWdpc3RyeSB0byBlbnN1cmUgc3R5bGVzIGFyZSBwcm9wZXJseSB0cmFja2VkXG4gICAgY29uc3Qgb3JpZ2luYWxEYXRhID0gdGhpcy5wb3J0YWxSZWdpc3RyeS5nZXQoZWxlbWVudCk7XG4gICAgaWYgKG9yaWdpbmFsRGF0YSkge1xuICAgICAgb3JpZ2luYWxEYXRhLnN0eWxlcy5wb2ludGVyRXZlbnRzID0gZWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzO1xuICAgIH1cblxuICAgIC8vIE1ha2UgdGhlIHBvcnRhbCBlbGVtZW50IHRyYW5zcGFyZW50IHRvIHBvaW50ZXIgZXZlbnRzXG4gICAgZWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJub25lXCI7XG5cbiAgICBQb3J0YWwudXBkYXRlU2Nyb2xsYWJsZUNvbnRhaW5lcihlbGVtZW50LCBcImF1dG9cIik7XG4gIH1cblxuICBzdGF0aWMgdXBkYXRlU2Nyb2xsYWJsZUNvbnRhaW5lcihwYXJlbnRFbGVtZW50LCBwb2ludGVyRXZlbnQgPSBcIlwiKSB7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIGN1cnJlbnQgZWxlbWVudCBpcyBzY3JvbGxhYmxlXG4gICAgZnVuY3Rpb24gaXNTY3JvbGxhYmxlKGVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG4gICAgICBjb25zdCBvdmVyZmxvd1kgPSBzdHlsZS5vdmVyZmxvd1k7XG4gICAgICBjb25zdCBvdmVyZmxvd1ggPSBzdHlsZS5vdmVyZmxvd1g7XG5cbiAgICAgIGNvbnN0IGlzU2Nyb2xsYWJsZVkgPSBlbGVtZW50LnNjcm9sbEhlaWdodCA+IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgY29uc3QgaXNTY3JvbGxhYmxlWCA9IGVsZW1lbnQuc2Nyb2xsV2lkdGggPiBlbGVtZW50LmNsaWVudFdpZHRoO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICAoKG92ZXJmbG93WSA9PT0gXCJhdXRvXCIgfHxcbiAgICAgICAgICBvdmVyZmxvd1kgPT09IFwic2Nyb2xsXCIgfHxcbiAgICAgICAgICBvdmVyZmxvd1kgPT09IFwib3ZlcmxheVwiKSAmJlxuICAgICAgICAgIGlzU2Nyb2xsYWJsZVkpIHx8XG4gICAgICAgICgob3ZlcmZsb3dYID09PSBcImF1dG9cIiB8fFxuICAgICAgICAgIG92ZXJmbG93WCA9PT0gXCJzY3JvbGxcIiB8fFxuICAgICAgICAgIG92ZXJmbG93WCA9PT0gXCJvdmVybGF5XCIpICYmXG4gICAgICAgICAgaXNTY3JvbGxhYmxlWClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gUmVjdXJzaXZlIGZ1bmN0aW9uIHRvIHRyYXZlcnNlIERPTSB0cmVlXG4gICAgZnVuY3Rpb24gdHJhdmVyc2UoZWxlbWVudCkge1xuICAgICAgLy8gQ2hlY2sgaWYgY3VycmVudCBlbGVtZW50IGlzIHNjcm9sbGFibGVcbiAgICAgIGlmIChpc1Njcm9sbGFibGUoZWxlbWVudCkpIHtcbiAgICAgICAgLy8gU2V0IHBvaW50ZXItZXZlbnRzIHRvIGF1dG9cbiAgICAgICAgZWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gcG9pbnRlckV2ZW50O1xuICAgICAgICAvLyBTdG9wIHRyYXZlcnNpbmcgdGhpcyBicmFuY2hcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBQcm9jZXNzIGNoaWxkIGVsZW1lbnRzIGlmIGN1cnJlbnQgZWxlbWVudCBpc24ndCBzY3JvbGxhYmxlXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdHJhdmVyc2UoZWxlbWVudC5jaGlsZHJlbltpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU3RhcnQgdHJhdmVyc2FsIGZyb20gcGFyZW50XG4gICAgdHJhdmVyc2UocGFyZW50RWxlbWVudCk7XG5cbiAgICAvLyBObyByZXR1cm4gdmFsdWUgYXMgcmVxdWVzdGVkXG4gIH1cblxuICAvKipcbiAgICogQ2xlYW4gdXAgc2Nyb2xsIHBhc3N0aHJvdWdoIHNldHVwXG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBFbGVtZW50IHRvIGNsZWFuIHVwXG4gICAqL1xuICBzdGF0aWMgY2xlYW51cFNjcm9sbFBhc3N0aHJvdWdoKGVsZW1lbnQpIHtcbiAgICBpZiAoIWVsZW1lbnQpIHJldHVybjtcblxuICAgIC8vIEdldCB0aGUgb3JpZ2luYWwgZGF0YSBmcm9tIHJlZ2lzdHJ5IGlmIGF2YWlsYWJsZVxuICAgIGNvbnN0IG9yaWdpbmFsRGF0YSA9IHRoaXMucG9ydGFsUmVnaXN0cnkuZ2V0KGVsZW1lbnQpO1xuICAgIGNvbnN0IG9yaWdpbmFsUG9pbnRlckV2ZW50cyA9IG9yaWdpbmFsRGF0YT8uc3R5bGVzPy5wb2ludGVyRXZlbnRzIHx8IFwiXCI7XG5cbiAgICAvLyBSZXN0b3JlIHBvaW50ZXItZXZlbnRzIG9uIHRoZSBlbGVtZW50XG4gICAgZWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gb3JpZ2luYWxQb2ludGVyRXZlbnRzO1xuXG4gICAgLy8gUmVzZXQgcG9pbnRlci1ldmVudHMgb24gYWxsIGNoaWxkcmVuIHRoYXQgbWlnaHQgaGF2ZSBiZWVuIG1vZGlmaWVkXG4gICAgUG9ydGFsLnVwZGF0ZVNjcm9sbGFibGVDb250YWluZXIoZWxlbWVudCwgXCJcIik7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUG9ydGFsO1xuIiwgIi8vIHNhbGFkdWkvY29yZS9zY3JvbGwtbWFuYWdlci5qc1xuLyoqXG4gKiBTY3JvbGxNYW5hZ2VyIHV0aWxpdHkgZm9yIFNhbGFkVUkgY29tcG9uZW50c1xuICogTWFuYWdlcyBzY3JvbGwgYW5kIHJlc2l6ZSBldmVudCBoYW5kbGVycyB3aXRoIG9wdGltaXplZCBwZXJmb3JtYW5jZVxuICovXG5jbGFzcyBTY3JvbGxNYW5hZ2VyIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIHNjcm9sbCBtYW5hZ2VyIHRvIGhhbmRsZSBzY3JvbGwgYW5kIHJlc2l6ZSBldmVudHNcbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gdXBkYXRlQ2FsbGJhY2sgLSBGdW5jdGlvbiB0byBjYWxsIHdoZW4gc2Nyb2xsL3Jlc2l6ZSBldmVudHMgb2NjdXJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBBZGRpdGlvbmFsIG9wdGlvbnNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHVwZGF0ZUNhbGxiYWNrLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrID0gdXBkYXRlQ2FsbGJhY2s7XG4gICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgLy8gVXNlIHJlcXVlc3RBbmltYXRpb25GcmFtZSBmb3IgdGhyb3R0bGluZ1xuICAgICAgdXNlUkFGOiB0cnVlLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9O1xuXG4gICAgdGhpcy5zY3JvbGxhYmxlUGFyZW50cyA9IFtdO1xuICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5yZXNpemVPYnNlcnZlciA9IG51bGw7XG4gICAgdGhpcy5hbmltYXRpb25GcmFtZUlkID0gbnVsbDtcblxuICAgIC8vIEJpbmQgbWV0aG9kcyB0byBtYWludGFpbiBjb3JyZWN0IGNvbnRleHRcbiAgICB0aGlzLmhhbmRsZVNjcm9sbCA9IHRoaXMuaGFuZGxlU2Nyb2xsLmJpbmQodGhpcyk7XG4gICAgdGhpcy5oYW5kbGVSZXNpemUgPSB0aGlzLmhhbmRsZVJlc2l6ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMudXBkYXRlUG9zaXRpb24gPSB0aGlzLnVwZGF0ZVBvc2l0aW9uLmJpbmQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgdHJhY2tpbmcgc2Nyb2xsIGFuZCByZXNpemUgZXZlbnRzXG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHJlZmVyZW5jZUVsZW1lbnQgLSBFbGVtZW50IHRvIHRyYWNrIHNjcm9sbGFibGUgcGFyZW50cyBmb3JcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0RWxlbWVudCAtIE9wdGlvbmFsIGVsZW1lbnQgdG8gb2JzZXJ2ZSB3aXRoIFJlc2l6ZU9ic2VydmVyXG4gICAqL1xuICBzdGFydChyZWZlcmVuY2VFbGVtZW50LCB0YXJnZXRFbGVtZW50ID0gbnVsbCkge1xuICAgIGlmICh0aGlzLmFjdGl2ZSkgcmV0dXJuO1xuXG4gICAgLy8gRmluZCBzY3JvbGxhYmxlIHBhcmVudCBlbGVtZW50c1xuICAgIGlmIChyZWZlcmVuY2VFbGVtZW50KSB7XG4gICAgICB0aGlzLnNjcm9sbGFibGVQYXJlbnRzID0gdGhpcy5maW5kU2Nyb2xsYWJsZVBhcmVudHMocmVmZXJlbmNlRWxlbWVudCk7XG5cbiAgICAgIC8vIEFkZCBzY3JvbGwgbGlzdGVuZXJzIHRvIGFsbCBzY3JvbGxhYmxlIHBhcmVudHNcbiAgICAgIHRoaXMuc2Nyb2xsYWJsZVBhcmVudHMuZm9yRWFjaCgocGFyZW50KSA9PiB7XG4gICAgICAgIHBhcmVudC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHRoaXMuaGFuZGxlU2Nyb2xsLCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzaXplIGxpc3RlbmVyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5oYW5kbGVSZXNpemUsIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcblxuICAgIC8vIFNldCB1cCBSZXNpemVPYnNlcnZlciBmb3IgZWxlbWVudCBzaXplIGNoYW5nZXMgaWYgYXZhaWxhYmxlXG4gICAgaWYgKHRhcmdldEVsZW1lbnQgJiYgdHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLnJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHRoaXMudXBkYXRlUG9zaXRpb24pO1xuICAgICAgdGhpcy5yZXNpemVPYnNlcnZlci5vYnNlcnZlKHRhcmdldEVsZW1lbnQpO1xuXG4gICAgICBpZiAocmVmZXJlbmNlRWxlbWVudCAmJiByZWZlcmVuY2VFbGVtZW50ICE9PSB0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgIHRoaXMucmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZShyZWZlcmVuY2VFbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCB0cmFja2luZyBzY3JvbGwgYW5kIHJlc2l6ZSBldmVudHNcbiAgICovXG4gIHN0b3AoKSB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZSkgcmV0dXJuO1xuXG4gICAgLy8gUmVtb3ZlIHNjcm9sbCBsaXN0ZW5lcnNcbiAgICB0aGlzLnNjcm9sbGFibGVQYXJlbnRzLmZvckVhY2goKHBhcmVudCkgPT4ge1xuICAgICAgcGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgdGhpcy5oYW5kbGVTY3JvbGwpO1xuICAgIH0pO1xuXG4gICAgLy8gUmVtb3ZlIHJlc2l6ZSBsaXN0ZW5lclxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuaGFuZGxlUmVzaXplKTtcblxuICAgIC8vIERpc2Nvbm5lY3QgUmVzaXplT2JzZXJ2ZXIgaWYgcHJlc2VudFxuICAgIGlmICh0aGlzLnJlc2l6ZU9ic2VydmVyKSB7XG4gICAgICB0aGlzLnJlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgIHRoaXMucmVzaXplT2JzZXJ2ZXIgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIENhbmNlbCBhbnkgcGVuZGluZyBhbmltYXRpb24gZnJhbWVcbiAgICBpZiAodGhpcy5hbmltYXRpb25GcmFtZUlkICE9PSBudWxsKSB7XG4gICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGlvbkZyYW1lSWQpO1xuICAgICAgdGhpcy5hbmltYXRpb25GcmFtZUlkID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMuc2Nyb2xsYWJsZVBhcmVudHMgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgc2Nyb2xsIGV2ZW50cyB3aXRoIHRocm90dGxpbmdcbiAgICovXG4gIGhhbmRsZVNjcm9sbCgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnVzZVJBRikge1xuICAgICAgdGhpcy50aHJvdHRsZWRVcGRhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cGRhdGVQb3NpdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgcmVzaXplIGV2ZW50cyB3aXRoIHRocm90dGxpbmdcbiAgICovXG4gIGhhbmRsZVJlc2l6ZSgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnVzZVJBRikge1xuICAgICAgdGhpcy50aHJvdHRsZWRVcGRhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cGRhdGVQb3NpdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaHJvdHRsZSB1cGRhdGVzIHVzaW5nIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgKi9cbiAgdGhyb3R0bGVkVXBkYXRlKCkge1xuICAgIGlmICh0aGlzLmFuaW1hdGlvbkZyYW1lSWQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuYW5pbWF0aW9uRnJhbWVJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlUG9zaXRpb24oKTtcbiAgICAgICAgdGhpcy5hbmltYXRpb25GcmFtZUlkID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIHRoZSB1cGRhdGUgY2FsbGJhY2tcbiAgICovXG4gIHVwZGF0ZVBvc2l0aW9uKCkge1xuICAgIGlmICh0aGlzLnVwZGF0ZUNhbGxiYWNrKSB7XG4gICAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgYWxsIHNjcm9sbGFibGUgcGFyZW50IGVsZW1lbnRzXG4gICAqL1xuICBmaW5kU2Nyb2xsYWJsZVBhcmVudHMoZWxlbWVudCkge1xuICAgIGNvbnN0IHNjcm9sbGFibGVQYXJlbnRzID0gW107XG4gICAgbGV0IGN1cnJlbnRFbGVtZW50ID0gZWxlbWVudDtcblxuICAgIHdoaWxlIChjdXJyZW50RWxlbWVudCAmJiBjdXJyZW50RWxlbWVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShjdXJyZW50RWxlbWVudCk7XG4gICAgICBpZiAoXG4gICAgICAgIHN0eWxlLm92ZXJmbG93ID09PSBcImF1dG9cIiB8fFxuICAgICAgICBzdHlsZS5vdmVyZmxvdyA9PT0gXCJzY3JvbGxcIiB8fFxuICAgICAgICBzdHlsZS5vdmVyZmxvd1ggPT09IFwiYXV0b1wiIHx8XG4gICAgICAgIHN0eWxlLm92ZXJmbG93WCA9PT0gXCJzY3JvbGxcIiB8fFxuICAgICAgICBzdHlsZS5vdmVyZmxvd1kgPT09IFwiYXV0b1wiIHx8XG4gICAgICAgIHN0eWxlLm92ZXJmbG93WSA9PT0gXCJzY3JvbGxcIlxuICAgICAgKSB7XG4gICAgICAgIHNjcm9sbGFibGVQYXJlbnRzLnB1c2goY3VycmVudEVsZW1lbnQpO1xuICAgICAgfVxuICAgICAgY3VycmVudEVsZW1lbnQgPSBjdXJyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgIH1cblxuICAgIC8vIEFsd2F5cyBpbmNsdWRlIHdpbmRvdyBmb3IgZ2xvYmFsIHNjcm9sbGluZ1xuICAgIHNjcm9sbGFibGVQYXJlbnRzLnB1c2god2luZG93KTtcblxuICAgIHJldHVybiBzY3JvbGxhYmxlUGFyZW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhbiB1cCBhbGwgcmVmZXJlbmNlc1xuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLnN0b3AoKTtcbiAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrID0gbnVsbDtcbiAgICB0aGlzLm9wdGlvbnMgPSBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjcm9sbE1hbmFnZXI7XG4iLCAiLy8gc2FsYWR1aS9jb3JlL3Bvc2l0aW9uZWQtZWxlbWVudC5qcyAtIFVwZGF0ZWQgZm9yIGZpeGVkIHBvc2l0aW9uaW5nXG4vKipcbiAqIFBvc2l0aW9uZWRFbGVtZW50IC0gTWFpbiBwb3NpdGlvbmluZyBjbGFzcyB0aGF0IGludGVncmF0ZXMgYWxsIHBvc2l0aW9uaW5nIHV0aWxpdGllc1xuICovXG5pbXBvcnQgUG9zaXRpb25lciBmcm9tIFwiLi9wb3NpdGlvbmVyXCI7XG5pbXBvcnQgRm9jdXNUcmFwIGZyb20gXCIuL2ZvY3VzLXRyYXBcIjtcbmltcG9ydCBDbGlja091dHNpZGVNb25pdG9yIGZyb20gXCIuL2NsaWNrLW91dHNpZGVcIjtcbmltcG9ydCBQb3J0YWwgZnJvbSBcIi4vcG9ydGFsXCI7XG5pbXBvcnQgU2Nyb2xsTWFuYWdlciBmcm9tIFwiLi9zY3JvbGwtbWFuYWdlclwiO1xuXG5jbGFzcyBQb3NpdGlvbmVkRWxlbWVudCB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBwb3NpdGlvbmVkIGVsZW1lbnQgd2l0aCBmdWxsIGZ1bmN0aW9uYWxpdHlcbiAgICpcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIEVsZW1lbnQgdG8gcG9zaXRpb25cbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcmVmZXJlbmNlIC0gUmVmZXJlbmNlIGVsZW1lbnQgdG8gcG9zaXRpb24gYWdhaW5zdFxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIFBvc2l0aW9uaW5nIG9wdGlvbnNcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHJlZmVyZW5jZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLnJlZmVyZW5jZSA9IHJlZmVyZW5jZTtcbiAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAvLyBQb3NpdGlvbmluZyBvcHRpb25zXG4gICAgICBwbGFjZW1lbnQ6IFwiYm90dG9tXCIsXG4gICAgICBhbGlnbm1lbnQ6IFwiY2VudGVyXCIsXG4gICAgICBzaWRlT2Zmc2V0OiA4LFxuICAgICAgYWxpZ25PZmZzZXQ6IDAsXG4gICAgICBmbGlwOiB0cnVlLFxuXG4gICAgICAvLyBQb3J0YWwgb3B0aW9uc1xuICAgICAgdXNlUG9ydGFsOiB0cnVlLFxuICAgICAgcG9ydGFsQ29udGFpbmVyOiBkb2N1bWVudC5ib2R5LFxuXG4gICAgICAvLyBGb2N1cyBtYW5hZ2VtZW50XG4gICAgICB0cmFwRm9jdXM6IGZhbHNlLFxuICAgICAgZm9jdXNhYmxlU2VsZWN0b3I6XG4gICAgICAgICdhW2hyZWZdLCBidXR0b246bm90KFtkaXNhYmxlZF0pLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHNlbGVjdDpub3QoW2Rpc2FibGVkXSksIHRleHRhcmVhOm5vdChbZGlzYWJsZWRdKSwgW3RhYmluZGV4XTpub3QoW3RhYmluZGV4PVwiLTFcIl0pJyxcblxuICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcbiAgICAgIG9uT3V0c2lkZUNsaWNrOiBudWxsLFxuICAgICAgc2Nyb2xsUGFzc1Rocm91Z2g6IGZhbHNlLFxuXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH07XG5cbiAgICAvLyBTdGF0ZVxuICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG5cbiAgICAvLyBJbml0aWFsaXplIHN1Yi1tb2R1bGVzXG4gICAgdGhpcy5pbml0aWFsaXplTW9kdWxlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgYWxsIHJlcXVpcmVkIG1vZHVsZXNcbiAgICovXG4gIGluaXRpYWxpemVNb2R1bGVzKCkge1xuICAgIC8vIEZvY3VzIHRyYXAgZm9yIGtleWJvYXJkIG5hdmlnYXRpb25cbiAgICB0aGlzLmZvY3VzVHJhcCA9IG5ldyBGb2N1c1RyYXAodGhpcy5lbGVtZW50LCB7XG4gICAgICBmb2N1c2FibGVTZWxlY3RvcjogdGhpcy5vcHRpb25zLmZvY3VzYWJsZVNlbGVjdG9yLFxuICAgIH0pO1xuXG4gICAgLy8gQ2xpY2sgb3V0c2lkZSBkZXRlY3Rpb25cbiAgICB0aGlzLmNsaWNrT3V0c2lkZU1vbml0b3IgPSB0aGlzLm9wdGlvbnMub25PdXRzaWRlQ2xpY2tcbiAgICAgID8gbmV3IENsaWNrT3V0c2lkZU1vbml0b3IoXG4gICAgICAgICAgW3RoaXMuZWxlbWVudCwgdGhpcy5yZWZlcmVuY2VdLFxuICAgICAgICAgIHRoaXMub3B0aW9ucy5vbk91dHNpZGVDbGljayxcbiAgICAgICAgKVxuICAgICAgOiBudWxsO1xuXG4gICAgLy8gU2Nyb2xsIGFuZCByZXNpemUgaGFuZGxpbmdcbiAgICB0aGlzLnNjcm9sbE1hbmFnZXIgPSBuZXcgU2Nyb2xsTWFuYWdlcigoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gQmluZCBtZXRob2RzIGZvciBldmVudCBoYW5kbGVyc1xuICAgIHRoaXMuaGFuZGxlV2hlZWwgPSB0aGlzLmhhbmRsZVdoZWVsLmJpbmQodGhpcyk7XG4gICAgdGhpcy5oYW5kbGVUb3VjaFN0YXJ0ID0gdGhpcy5oYW5kbGVUb3VjaFN0YXJ0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5oYW5kbGVUb3VjaE1vdmUgPSB0aGlzLmhhbmRsZVRvdWNoTW92ZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlIHRoZSBwb3NpdGlvbmVkIGVsZW1lbnRcbiAgICovXG4gIGFjdGl2YXRlKCkge1xuICAgIGlmICh0aGlzLmFjdGl2ZSkgcmV0dXJuIHRoaXM7XG5cbiAgICAvLyBNb3ZlIHRvIHBvcnRhbCBpZiBlbmFibGVkXG4gICAgaWYgKHRoaXMub3B0aW9ucy51c2VQb3J0YWwpIHtcbiAgICAgIHRoaXMubW92ZVRvUG9ydGFsKCk7XG4gICAgfVxuXG4gICAgLy8gQ2FsY3VsYXRlIGFuZCBhcHBseSBpbml0aWFsIHBvc2l0aW9uXG4gICAgdGhpcy5jYWxjdWxhdGVBbmRBcHBseVBvc2l0aW9uKCk7XG5cbiAgICAvLyBBY3RpdmF0ZSBzdWItbW9kdWxlc1xuICAgIGlmICh0aGlzLm9wdGlvbnMudHJhcEZvY3VzKSB7XG4gICAgICB0aGlzLmZvY3VzVHJhcC5hY3RpdmF0ZSgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNsaWNrT3V0c2lkZU1vbml0b3IpIHtcbiAgICAgIHRoaXMuY2xpY2tPdXRzaWRlTW9uaXRvci5zdGFydCgpO1xuICAgIH1cblxuICAgIHRoaXMuc2Nyb2xsTWFuYWdlci5zdGFydCh0aGlzLnJlZmVyZW5jZSwgdGhpcy5lbGVtZW50KTtcblxuICAgIC8vIEFkZCB3aGVlbCBhbmQgdG91Y2ggZXZlbnQgaGFuZGxlcnMgaWYgaW4gcG9ydGFsXG4gICAgaWYgKFBvcnRhbC5pc0luUG9ydGFsKHRoaXMuZWxlbWVudCkgJiYgdGhpcy5vcHRpb25zLnNjcm9sbFBhc3NUaHJvdWdoKSB7XG4gICAgICB0aGlzLnNldHVwU2Nyb2xsUGFzc3Rocm91Z2goKTtcbiAgICB9XG5cbiAgICAvLyBzZXQgcmVmZXJlbmNlIHdpZHRoIGFuZCBoZWlnaHQgYXNzIGNzcyB2YXJpYWJsZVxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShcbiAgICAgIFwiLS1zYWxhZC1yZWZlcmVuY2Utd2lkdGhcIixcbiAgICAgIHRoaXMucmVmZXJlbmNlLm9mZnNldFdpZHRoICsgXCJweFwiLFxuICAgICk7XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFxuICAgICAgXCItLXNhbGFkLXJlZmVyZW5jZS1oZWlnaHRcIixcbiAgICAgIHRoaXMucmVmZXJlbmNlLm9mZnNldEhlaWdodCArIFwicHhcIixcbiAgICApO1xuXG4gICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERlYWN0aXZhdGUgdGhlIHBvc2l0aW9uZWQgZWxlbWVudFxuICAgKi9cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAoIXRoaXMuYWN0aXZlKSByZXR1cm4gdGhpcztcblxuICAgIC8vIERlYWN0aXZhdGUgc3ViLW1vZHVsZXNcbiAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cykge1xuICAgICAgdGhpcy5mb2N1c1RyYXAuZGVhY3RpdmF0ZSgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNsaWNrT3V0c2lkZU1vbml0b3IpIHtcbiAgICAgIHRoaXMuY2xpY2tPdXRzaWRlTW9uaXRvci5zdG9wKCk7XG4gICAgfVxuXG4gICAgdGhpcy5zY3JvbGxNYW5hZ2VyLnN0b3AoKTtcblxuICAgIC8vIENsZWFuIHVwIHNjcm9sbCBwYXNzdGhyb3VnaCBpZiBpbiBwb3J0YWxcbiAgICBpZiAoUG9ydGFsLmlzSW5Qb3J0YWwodGhpcy5lbGVtZW50KSAmJiB0aGlzLm9wdGlvbnMuc2Nyb2xsUGFzc1Rocm91Z2gpIHtcbiAgICAgIHRoaXMuY2xlYW51cFNjcm9sbFBhc3N0aHJvdWdoKCk7XG4gICAgfVxuXG4gICAgLy8gUmVzdG9yZSBmcm9tIHBvcnRhbCBpZiBuZWVkZWRcbiAgICBpZiAodGhpcy5pblBvcnRhbCkge1xuICAgICAgdGhpcy5yZXN0b3JlRnJvbVBvcnRhbCgpO1xuICAgIH1cblxuICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHBvc2l0aW9uXG4gICAqL1xuICB1cGRhdGUoKSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZUFuZEFwcGx5UG9zaXRpb24oKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTW92ZSBlbGVtZW50IHRvIHBvcnRhbCBjb250YWluZXJcbiAgICovXG4gIG1vdmVUb1BvcnRhbCgpIHtcbiAgICBpZiAoUG9ydGFsLmlzSW5Qb3J0YWwodGhpcy5lbGVtZW50KSkgcmV0dXJuO1xuXG4gICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5vcHRpb25zLnBvcnRhbENvbnRhaW5lciB8fCBkb2N1bWVudC5ib2R5O1xuICAgIFBvcnRhbC5tb3ZlKHRoaXMuZWxlbWVudCwgY29udGFpbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN0b3JlIGVsZW1lbnQgZnJvbSBwb3J0YWxcbiAgICovXG4gIHJlc3RvcmVGcm9tUG9ydGFsKCkge1xuICAgIGlmICghUG9ydGFsLmlzSW5Qb3J0YWwodGhpcy5lbGVtZW50KSkgcmV0dXJuO1xuXG4gICAgUG9ydGFsLnJlc3RvcmUodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgYW5kIGFwcGx5IHBvc2l0aW9uIHRvIHRoZSBlbGVtZW50XG4gICAqL1xuICBjYWxjdWxhdGVBbmRBcHBseVBvc2l0aW9uKCkge1xuICAgIGNvbnN0IHBvc2l0aW9uID0gUG9zaXRpb25lci5jYWxjdWxhdGUoXG4gICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICB0aGlzLnJlZmVyZW5jZSxcbiAgICAgIHRoaXMub3B0aW9ucyxcbiAgICApO1xuXG4gICAgLy8gQXBwbHkgcG9zaXRpb25pbmcgLSB3aXRoIGZpeGVkIHBvc2l0aW9uaW5nLCB3ZSBubyBsb25nZXIgbmVlZCB0b1xuICAgIC8vIGFkanVzdCBmb3Igc2Nyb2xsIHBvc2l0aW9uIHNpbmNlIGZpeGVkIGlzIHJlbGF0aXZlIHRvIHRoZSB2aWV3cG9ydFxuICAgIFBvc2l0aW9uZXIuYXBwbHlQb3NpdGlvbih0aGlzLmVsZW1lbnQsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuXG4gICAgLy8gVXBkYXRlIHBsYWNlbWVudCBhdHRyaWJ1dGVcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1wbGFjZW1lbnRcIiwgcG9zaXRpb24ucGxhY2VtZW50KTtcblxuICAgIHJldHVybiBwb3NpdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdXAgc2Nyb2xsIGV2ZW50IHBhc3N0aHJvdWdoXG4gICAqL1xuICBzZXR1cFNjcm9sbFBhc3N0aHJvdWdoKCkge1xuICAgIFBvcnRhbC5zZXR1cFNjcm9sbFBhc3N0aHJvdWdoKHRoaXMuZWxlbWVudCwgdGhpcy5vcHRpb25zLmZvY3VzYWJsZVNlbGVjdG9yKTtcblxuICAgIC8vIEFkZCB3aGVlbCBhbmQgdG91Y2ggZXZlbnQgaGFuZGxlcnNcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIHRoaXMuaGFuZGxlV2hlZWwsIHtcbiAgICAgIHBhc3NpdmU6IGZhbHNlLFxuICAgIH0pO1xuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCB0aGlzLmhhbmRsZVRvdWNoU3RhcnQsIHtcbiAgICAgIHBhc3NpdmU6IGZhbHNlLFxuICAgIH0pO1xuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIHRoaXMuaGFuZGxlVG91Y2hNb3ZlLCB7XG4gICAgICBwYXNzaXZlOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhbiB1cCBzY3JvbGwgcGFzc3Rocm91Z2hcbiAgICovXG4gIGNsZWFudXBTY3JvbGxQYXNzdGhyb3VnaCgpIHtcbiAgICBpZiAoIXRoaXMuZWxlbWVudCkgcmV0dXJuO1xuXG4gICAgLy8gUmVtb3ZlIHdoZWVsIGFuZCB0b3VjaCBldmVudCBoYW5kbGVyc1xuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgdGhpcy5oYW5kbGVXaGVlbCk7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIHRoaXMuaGFuZGxlVG91Y2hTdGFydCk7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIiwgdGhpcy5oYW5kbGVUb3VjaE1vdmUpO1xuXG4gICAgLy8gQ2xlYW4gdXAgc3R5bGVzXG4gICAgUG9ydGFsLmNsZWFudXBTY3JvbGxQYXNzdGhyb3VnaCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSB3aGVlbCBldmVudHMgZm9yIHNjcm9sbCBwYXNzdGhyb3VnaFxuICAgKi9cbiAgaGFuZGxlV2hlZWwoZXZlbnQpIHtcbiAgICAvLyBMZXQgdGhlIHdoZWVsIGV2ZW50IHBhc3MgdGhyb3VnaFxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSB0b3VjaCBzdGFydCBmb3Igc2Nyb2xsIHBhc3N0aHJvdWdoXG4gICAqL1xuICBoYW5kbGVUb3VjaFN0YXJ0KGV2ZW50KSB7XG4gICAgLy8gU3RvcmUgaW5pdGlhbCB0b3VjaCBwb3NpdGlvblxuICAgIGlmIChldmVudC50b3VjaGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGhpcy50b3VjaFN0YXJ0WSA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIHRvdWNoIG1vdmUgZm9yIHNjcm9sbCBwYXNzdGhyb3VnaFxuICAgKi9cbiAgaGFuZGxlVG91Y2hNb3ZlKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLnRvdWNoU3RhcnRZKSByZXR1cm47XG5cbiAgICAvLyBEZXRlcm1pbmUgc2Nyb2xsIGRpcmVjdGlvblxuICAgIGNvbnN0IHRvdWNoWSA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICBjb25zdCBkZWx0YVkgPSB0aGlzLnRvdWNoU3RhcnRZIC0gdG91Y2hZO1xuICAgIHRoaXMudG91Y2hTdGFydFkgPSB0b3VjaFk7XG5cbiAgICAvLyBGaW5kIGVsZW1lbnQgdGhhdCBzaG91bGQgcmVjZWl2ZSBzY3JvbGxcbiAgICBjb25zdCBlbGVtZW50c0Zyb21Qb2ludCA9IGRvY3VtZW50LmVsZW1lbnRzRnJvbVBvaW50KFxuICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLFxuICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZLFxuICAgICk7XG5cbiAgICAvLyBGaW5kIGZpcnN0IHNjcm9sbGFibGUgZWxlbWVudCB0aGF0IGlzIG5vdCBvdXIgcG9ydGFsXG4gICAgY29uc3Qgc2Nyb2xsYWJsZUVsZW1lbnQgPSBlbGVtZW50c0Zyb21Qb2ludC5maW5kKChlbCkgPT4ge1xuICAgICAgaWYgKGVsID09PSB0aGlzLmVsZW1lbnQgfHwgdGhpcy5lbGVtZW50LmNvbnRhaW5zKGVsKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHN0eWxlLm92ZXJmbG93WSA9PT0gXCJhdXRvXCIgfHxcbiAgICAgICAgc3R5bGUub3ZlcmZsb3dZID09PSBcInNjcm9sbFwiIHx8XG4gICAgICAgIGVsID09PSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICBpZiAoc2Nyb2xsYWJsZUVsZW1lbnQpIHtcbiAgICAgIC8vIFBhc3Mgc2Nyb2xsIHRvIGZvdW5kIGVsZW1lbnRcbiAgICAgIHNjcm9sbGFibGVFbGVtZW50LnNjcm9sbFRvcCArPSBkZWx0YVk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIHJlZmVyZW5jZSBlbGVtZW50XG4gICAqL1xuICB1cGRhdGVSZWZlcmVuY2UocmVmZXJlbmNlKSB7XG4gICAgdGhpcy5yZWZlcmVuY2UgPSByZWZlcmVuY2U7XG5cbiAgICAvLyBVcGRhdGUgY2xpY2sgb3V0c2lkZSBtb25pdG9yXG4gICAgaWYgKHRoaXMuY2xpY2tPdXRzaWRlTW9uaXRvcikge1xuICAgICAgdGhpcy5jbGlja091dHNpZGVNb25pdG9yLnVwZGF0ZUVsZW1lbnRzKFt0aGlzLmVsZW1lbnQsIHRoaXMucmVmZXJlbmNlXSk7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgb3B0aW9uc1xuICAgKi9cbiAgdXBkYXRlT3B0aW9ucyhvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB7IC4uLnRoaXMub3B0aW9ucywgLi4ub3B0aW9ucyB9O1xuXG4gICAgLy8gVXBkYXRlIGZvY3VzIHRyYXAgb3B0aW9ucyBpZiBuZWVkZWRcbiAgICBpZiAodGhpcy5mb2N1c1RyYXAgJiYgb3B0aW9ucy5mb2N1c2FibGVTZWxlY3Rvcikge1xuICAgICAgdGhpcy5mb2N1c1RyYXAub3B0aW9ucyA9IHtcbiAgICAgICAgLi4udGhpcy5mb2N1c1RyYXAub3B0aW9ucyxcbiAgICAgICAgZm9jdXNhYmxlU2VsZWN0b3I6IG9wdGlvbnMuZm9jdXNhYmxlU2VsZWN0b3IsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYW4gdXAgYW5kIGRlc3Ryb3kgdGhlIHBvc2l0aW9uZWQgZWxlbWVudFxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmRlYWN0aXZhdGUoKTtcblxuICAgIC8vIERlc3Ryb3kgc3ViLW1vZHVsZXNcbiAgICB0aGlzLmZvY3VzVHJhcC5kZXN0cm95KCk7XG4gICAgaWYgKHRoaXMuY2xpY2tPdXRzaWRlTW9uaXRvcikge1xuICAgICAgdGhpcy5jbGlja091dHNpZGVNb25pdG9yLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5zY3JvbGxNYW5hZ2VyLmRlc3Ryb3koKTtcblxuICAgIC8vIENsZWFyIHJlZmVyZW5jZXNcbiAgICB0aGlzLmVsZW1lbnQgPSBudWxsO1xuICAgIHRoaXMucmVmZXJlbmNlID0gbnVsbDtcbiAgICB0aGlzLm9wdGlvbnMgPSBudWxsO1xuICAgIHRoaXMuZm9jdXNUcmFwID0gbnVsbDtcbiAgICB0aGlzLmNsaWNrT3V0c2lkZU1vbml0b3IgPSBudWxsO1xuICAgIHRoaXMuc2Nyb2xsTWFuYWdlciA9IG51bGw7XG4gICAgdGhpcy50b3VjaFN0YXJ0WSA9IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUG9zaXRpb25lZEVsZW1lbnQ7XG4iLCAiLy8gc2FsYWR1aS9jb21wb25lbnRzL3BvcG92ZXIuanNcbmltcG9ydCBDb21wb25lbnQgZnJvbSBcIi4uL2NvcmUvY29tcG9uZW50XCI7XG5pbXBvcnQgU2FsYWRVSSBmcm9tIFwiLi4vaW5kZXhcIjtcbmltcG9ydCBQb3NpdGlvbmVkRWxlbWVudCBmcm9tIFwiLi4vY29yZS9wb3NpdGlvbmVkLWVsZW1lbnRcIjtcblxuY2xhc3MgUG9wb3ZlckNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKGVsLCBob29rQ29udGV4dCkge1xuICAgIHN1cGVyKGVsLCB7IGhvb2tDb250ZXh0IH0pO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBjb3JlIHByb3BlcnRpZXNcbiAgICB0aGlzLnRyaWdnZXIgPSB0aGlzLmdldFBhcnQoXCJ0cmlnZ2VyXCIpO1xuICAgIHRoaXMucG9zaXRpb25lciA9IHRoaXMuZ2V0UGFydChcInBvc2l0aW9uZXJcIik7XG4gICAgdGhpcy5jb250ZW50ID0gdGhpcy5wb3NpdGlvbmVyXG4gICAgICA/IHRoaXMucG9zaXRpb25lci5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtcGFydD0nY29udGVudCddXCIpXG4gICAgICA6IG51bGw7XG5cbiAgICAvLyBTZXQga2V5Ym9hcmQgbmF2aWdhdGlvbiBkZWZhdWx0c1xuICAgIHRoaXMuY29uZmlnLnByZXZlbnREZWZhdWx0S2V5cyA9IFtcIkVzY2FwZVwiXTtcbiAgfVxuXG4gIGdldENvbXBvbmVudENvbmZpZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdGVNYWNoaW5lOiB7XG4gICAgICAgIGNsb3NlZDoge1xuICAgICAgICAgIGVudGVyOiBcIm9uQ2xvc2VkRW50ZXJcIixcbiAgICAgICAgICB0cmFuc2l0aW9uczoge1xuICAgICAgICAgICAgb3BlbjogXCJvcGVuXCIsXG4gICAgICAgICAgICB0b2dnbGU6IFwib3BlblwiLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIG9wZW46IHtcbiAgICAgICAgICBlbnRlcjogXCJvbk9wZW5FbnRlclwiLFxuICAgICAgICAgIHRyYW5zaXRpb25zOiB7XG4gICAgICAgICAgICBjbG9zZTogXCJjbG9zZWRcIixcbiAgICAgICAgICAgIHRvZ2dsZTogXCJjbG9zZWRcIixcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGV2ZW50czoge1xuICAgICAgICBjbG9zZWQ6IHtcbiAgICAgICAgICBrZXlNYXA6IHt9LFxuICAgICAgICB9LFxuICAgICAgICBvcGVuOiB7XG4gICAgICAgICAga2V5TWFwOiB7XG4gICAgICAgICAgICBFc2NhcGU6IFwiY2xvc2VcIixcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGhpZGRlbkNvbmZpZzoge1xuICAgICAgICBjbG9zZWQ6IHtcbiAgICAgICAgICBwb3NpdGlvbmVyOiB0cnVlLCAvLyBIaWRlIHRoZSBwb3NpdGlvbmVyIGluIGNsb3NlZCBzdGF0ZVxuICAgICAgICB9LFxuICAgICAgICBvcGVuOiB7XG4gICAgICAgICAgcG9zaXRpb25lcjogZmFsc2UsIC8vIFNob3cgdGhlIHBvc2l0aW9uZXIgaW4gb3BlbiBzdGF0ZVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGFyaWFDb25maWc6IHtcbiAgICAgICAgdHJpZ2dlcjoge1xuICAgICAgICAgIGFsbDoge1xuICAgICAgICAgICAgaGFzcG9wdXA6IFwiZGlhbG9nXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvcGVuOiB7XG4gICAgICAgICAgICBleHBhbmRlZDogXCJ0cnVlXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjbG9zZWQ6IHtcbiAgICAgICAgICAgIGV4cGFuZGVkOiBcImZhbHNlXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgY29udGVudDoge1xuICAgICAgICAgIGFsbDoge1xuICAgICAgICAgICAgcm9sZTogXCJkaWFsb2dcIixcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBwb3NpdGlvbmVkIGVsZW1lbnQgaWYgdGhlIHBvc2l0aW9uZXIgYW5kIHRyaWdnZXIgZXhpc3QgYW5kIHRoZSBwb3NpdGlvbmVkIGVsZW1lbnQgaXMgbm90IGFscmVhZHkgY3JlYXRlZC5cbiAgICogRXh0cmFjdHMgcGxhY2VtZW50IGNvbmZpZ3VyYXRpb24gZnJvbSBET00gYXR0cmlidXRlcyBhbmQgY3JlYXRlcyBhIG5ldyBQb3NpdGlvbmVkRWxlbWVudCBpbnN0YW5jZS5cbiAgICovXG4gIGluaXRpYWxpemVQb3NpdGlvbmVkRWxlbWVudCgpIHtcbiAgICBpZiAodGhpcy5wb3NpdGlvbmVyICYmIHRoaXMudHJpZ2dlciAmJiAhdGhpcy5wb3NpdGlvbmVkRWxlbWVudCkge1xuICAgICAgY29uc3QgcGxhY2VtZW50ID0gdGhpcy5wb3NpdGlvbmVyLmdldEF0dHJpYnV0ZShcImRhdGEtc2lkZVwiKSB8fCBcImJvdHRvbVwiO1xuICAgICAgY29uc3QgYWxpZ25tZW50ID0gdGhpcy5wb3NpdGlvbmVyLmdldEF0dHJpYnV0ZShcImRhdGEtYWxpZ25cIikgfHwgXCJjZW50ZXJcIjtcbiAgICAgIGNvbnN0IHNpZGVPZmZzZXQgPSBwYXJzZUludChcbiAgICAgICAgdGhpcy5wb3NpdGlvbmVyLmdldEF0dHJpYnV0ZShcImRhdGEtc2lkZS1vZmZzZXRcIikgfHwgXCI4XCIsXG4gICAgICAgIDEwLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGFsaWduT2Zmc2V0ID0gcGFyc2VJbnQoXG4gICAgICAgIHRoaXMucG9zaXRpb25lci5nZXRBdHRyaWJ1dGUoXCJkYXRhLWFsaWduLW9mZnNldFwiKSB8fCBcIjBcIixcbiAgICAgICAgMTAsXG4gICAgICApO1xuXG4gICAgICB0aGlzLnBvc2l0aW9uZWRFbGVtZW50ID0gbmV3IFBvc2l0aW9uZWRFbGVtZW50KFxuICAgICAgICB0aGlzLnBvc2l0aW9uZXIsXG4gICAgICAgIHRoaXMudHJpZ2dlcixcbiAgICAgICAge1xuICAgICAgICAgIHBsYWNlbWVudCxcbiAgICAgICAgICBhbGlnbm1lbnQsXG4gICAgICAgICAgc2lkZU9mZnNldCxcbiAgICAgICAgICBhbGlnbk9mZnNldCxcbiAgICAgICAgICBmbGlwOiB0cnVlLFxuICAgICAgICAgIHVzZVBvcnRhbDogdHJ1ZSxcbiAgICAgICAgICBwb3J0YWxDb250YWluZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5vcHRpb25zLnBvcnRhbENvbnRhaW5lciksXG4gICAgICAgICAgdHJhcEZvY3VzOiB0cnVlLFxuICAgICAgICAgIG9uT3V0c2lkZUNsaWNrOiAoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJjbG9zZVwiKSxcbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgb25PcGVuRW50ZXIocGFyYW1zID0ge30pIHtcbiAgICB0aGlzLmluaXRpYWxpemVQb3NpdGlvbmVkRWxlbWVudCgpO1xuICAgIHRoaXMucG9zaXRpb25lZEVsZW1lbnQ/LmFjdGl2YXRlKCk7XG4gICAgdGhpcy5wdXNoRXZlbnQoXCJvcGVuZWRcIik7XG4gIH1cblxuICBvbkNsb3NlZEVudGVyKCkge1xuICAgIHRoaXMucG9zaXRpb25lZEVsZW1lbnQ/LmRlYWN0aXZhdGUoKTtcbiAgICB0aGlzLnB1c2hFdmVudChcImNsb3NlZFwiKTtcbiAgfVxuXG4gIGJlZm9yZURlc3Ryb3koKSB7XG4gICAgdGhpcy5wb3NpdGlvbmVkRWxlbWVudD8uZGVzdHJveSgpO1xuICAgIHRoaXMucG9zaXRpb25lZEVsZW1lbnQgPSBudWxsO1xuICB9XG59XG5cbi8vIFJlZ2lzdGVyIHRoZSBjb21wb25lbnRcblNhbGFkVUkucmVnaXN0ZXIoXCJwb3BvdmVyXCIsIFBvcG92ZXJDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBQb3BvdmVyQ29tcG9uZW50O1xuIiwgIi8vIElmIHlvdXIgY29tcG9uZW50cyByZXF1aXJlIGFueSBob29rcyBvciBjdXN0b20gdXBsb2FkZXJzLCBvciBpZiB5b3VyIHBhZ2VzXG4vLyByZXF1aXJlIGNvbm5lY3QgcGFyYW1ldGVycywgdW5jb21tZW50IHRoZSBmb2xsb3dpbmcgbGluZXMgYW5kIGRlY2xhcmUgdGhlbSBhc1xuLy8gc3VjaDpcbi8vXG5pbXBvcnQgU2FsYWQgZnJvbSBcIi4uL3NhbGFkX3VpXCI7XG5pbXBvcnQgXCIuLi9zYWxhZF91aS9jb21wb25lbnRzL2NvbW1hbmRcIjtcbmltcG9ydCBcIi4uL3NhbGFkX3VpL2NvbXBvbmVudHMvcG9wb3ZlclwiO1xuLy8gaW1wb3J0ICogYXMgUGFyYW1zIGZyb20gXCIuL3BhcmFtc1wiO1xuLy8gaW1wb3J0ICogYXMgVXBsb2FkZXJzIGZyb20gXCIuL3VwbG9hZGVyc1wiO1xuXG5jb25zdCBIb29rcyA9IHtcbiAgU2FsYWRVSTogU2FsYWQuU2FsYWRVSUhvb2ssXG59O1xuXG4oZnVuY3Rpb24gKCkge1xuICB3aW5kb3cuc3Rvcnlib29rID0geyBIb29rcyB9O1xufSkoKTtcblxuLy8gSWYgeW91ciBjb21wb25lbnRzIHJlcXVpcmUgYWxwaW5lanMsIHlvdSdsbCBuZWVkIHRvIHN0YXJ0XG4vLyBhbHBpbmUgYWZ0ZXIgdGhlIERPTSBpcyBsb2FkZWQgYW5kIHBhc3MgaW4gYW4gb25CZWZvcmVFbFVwZGF0ZWRcbi8vXG4vLyBpbXBvcnQgQWxwaW5lIGZyb20gJ2FscGluZWpzJ1xuLy8gd2luZG93LkFscGluZSA9IEFscGluZVxuLy8gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbi8vICAgd2luZG93LkFscGluZS5zdGFydCgpO1xuLy8gfSk7XG5cbi8vIChmdW5jdGlvbiAoKSB7XG4vLyAgIHdpbmRvdy5zdG9yeWJvb2sgPSB7XG4vLyAgICAgTGl2ZVNvY2tldE9wdGlvbnM6IHtcbi8vICAgICAgIGRvbToge1xuLy8gICAgICAgICBvbkJlZm9yZUVsVXBkYXRlZChmcm9tLCB0bykge1xuLy8gICAgICAgICAgIGlmIChmcm9tLl94X2RhdGFTdGFjaykge1xuLy8gICAgICAgICAgICAgd2luZG93LkFscGluZS5jbG9uZShmcm9tLCB0bylcbi8vICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgIH07XG4vLyB9KSgpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLQSxNQUFNLGVBQU4sTUFBbUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFTakIsWUFBWSxhQUFhLGNBQWMsU0FBUztBQUM5QyxXQUFLLGNBQWM7QUFDbkIsV0FBSyxRQUFRLGdCQUFnQjtBQUM3QixXQUFLLGdCQUFnQjtBQUNyQixXQUFLLFVBQVUsV0FBVyxDQUFDO0FBQUEsSUFDN0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBU0EsV0FBVyxPQUFPLFNBQVMsQ0FBQyxHQUFHO0FBNUJqQztBQTZCSSxZQUFNLHFCQUFxQixLQUFLLFlBQVksS0FBSyxLQUFLO0FBQ3RELFVBQUksQ0FBQztBQUFvQixlQUFPO0FBRWhDLFlBQU0sY0FBYSx3QkFBbUIsZ0JBQW5CLG1CQUFpQztBQUNwRCxVQUFJLENBQUM7QUFBWSxlQUFPO0FBRXhCLFlBQU0sWUFBWSxLQUFLLG1CQUFtQixZQUFZLE1BQU07QUFDNUQsVUFBSSxDQUFDO0FBQVcsZUFBTztBQUV2QixZQUFNLFlBQVksS0FBSztBQUV2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
