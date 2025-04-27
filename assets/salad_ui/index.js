// saladui/index.js
import Component from "./core/component";
import { registry } from "./core/factory";
import { SaladUIHook } from "./core/hook";

function register(type, ComponentClass) {
  registry.register(type, ComponentClass);
}

const SaladUI = {
  Component,
  register,
  SaladUIHook,
};

export default SaladUI;
