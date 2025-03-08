// saladui/index.js
import Component from './core';
import { registry, defineComponent } from './factory';
import { SaladUIHook } from './hook';

function register(type, ComponentClass) {
  registry.register(type, ComponentClass);
}

const SaladUI = {
  Component,
  defineComponent,
  register,
  SaladUIHook
};

export default SaladUI;
