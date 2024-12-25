import * as componentsModules from "./index";
import { camelize, normalizeProps } from "./utils";

/*
  document for component
   */

export class Component {
  el; // root element
  context; // context passed to the component
  service; // state machine service
  api; // api object
  cleanupFunctions = new Map(); // cleanup functions for event listeners
  prevAttrsMap = new WeakMap();

  constructor(el, context) {
    this.el = el;
    this.context = context;
  }

  // Initialize the component
  init() {
    this.initializeComponent();
    this.render();

    // Re-render on state updates
    this.service.subscribe((e) => {
      // console.log("State updated", e.event);
      this.api = this.initApi(this.componentModule);
      this.render();
    });

    this.service.start();
  }

  destroy() {
    this.service.stop();
    this.cleanup();
  }

  // clean up event listeners
  cleanup() {
    for (const cleanupFn of this.cleanupFunctions.values()) {
      cleanupFn();
    }
    this.cleanupFunctions.clear();
  }

  /*----------------- Private methods -----------------*/
  initializeComponent() {
    // component name is set on the root element via data-component attribute
    const componentName = this.el.dataset.component;

    if (!componentName || !componentsModules[componentName]) {
      console.error(`Component "${componentName}" not found.`);
      return;
    }

    this.componentModule = componentsModules[componentName];
    this.service = this.initService(this.componentModule, this.context);
    this.api = this.initApi(this.componentModule);
  }

  initService(component, context) {
    // TODO experiment
    if (context.collection) {
      context.collection = component.collection(context.collection);
    }
    return component.machine(context);
  }

  initApi(component) {
    return component.connect(
      this.service.state,
      this.service.send,
      normalizeProps,
    );
  }

  render() {
    this.cleanup();

    for (const part of this.parts(this.el)) {
      if (part === "item") continue;
      this.renderPart(this.el, part, this.api);
    }

    for (const item of this.el.querySelectorAll("[data-part='item']")) {
      this.renderItem(item);
    }
  }

  renderPart(root, name, api, opts = {}) {
    const isRoot = name === root.dataset.part;
    const part = isRoot ? root : root.querySelector(`[data-part='${name}']`);

    const getterName = `get${camelize(name, true)}Props`;
    // console.log(getterName, opts);

    if (part && api[getterName]) {
      const cleanup = this.spreadProps(part, api[getterName](opts), isRoot);
      this.cleanupFunctions.set(part, cleanup);
    }
  }

  // Render an item in a list item
  renderItem(item) {
    let itemProps = {};
    if (item.dataset.props) {
      itemProps = JSON.parse(item.dataset.props);
    }
    // console.log("itemProps", this.api.getItemProps(itemProps));
    const cleanup = this.spreadProps(item, this.api.getItemProps(itemProps));
    this.cleanupFunctions.set(item, cleanup);

    for (const part of this.parts(item)) {
      this.renderPart(item, part, this.api, itemProps);
    }
  }

  // get parts from the element, default to an empty array
  // parts data is encoded json in the data-parts attribute
  parts(el) {
    try {
      return JSON.parse(el.dataset.parts || "[]");
    } catch (error) {
      console.error("Error parsing parts:", error);
      return [];
    }
  }

  // spread props to the element
  // if the prop is an event, update the event listener if it's new or changed
  // if the prop is an attribute, update the attribute value if it's new or changed
  spreadProps(node, attrs, isRoot = false) {
    const oldAttrs = this.prevAttrsMap.get(node) || {};
    const attrKeys = Object.keys(attrs);

    const addEvt = (eventName, listener) => {
      node.addEventListener(eventName.toLowerCase(), listener);
    };

    const remEvt = (eventName, listener) => {
      node.removeEventListener(eventName.toLowerCase(), listener);
    };

    const onEvents = (attr) => attr.startsWith("on");
    const others = (attr) => !attr.startsWith("on");

    const setup = (attr) => {
      const eventName = attr.substring(2);
      const newHandler = attrs[attr];
      const existingHandler = oldAttrs[attr];

      if (newHandler !== existingHandler) {
        addEvt(eventName, newHandler);
      }
    };

    const teardown = (attr) => remEvt(attr.substring(2), attrs[attr]);

    // update attribute value if it's new or changed
    const apply = (attrName) => {
      // avoid replacing id on root element because LiveView
      // will lose track of it and DOM patching will not work as expected
      if (attrName === "id" && isRoot) return;

      let value = attrs[attrName];

      const oldValue = oldAttrs[attrName];
      if (value === oldValue) return;

      if (typeof value === "boolean") {
        value = value || undefined;
      }

      if (value != null) {
        if (["value", "checked", "htmlFor"].includes(attrName)) {
          node[attrName] = value;
        } else {
          node.setAttribute(attrName.toLowerCase(), value);
        }
        return;
      }

      node.removeAttribute(attrName.toLowerCase());
    };

    // reconcile old attributes
    for (const key in oldAttrs) {
      if (attrs[key] == null) {
        node.removeAttribute(key.toLowerCase());
      }
    }

    // clean old event listeners
    const oldEvents = Object.keys(oldAttrs).filter(onEvents);
    oldEvents.forEach((evt) => {
      remEvt(evt.substring(2), oldAttrs[evt]);
    });

    attrKeys.filter(onEvents).forEach(setup);
    attrKeys.filter(others).forEach(apply);
    this.prevAttrsMap.set(node, attrs);

    return function cleanup() {
      attrKeys.filter(onEvents).forEach(teardown);
    };
  }
}
