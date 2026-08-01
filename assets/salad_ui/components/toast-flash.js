// saladui/components/toast-flash.js
import Component from "../core/component.js";
import SaladUI from "../index.js";

const KIND_TO_VARIANT = {
  info: "info",
  error: "error",
  warning: "warning",
  success: "success",
};

/**
 * Bridges `@flash` into toasts on a `<.toaster>` via a same-frame DOM event,
 * instead of rendering flash as children of the toaster itself — that would
 * patch the toaster's own hook boundary and tear down its live stack/timers
 * every time `put_flash/3` is called. See docs/toast_component_spec.md §10.
 */
class ToastFlashBridge extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext, initialState: "idle" });
  }

  getComponentConfig() {
    return { stateMachine: { idle: { transitions: {} } } };
  }

  afterMount() {
    const entries = this.parseEntries();
    const toaster = document.getElementById(this.el.dataset.toaster);
    if (!toaster) return;

    entries.forEach(({ kind, message }) => {
      toaster.dispatchEvent(
        new CustomEvent("salad_ui:command", {
          detail: {
            command: "add",
            params: {
              variant: KIND_TO_VARIANT[kind] ?? "default",
              title: message,
            },
          },
        }),
      );

      // Built-in LiveView event, no handle_event needed — same mechanism
      // core_components.ex already uses for the default <.flash>.
      this.hook.pushEvent("lv:clear-flash", { key: kind });
    });
  }

  parseEntries() {
    try {
      return JSON.parse(this.el.dataset.entries || "[]");
    } catch (error) {
      console.error("SaladUI: could not parse toast-flash entries", error);
      return [];
    }
  }
}

SaladUI.register("toast-flash", ToastFlashBridge);

export default ToastFlashBridge;
