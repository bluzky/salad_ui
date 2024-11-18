import * as componentsModules from "./index";
import { camelize, getBooleanOption, getOption, normalizeProps } from "./utils";

class Component {
  el;
  context;
  service;
  api;
  cleanupFunctions = new Map();

  constructor(el, context) {
    this.el = el;
    this.context = context;
  }

  init() {
    this.initializeComponent();
    this.render();

    // Re-render on state updates
    this.service.subscribe(() => {
      this.api = this.initApi(this.componentModule);
      this.render();
    });

    this.service.start();
  }

  initializeComponent() {
    const componentName = this.el.dataset.component;

    if (!componentName || !componentsModules[componentName]) {
      console.error(`Component "${componentName}" not found.`);
      return;
    }

    this.componentModule = componentsModules[componentName];
    this.service = this.initService(this.componentModule, this.context);
    this.api = this.initApi(this.componentModule);
  }

  destroy() {
    this.service.stop();
    this.cleanup();
  }

  cleanup() {
    for (const cleanupFn of this.cleanupFunctions.values()) {
      cleanupFn();
    }
    this.cleanupFunctions.clear();
  }

  parts(el) {
    try {
      return JSON.parse(el.dataset.parts || "[]");
    } catch (error) {
      console.error("Error parsing parts:", error);
      return [];
    }
  }

  initService(component, context) {
    return component.machine(context);
  }

  initApi(component) {
    return component.connect(
      this.service.state,
      this.service.send,
      normalizeProps
    );
  }

  render() {
    this.cleanup();

    for (const part of ["root", ...this.parts(this.el)]) {
      this.renderPart(this.el, part, this.api);
    }

    for (const item of this.el.querySelectorAll("[data-part='item']")) {
      this.renderItem(item);
    }
  }

  renderPart(root, name, api, opts = {}) {
    const part =
      name === "root" ? root : root.querySelector(`[data-part='${name}']`);

    const getterName = `get${camelize(name, true)}Props`;

    if (part && api[getterName]) {
      const cleanup = this.spreadProps(part, api[getterName](opts));
      this.cleanupFunctions.set(part, cleanup);
    }
  }

  renderItem(item) {
    const value = item.dataset.value;
    if (!value) {
      console.error("Missing `data-value` attribute on item.");
      return;
    }

    const cleanup = this.spreadProps(item, this.api.getItemProps({ value }));
    this.cleanupFunctions.set(item, cleanup);

    for (const part of this.parts(item)) {
      this.renderPart(item, `item-${part}`, this.api, { value });
    }
  }

  spreadProps(el, attrs) {
    const oldAttrs = el;
    const prevAttrsMap = new WeakMap();
    const attrKeys = Object.keys(attrs);

    const addEvent = (event, callback) => {
      el.addEventListener(event.toLowerCase(), callback);
    };

    const removeEvent = (event, callback) => {
      el.removeEventListener(event.toLowerCase(), callback);
    };

    const setup = (attr) => addEvent(attr.substring(2), attrs[attr]);
    const teardown = (attr) => removeEvent(attr.substring(2), attrs[attr]);

    const apply = (attrName) => {
      // avoid overriding element's id because LiveView will lose
      // track of it and DOM patching will not work as expected
      if (attrName === "id") return;

      let value = attrs[attrName];
      const oldValue = oldAttrs[attrName];
      if (value === oldValue) return;

      if (typeof value === "boolean") value = value || undefined;

      if (value != null) {
        if (["value", "checked", "htmlFor", "id"].includes(attrName)) {
          el[attrName] = value;
        } else {
          el.setAttribute(attrName.toLowerCase(), value);
        }
      } else {
        el.removeAttribute(attrName.toLowerCase());
      }
    };

    attrKeys.forEach((key) => {
      if (key.startsWith("on")) setup(key);
      else apply(key);
    });

    prevAttrsMap.set(el, attrs);

    return () => {
      attrKeys.filter((key) => key.startsWith("on")).forEach(teardown);
    };
  }
}

export default {
  mounted() {
    try {
      this.component = new Component(this.el, this.context());
      this.component.init();
    } catch (error) {
      console.error("Error mounting component:", error);
    }
  },

  destroyed() {
    try {
      this.component.destroy();
    } catch (error) {
      console.error("Error destroying component:", error);
    }
  },

  context() {
    try {
      const options = this.el.dataset.options
        ? Object.fromEntries(
            Object.entries(JSON.parse(this.el.dataset.options)).map(
              ([key, value]) => [
                camelize(key),
                value === "bool"
                  ? getBooleanOption(this.el, key)
                  : getOption(this.el, key, value),
              ]
            )
          )
        : {};

      const listeners = this.el.dataset.listeners
        ? JSON.parse(this.el.dataset.listeners)
            .map((event) => ({
              [`on${camelize(event, true)}Change`]: (details) =>
                this.pushEvent(event, details),
            }))
            .reduce((acc, listener) => ({ ...acc, ...listener }), {})
        : {};

      return { id: this.el.id || "", ...options, ...listeners };
    } catch (error) {
      console.error("Error parsing context:", error);
      return {};
    }
  },
};
