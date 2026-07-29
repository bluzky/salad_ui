// saladui/core/hook.js
import { registry } from "./factory.js";

const SaladUIHook = {
  mounted() {
    this.initComponent();
    this.dialogServerState = this.getDialogServerState();
    this.setupServerEvents();
  },

  getDialogServerState() {
    if (this.el.getAttribute("data-component") !== "dialog") return null;

    const open = this.el.dataset.open;
    if (open === undefined) return null;

    return open === "true" ? "open" : "closed";
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
      const isDialog = this.el.getAttribute("data-component") === "dialog";
      const nextDialogServerState = this.getDialogServerState();
      const preservedState =
        isDialog &&
        (nextDialogServerState === null ||
          nextDialogServerState === this.dialogServerState)
          ? this.component.state
          : null;

      this.component.destroy();
      this.component = null;

      if (preservedState) {
        this.el.dataset.saladuiPreservedState = preservedState;
      }

      this.initComponent();
      this.dialogServerState = this.getDialogServerState();
      //   this.component.parseOptions();
      //   this.component.setupEvents();
      //   this.component.updatePartsVisibility();
      //   this.component.updateUI();
    }
  },

  destroyed() {
    this.component?.destroy();
    this.component = null;
    this.dialogServerState = null;
  },
};

export { SaladUIHook };
