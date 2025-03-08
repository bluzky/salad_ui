// saladui/factory.js
class ComponentRegistry {
  constructor() {
    this.registry = new Map();
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

    // Call setupEvents after the component is fully initialized
    instance.setupEvents();

    return instance;
  }
}

const registry = new ComponentRegistry();

export { registry };
