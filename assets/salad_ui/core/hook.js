// saladui/core/hook.js
import { registry } from "./factory.js";

const SaladUIHook = {
  mounted() {
    this.initComponent();
    this.setupServerEvents();
  },

  initComponent() {
    const el = this.el;
    const componentType = el.getAttribute("data-component");

    if (!componentType) {
      console.error(
        "SaladUI: Component element is missing data-component attribute",
      );
      return;
    }

    // The registry.create method will handle creating the component and calling setupEvents
    this.component = registry.create(componentType, el, this);
  },

  setupServerEvents() {
    if (!this.component) return;

    this.handleEvent("saladui:command", ({ command, params = {}, target }) => {
      if (target && target !== this.el.id) return;

      if (this.component) {
        this.component.handleCommand(command, params);
      }
    });
  },

  beforeUpdate() {
    this.component?.beforeUpdate?.();
  },

  updated() {
    if (this.component) {
      if (this.component.skipReinitialize(this.el)) return;

      this.component.destroy();
      this.component = null;
      this.initComponent();
    }
  },

  destroyed() {
    this.component?.destroy();
    this.component = null;
  },
};

export { SaladUIHook };
