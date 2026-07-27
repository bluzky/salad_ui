// saladui/index.js
import Component from "./core/component.js";
import { registry } from "./core/factory.js";
import { SaladUIHook } from "./core/hook.js";

function register(type, ComponentClass) {
  registry.register(type, ComponentClass);
}

const SaladUI = {
  Component,
  register,
  SaladUIHook,
};

export default SaladUI;
