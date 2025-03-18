// saladui/core/hook.js
import { registry } from "./factory";

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

  updated() {
    if (this.component) {
      this.component.parseOptions();
      this.component.updatePartsVisibility();
      this.component.updateUI();
    }
  },

  destroyed() {
    this.component = null;
  },
};

export { SaladUIHook };
