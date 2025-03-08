// saladui/hook.js
import { registry } from './factory';

const SaladUIHook = {
  mounted() {
    this.initComponent();
    this.setupServerEvents();
  },

  initComponent() {
    const el = this.el;
    const componentType = el.getAttribute('data-component');

    if (!componentType) {
      console.error("SaladUI: Component element is missing data-component attribute");
      return;
    }

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

    this.handleEvent("saladui:event", ({ event, params = {}, target }) => {
      if (target && target !== this.el.id) return;

      if (this.component && typeof this.component[event] === 'function') {
        this.component[event](params);
      }
    });
  },

  updated() {
    if (this.component) {
      this.component.parseOptions();
      this.component.updateUI();
    }
  },

  destroyed() {
    this.component = null;
  }
};

export { SaladUIHook};
