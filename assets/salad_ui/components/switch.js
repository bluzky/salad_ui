// saladui/components/switch.js
import Component from "../core/component";
import SaladUI from "../index";

class SwitchComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });

    // Initialize state based on checked attribute or data-state
    this.initialState = this.el.getAttribute("data-state");
  }

  getComponentConfig() {
    return {
      stateMachine: {
        checked: {
          enter: "onCheckedEnter",
          transitions: {
            toggle: "unchecked",
          },
        },
        unchecked: {
          enter: "onUncheckedEnter",
          transitions: {
            toggle: "checked",
          },
        },
      },
      events: {
        checked: {
          mouseMap: {
            root: {
              click: "toggleSwitch",
            },
          },
          keyMap: {
            " ": "toggleSwitch",
            Enter: "toggleSwitch",
          },
        },
        unchecked: {
          mouseMap: {
            root: {
              click: "toggleSwitch",
            },
          },
          keyMap: {
            " ": "toggleSwitch",
            Enter: "toggleSwitch",
          },
        },
      },
      ariaConfig: {
        root: {
          all: {
            role: "switch",
          },
          checked: {
            checked: "true",
          },
          unchecked: {
            checked: "false",
          },
        },
      },
    };
  }

  toggleSwitch(e) {
    if (this.disabled) return;
    this.transition("toggle");
    // prevent click event handler from handling twice after the first one toggle the state
    // the second one reverse state immediately
    e.stopImmediatePropagation();
  }

  setupComponentEvents() {
    // Set up keyboard navigation
    this.el.setAttribute(
      "tabindex",
      this.el.getAttribute("disabled") === "true" ? "-1" : "0",
    );
    this.config.preventDefaultKeys = [" ", "Enter"];
  }

  onCheckedEnter(e) {
    // Update hidden checkbox input
    const checkbox = this.el.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.checked = true;
    }

    // Notify of value change
    this.pushEvent("checked-changed", { value: true });
  }

  onUncheckedEnter(e) {
    // Update hidden checkbox input
    const checkbox = this.el.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.checked = false;
    }

    // Notify of value change
    this.pushEvent("checked-changed", { value: false });
  }
}

// Register the component
SaladUI.register("switch", SwitchComponent);

export default SwitchComponent;
