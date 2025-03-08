// saladui/factory.js
import Component from './core';

class ComponentRegistry {
  constructor() {
    this.registry = new Map();
    this.register('component', Component);
  }

  register(type, ComponentClass) {
    this.registry.set(type, ComponentClass);
    return this;
  }

  create(type, el, hookContext) {
    const ComponentClass = this.registry.get(type) || this.registry.get('component');
    return new ComponentClass(el, hookContext);
  }
}

function defineComponent(type, config = {}) {
  class CustomComponent extends Component {
    constructor(el, hookContext) {
      super(el, hookContext);

      if (config.init) {
        config.init.call(this);
      }
    }

    getStateMachine() {
      return config.stateMachine || super.getStateMachine();
    }

    setupComponentEvents() {
      super.setupComponentEvents();
      if (config.setupEvents) {
        config.setupEvents.call(this);
      }
    }
  }

  if (config.methods) {
    Object.entries(config.methods).forEach(([name, fn]) => {
      CustomComponent.prototype[name] = fn;
    });
  }

  return CustomComponent;
}

const registry = new ComponentRegistry();

export { registry, defineComponent };
