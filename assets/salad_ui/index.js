// saladui/index.js
import Component from "./core/component.js";
import { registry } from "./core/factory.js";
import { SaladUIHook } from "./core/hook.js";

function register(type, ComponentClass) {
  registry.register(type, ComponentClass);
}

/**
 * Client-only toast API, mirroring Sonner's `import { toast } from "sonner"`
 * ergonomics for pages/components that want to toast without a LiveView
 * round trip. Targets whichever `<.toaster>` mounted first on the page.
 */
function getToaster() {
  return (
    document.querySelector('[data-component="toast"]')?.__toastComponent || null
  );
}

function dispatchToast(variant, message, opts = {}) {
  const toaster = getToaster();
  if (!toaster) {
    console.error("SaladUI: toast() called but no <.toaster> is mounted");
    return null;
  }

  return toaster.handleCommand("add", { ...opts, variant, title: message });
}

function toast(message, opts) {
  return dispatchToast("default", message, opts);
}

toast.success = (message, opts) => dispatchToast("success", message, opts);
toast.error = (message, opts) => dispatchToast("error", message, opts);
toast.warning = (message, opts) => dispatchToast("warning", message, opts);
toast.info = (message, opts) => dispatchToast("info", message, opts);
toast.message = (message, opts = {}) =>
  dispatchToast(opts.variant || "default", message, opts);

toast.dismiss = (id) => {
  getToaster()?.handleCommand("dismiss", id ? { id } : {});
};

toast.update = (id, opts = {}) => {
  getToaster()?.handleCommand("update", { ...opts, id });
};

const SaladUI = {
  Component,
  register,
  SaladUIHook,
};

export default SaladUI;
export { toast };
