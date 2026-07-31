// saladui/components/slider.js
import Component from "../core/component.js";
import SaladUI from "../index.js";

class SliderComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });

    // Get slider elements
    this.track = this.getPart("track");
    this.range = this.getPart("range");
    this.thumb = this.getPart("thumb");
    this.input = this.el.querySelector('input[type="hidden"]');

    // Initialize values
    this.parseValues();

    // Add drag handling
    this.isDragging = false;
    this.setupDragHandling();
    this.config.preventDefaultKeys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowDown",
      "ArrowUp",
      "Home",
      "End",
    ];

    // Set initial ARIA attributes and position
    this.updateUI();
    this.updatePosition();
  }

  parseValues() {
    // Get values from options with defaults
    this.min = parseFloat(this.options.min || 0);
    this.max = parseFloat(this.options.max || 100);
    this.step = parseFloat(this.options.step || 1);
    if (!Number.isFinite(this.min)) {
      this.min = 0;
    }
    if (!Number.isFinite(this.max)) {
      this.max = 100;
    }
    if (!Number.isFinite(this.step) || this.step <= 0) {
      this.step = 1;
    }
    this.disabled = !!this.options.disabled;

    // Get value from data attribute, fallback to defaultValue from options, then to min
    const dataValue = this.el.dataset.value;
    const defaultValue = this.options.defaultValue;
    this.value = parseFloat(
      dataValue !== undefined && dataValue !== null
        ? dataValue
        : defaultValue !== undefined
          ? defaultValue
          : this.min,
    );

    if (!Number.isFinite(this.value)) {
      this.value = this.min;
    }

    // Clamp value to min/max
    this.value = Math.max(this.min, Math.min(this.max, this.value));
  }

  getComponentConfig() {
    return {
      stateMachine: {
        idle: {
          enter: "onIdleEnter",
          transitions: {
            drag: "dragging",
          },
        },
        dragging: {
          enter: "onDraggingEnter",
          exit: "onDraggingExit",
          transitions: {
            end: "idle",
          },
        },
      },
      events: {
        idle: {
          keyMap: {
            ArrowLeft: () => this.decrementValue(),
            ArrowRight: () => this.incrementValue(),
            ArrowDown: () => this.decrementValue(),
            ArrowUp: () => this.incrementValue(),
            Home: () => this.setBoundaryValue(this.min),
            End: () => this.setBoundaryValue(this.max),
          },
        },
        dragging: {
          // These are handled by event listeners
        },
      },
      ariaConfig: {
        root: {
          all: {
            role: "slider",
            valuemin: () => this.min?.toString(),
            valuemax: () => this.max?.toString(),
            valuenow: () => this.value?.toString(),
            valuetext: () => this.value?.toString(),
            orientation: "horizontal",
            disabled: () => (this.disabled ? "true" : null),
          },
        },
      },
    };
  }

  setupDragHandling() {
    // Set up event handlers with proper binding
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    // Mouse events
    this.el.addEventListener("mousedown", this.onPointerDown);

    // Touch events
    this.el.addEventListener("touchstart", this.onPointerDown, {
      passive: false,
    });
  }

  onIdleEnter() {
    // Set proper tabindex when component is idle (not being dragged)
    this.el.setAttribute("tabindex", this.disabled ? "-1" : "0");
  }

  onDraggingEnter() {
    // Add global event listeners
    document.addEventListener("mousemove", this.onPointerMove);
    document.addEventListener("touchmove", this.onPointerMove, {
      passive: false,
    });
    document.addEventListener("mouseup", this.onPointerUp);
    document.addEventListener("touchend", this.onPointerUp);
  }

  onDraggingExit() {
    // Remove global event listeners
    document.removeEventListener("mousemove", this.onPointerMove);
    document.removeEventListener("touchmove", this.onPointerMove);
    document.removeEventListener("mouseup", this.onPointerUp);
    document.removeEventListener("touchend", this.onPointerUp);
  }

  onPointerDown(event) {
    // Skip if disabled
    if (this.disabled) return;

    // Prevent default to avoid text selection during drag
    event.preventDefault();

    // Handle mousedown or touchstart
    this.transition("drag");

    // Update value based on pointer position
    this.updateValueFromPointer(event);
  }

  onPointerMove(event) {
    if (this.disabled) return;

    // Prevent default to avoid scrolling during drag
    event.preventDefault();

    // Update value based on pointer position
    this.updateValueFromPointer(event);
  }

  onPointerUp() {
    if (this.disabled) return;

    // End dragging
    this.transition("end");

    // Notify of value change
    this.dispatchFormEvents();
    this.pushEvent("value-changed", { value: this.value });
  }

  updateValueFromPointer(event) {
    // Get coordinates depending on event type
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;

    // Get track bounds
    const trackRect = this.track.getBoundingClientRect();
    if (trackRect.width === 0) return;

    // Calculate percentage within track
    let percentage = Math.max(
      0,
      Math.min(1, (clientX - trackRect.left) / trackRect.width),
    );

    // Calculate value based on percentage
    const rawValue = this.min + percentage * (this.max - this.min);

    // Snap to step
    const steppedValue = this.snapToStep(rawValue);

    // Set and update
    this.setValueAndUpdate(steppedValue);
  }

  incrementValue() {
    if (this.disabled) return;

    this.setValueAndUpdate(Math.min(this.max, this.value + this.step));
    this.dispatchFormEvents();
    this.pushEvent("value-changed", { value: this.value });
  }

  decrementValue() {
    if (this.disabled) return;

    this.setValueAndUpdate(Math.max(this.min, this.value - this.step));
    this.dispatchFormEvents();
    this.pushEvent("value-changed", { value: this.value });
  }

  setBoundaryValue(value) {
    if (this.disabled) return;

    this.setValueAndUpdate(value);
    this.dispatchFormEvents();
    this.pushEvent("value-changed", { value: this.value });
  }

  snapToStep(value) {
    if (value <= this.min) return this.min;
    if (value >= this.max) return this.max;

    const snapped =
      this.min + Math.round((value - this.min) / this.step) * this.step;

    return Math.max(this.min, Math.min(this.max, snapped));
  }

  setValueAndUpdate(newValue) {
    // Ensure value is snapped and within bounds
    this.value = this.snapToStep(newValue);

    // Update visual position
    this.updatePosition();

    // Update ARIA attributes
    this.el.setAttribute("aria-valuenow", this.value.toString());
    this.el.setAttribute("aria-valuetext", this.value.toString());

    if (this.input) {
      this.input.value = this.value.toString();
    }
  }

  dispatchFormEvents() {
    if (!this.input) return;

    this.input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  updatePosition() {
    // Calculate percentage for positioning
    const percentage =
      this.max === this.min
        ? 0
        : ((this.value - this.min) / (this.max - this.min)) * 100;

    // Update range width
    this.range.style.width = `${percentage}%`;

    // Get track and thumb dimensions
    const trackRect = this.track.getBoundingClientRect();
    const thumbRect = this.thumb.getBoundingClientRect();

    // Calculate the percentage offset needed to keep thumb fully within track
    // This accounts for the thumb's width relative to the track
    const thumbHalfWidthPercentage =
      trackRect.width === 0 ? 0 : (thumbRect.width / 2 / trackRect.width) * 100;

    // Constrain the thumb position to keep it fully inside the track
    const thumbPercentage = Math.max(
      thumbHalfWidthPercentage,
      Math.min(100 - thumbHalfWidthPercentage, percentage),
    );

    // Update thumb position
    this.thumb.style.left = `${thumbPercentage}%`;
    this.thumb.style.transform = "translateX(-50%)";
  }

  // Handle direct server-side commands
  handleCommand(command, params) {
    if (command === "setValue") {
      this.setValueAndUpdate(parseFloat(params.value));
      return true;
    }
    return super.handleCommand(command, params);
  }

  // Clean up
  beforeDestroy() {
    document.removeEventListener("mousemove", this.onPointerMove);
    document.removeEventListener("touchmove", this.onPointerMove);
    document.removeEventListener("mouseup", this.onPointerUp);
    document.removeEventListener("touchend", this.onPointerUp);
    // Remove local event listeners
    this.el.removeEventListener("mousedown", this.onPointerDown);
    this.el.removeEventListener("touchstart", this.onPointerDown);
  }
}

// Register component
SaladUI.register("slider", SliderComponent);

export default SliderComponent;
