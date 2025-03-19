// saladui/core/state-machine.js
/**
 * StateMachine class for SaladUI framework
 * Handles state transitions, event processing, and state-specific behavior
 */
class StateMachine {
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
    const currentStateConfig = this.stateConfig[this.state];
    if (!currentStateConfig) return false;

    const transition = currentStateConfig.transitions?.[event];
    if (!transition) return false;

    const nextState = this.determineNextState(transition, params);
    if (!nextState) return false;

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
    // Execute exit handlers
    this.executeStateHandler(prevState, "exit", params);

    // Update state
    this.previousState = prevState;
    this.state = nextState;

    let callbackResult;
    // Execute state change hook
    if (typeof this.options.onStateChanged === "function") {
      callbackResult = this.options.onStateChanged(
        prevState,
        nextState,
        params,
      );
    }

    if (callbackResult && typeof callbackResult.then === "function") {
      // If it returns a promise, wait for completion before executing enter handler
      callbackResult
        .then(() => {
          this.executeStateHandler(nextState, "enter", params);
        })
        .catch((error) => {
          console.error("Animation promise rejected:", error);
          // Still execute enter handler even if animation fails
          this.executeStateHandler(nextState, "enter", params);
        });
    } else {
      // If it doesn't return a promise, execute enter handler immediately
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
    if (!stateConfig) return;

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
}

export default StateMachine;
