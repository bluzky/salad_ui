// saladui/components/radio_group.js
import Component from "../core";
import SaladUI from "../index";

class RadioGroupComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);

    // Initialize properties
    this.radioItems = this.el.querySelectorAll("[data-part='item']");
    this.selectedValue = this.options.initialValue || null;

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Enter",
      "Space",
    ];

    // Setup events and initialize
    this.setupItemEvents();
    this.updateSelectedRadio();
  }

  getStateMachine() {
    return {
      idle: {
        keyMap: {
          ArrowLeft: () => this.navigateRadio(-1),
          ArrowRight: () => this.navigateRadio(1),
          ArrowUp: () => this.navigateRadio(-1),
          ArrowDown: () => this.navigateRadio(1),
          Home: () => this.navigateRadio("first"),
          End: () => this.navigateRadio("last"),
          Space: () => this.selectFocusedRadio(),
          Enter: () => this.selectFocusedRadio(),
        },
        transitions: {
          select: "idle",
        },
      },
    };
  }

  getAriaConfig() {
    return {
      root: {
        all: {
          role: "radiogroup",
        },
      },
      item: {
        all: {
          role: "radio",
        },
        checked: {
          checked: "true",
        },
        unchecked: {
          checked: "false",
        },
      },
    };
  }

  setupComponentEvents() {
    super.setupComponentEvents();

    // Focus management for the entire group
    this.el.addEventListener("focus", () => {
      if (
        !this.el.contains(document.activeElement) ||
        document.activeElement === this.el
      ) {
        const selectedRadio = this.getSelectedRadio();
        if (selectedRadio) {
          selectedRadio.focus();
        } else {
          const firstRadio = this.getEnabledRadios()[0];
          if (firstRadio) firstRadio.focus();
        }
      }
    });
  }

  setupItemEvents() {
    this.radioItems.forEach((item) => {
      const input = item.querySelector('input[type="radio"]');
      if (!input) return;

      // Set data attributes for state tracking
      item.setAttribute("data-value", input.value);
      item.setAttribute("data-part", "item");
      item.setAttribute("data-state", input.checked ? "checked" : "unchecked");

      // Make the wrapper properly focusable
      item.setAttribute("tabindex", input.checked ? "0" : "-1");

      // Handle click events directly on the wrapper
      item.addEventListener("click", (e) => {
        e.preventDefault();
        // Don't trigger if clicking on a disabled item
        if (item.getAttribute("data-disabled") === "true" || input.disabled) {
          return;
        }
        this.selectRadio(input.value);
      });

      // Handle keyboard events on the wrapper
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (item.getAttribute("data-disabled") === "true" || input.disabled) {
            return;
          }
          this.selectRadio(input.value);
        }
      });
    });
  }

  selectRadio(value) {
    if (this.selectedValue === value) return;

    const prevValue = this.selectedValue;
    this.selectedValue = value;

    this.updateSelectedRadio();

    // Emit change event
    this.pushEvent("value-changed", {
      value,
      previousValue: prevValue,
    });
  }

  updateSelectedRadio() {
    this.radioItems.forEach((item) => {
      const input = item.querySelector('input[type="radio"]');
      const itemValue = item.getAttribute("data-value");
      const isSelected = itemValue === this.selectedValue;

      // Update the native input (for form submission)
      if (input) {
        input.checked = isSelected;
      }

      // Update the item state
      item.setAttribute("data-state", isSelected ? "checked" : "unchecked");

      // Update tabindex - only selected item should be focusable
      item.setAttribute("tabindex", isSelected ? "0" : "-1");
    });

    // If no item is selected yet, make the first enabled one focusable
    if (!this.selectedValue) {
      const firstEnabled = this.getEnabledRadios()[0];
      if (firstEnabled) {
        firstEnabled.setAttribute("tabindex", "0");
      }
    }
  }

  navigateRadio(direction) {
    const enabledRadios = this.getEnabledRadios();
    if (enabledRadios.length === 0) return;

    const currentIndex = this.getFocusedRadioIndex(enabledRadios);
    let newIndex;

    if (direction === "first") {
      newIndex = 0;
    } else if (direction === "last") {
      newIndex = enabledRadios.length - 1;
    } else {
      newIndex =
        (currentIndex + direction + enabledRadios.length) %
        enabledRadios.length;
    }

    const targetRadio = enabledRadios[newIndex];
    this.focusRadio(targetRadio);
  }

  selectFocusedRadio() {
    const focusedRadio = document.activeElement;
    if (this.radioItems && this.el.contains(focusedRadio)) {
      const value = focusedRadio.getAttribute("data-value");
      if (value) {
        this.selectRadio(value);
      }
    }
  }

  // Helper methods
  getEnabledRadios() {
    return Array.from(this.radioItems).filter((item) => {
      const input = item.querySelector('input[type="radio"]');
      return input && !input.disabled;
    });
  }

  getFocusedRadioIndex(radios) {
    const focusedElement = document.activeElement;
    return radios.indexOf(focusedElement);
  }

  getSelectedRadio() {
    return Array.from(this.radioItems).find((item) => {
      const input = item.querySelector('input[type="radio"]');
      return input && input.checked;
    });
  }

  focusRadio(radio) {
    if (radio) {
      radio.focus();
    }
  }
}

// Register the component
SaladUI.register("radio-group", RadioGroupComponent);

export default RadioGroupComponent;
