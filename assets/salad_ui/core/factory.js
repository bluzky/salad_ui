// saladui/core/factory.js
class ComponentRegistry {
  constructor() {
    this.registry = new Map();
  }

  register(type, ComponentClass) {
    this.registry.set(type, ComponentClass);
    return this;
  }

  create(type, el, hookContext, options = {}) {
    const ComponentClass = this.registry.get(type);
    if (!ComponentClass) {
      console.error(`Component type '${type}' not registered`);
      return null;
    }

    const instance = new ComponentClass(el, hookContext, options);

    // Call setupEvents after the component is fully initialized
    instance.setupEvents();
    instance.afterMount();

    return instance;
  }
}

const registry = new ComponentRegistry();

export { registry };
