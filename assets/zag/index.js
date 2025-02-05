import { Component } from "./component";
import { camelize } from "./utils";

export function createZagHook(components) {
  return {
    mounted() {
      try {
        this.component = new Component(this.el, this.context(), components);
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

    parseListeners() {
      let listeners = {};
      if (this.el.dataset.listeners) {
        const listenersConfig = JSON.parse(this.el.dataset.listeners);
        listenersConfig.forEach((listener) => {
          if (listener.length === 0) {
            console.warn(
              "Invalid listener format. Please provide at least an event name to listen to."
            );
            return;
          }

          let event, env;
          if (listener.length === 1) {
            event = listener[0];
            // default to a client only enviroment when no enviroment is provided
            env = ["client"];
          } else {
            [event, ...env] = listener;
          }
          // the event will be dispatched and/or pushed with this name
          const eventFacade = `${this.el.dataset.component}:${event.replace(
            /_/g,
            "-"
          )}`;

          listeners[camelize(event)] = (detail) => {
            if (env.includes("client")) {
              window.dispatchEvent(new CustomEvent(eventFacade, { detail }));
            }

            if (env.includes("server")) {
              this.pushEvent(eventFacade, detail);
            }
          };
        });
      }

      return listeners;
    },

    context() {
      try {
        const options = this.parseOptions();
        const listeners = this.parseListeners();
        return {
          id: this.el.id || "",
          ...options,
          ...listeners,
        };
      } catch (error) {
        console.error("Error parsing context:", error);
        return {};
      }
    },
  };
}
