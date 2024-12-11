import { Component } from "./component";
import { camelize } from "./utils";

export default {
  mounted() {
    try {
      this.component = new Component(this.el, this.context());
      this.component.init();
    } catch (error) {
      console.error("Error mounting component:", error);
    }
  },

  updated() {
    // re-render the component when the context changes
    this.component.render();
  },

  destroyed() {
    try {
      this.component.destroy();
    } catch (error) {
      console.error("Error destroying component:", error);
    }
  },

  parseOptions() {
    let options = {};

    if (this.el.dataset.options) {
      options = JSON.parse(this.el.dataset.options);
    }

    return options;
  },

  // this parse listener list and return an array of functions
  // each listener is a string with the format "type:action"
  parseHandler(handlerArr) {
    return handlerArr.map((str) => {
      const index = str.indexOf(":");
      if (index !== -1) {
        const handlerType = str.substring(0, index);
        const handlerAction = str.substring(index + 1);
        switch (handlerType) {
          case "push":
            // push event to server
            return (details) =>
              handlerAction != ""
                ? this.pushEvent(handlerAction, details)
                : null;
          case "exec":
            // execute javascript code from string
            return window.eval(handlerAction);
          default:
            throw new Error("Invalid handler type");
        }
      } else {
        throw new Error("Delimiter not found in handler string");
      }
    });
  },

  parseListeners() {
    let listeners = {};
    if (this.el.dataset.listeners) {
      const listenersConfig = JSON.parse(this.el.dataset.listeners);
      Object.keys(listenersConfig).map((event) => {
        const handlers = this.parseHandler(listenersConfig[event]);

        listeners[`on${camelize(event, true)}Change`] = (details) => {
          handlers.forEach((handler) => handler(details, this.el));
        };
      });
    }

    return listeners;
  },

  parseCollection() {
    if (this.el.dataset.collection) {
      const items = JSON.parse(this.el.dataset.collection);
      return { items };
    }
  },

  context() {
    try {
      const options = this.parseOptions();
      const listeners = this.parseListeners();
      const collection = this.parseCollection();
      console.log("listeners", listeners);
      return {
        id: this.el.id || "",
        ...options,
        ...listeners,
        ...(collection && { collection }),
      };
    } catch (error) {
      console.error("Error parsing context:", error);
      return {};
    }
  },
};
