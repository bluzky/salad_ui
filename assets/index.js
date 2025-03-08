// saladui/index.js
import Component from './core';
import { registry } from './factory';
import { SaladUIHook } from './hook';

function register(type, ComponentClass) {
  registry.register(type, ComponentClass);
}

const SaladUI = {
  Component,
  register,
  SaladUIHook
};

export default SaladUI;
