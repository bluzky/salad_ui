// saladui/components/popover.js
import Component from "../core/component";
import SaladUI from "../index";
import Positioner from "../core/positioner";

class PopoverComponent extends Component {
  constructor(el, hookContext) {
    super(el, hookContext);

    // Initialize core properties
    this.trigger = this.getPart("trigger");
    this.positioner = this.getPart("positioner");
    this.content = this.positioner
      ? this.positioner.querySelector("[data-part='content']")
      : null;

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = ["Escape"];
  }

  getStateMachine() {
    return {
      closed: {
        enter: "onClosedEnter",
        exit: "onClosedExit",
        keyMap: {},
        transitions: {
          open: "open",
        },
        hidden: {
          positioner: true, // Hide the positioner in closed state
        },
      },
      open: {
        enter: "onOpenEnter",
        exit: "onOpenExit",
        keyMap: {
          Escape: "close",
        },
        transitions: {
          close: "closed",
        },
        hidden: {
          positioner: false, // Show the positioner in open state
        },
      },
    };
  }

  getAriaConfig() {
    return {
      trigger: {
        all: {
          haspopup: "dialog",
        },
        open: {
          expanded: "true",
        },
        closed: {
          expanded: "false",
        },
      },
      content: {
        all: {
          role: "dialog",
        },
      },
    };
  }

  setupComponentEvents() {
    super.setupComponentEvents();

    // Close on click outside
    document.addEventListener("click", this.handleClickOutside.bind(this));

    // Handle window resize to update position
    window.addEventListener("resize", this.onWindowResize.bind(this));

    // Handle scroll events on parent containers
    this.setupScrollListeners();
  }

  setupScrollListeners() {
    // Find all scrollable parents and add scroll listeners
    let parent = this.el.parentElement;
    while (parent && parent !== document.body) {
      if (this.isScrollable(parent)) {
        parent.addEventListener("scroll", this.onScroll.bind(this));
      }
      parent = parent.parentElement;
    }

    // Add scroll listener to window as well
    window.addEventListener("scroll", this.onScroll.bind(this));
  }

  isScrollable(element) {
    const style = window.getComputedStyle(element);
    return (
      style.overflow === "auto" ||
      style.overflow === "scroll" ||
      style.overflowX === "auto" ||
      style.overflowX === "scroll" ||
      style.overflowY === "auto" ||
      style.overflowY === "scroll"
    );
  }

  onScroll() {
    if (this.state === "open") {
      this.updatePosition();
    }
  }

  onWindowResize() {
    if (this.state === "open") {
      this.updatePosition();
    }
  }

  handleClickOutside(event) {
    if (this.state === "open" && !this.el.contains(event.target)) {
      this.transition("close");
    }
  }

  onOpenEnter() {
    // Wait for the positioner to be visible before updating position
    setTimeout(() => this.updatePosition(), 0);
    this.pushEvent("opened");
  }

  onClosedEnter() {
    this.pushEvent("closed");
  }

  updatePosition() {
    if (!this.positioner || !this.content || !this.trigger) return;

    // Get placement options from attributes
    const placement = this.positioner.getAttribute("data-side") || "bottom";
    const alignment = this.positioner.getAttribute("data-align") || "center";
    const sideOffset = parseInt(
      this.positioner.getAttribute("data-side-offset") || "8",
      10,
    );

    // Find container with overflow:hidden
    const container = Positioner.findOverflowContainer(this.el);

    // Reset position for fresh calculation
    this.positioner.style.top = "0";
    this.positioner.style.left = "0";

    // Calculate position
    const {
      x,
      y,
      placement: actualPlacement,
    } = Positioner.position(this.content, this.trigger, {
      placement,
      alignment,
      container,
      flip: true,
      shift: true,
      sideOffset,
      offset: { x: 0, y: 0 },
    });

    // Apply position relative to the popover component
    const elRect = this.el.getBoundingClientRect();
    const triggerRect = this.trigger.getBoundingClientRect();

    const relativeX = x - elRect.left;
    const relativeY = y - elRect.top;

    // Apply position
    this.positioner.style.left = `${relativeX}px`;
    this.positioner.style.top = `${relativeY}px`;

    // Update side attribute if it changed
    if (actualPlacement !== placement) {
      this.positioner.setAttribute("data-side", actualPlacement);
    }
  }

  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
    window.removeEventListener("resize", this.onWindowResize);
    window.removeEventListener("scroll", this.onScroll);

    // Remove scroll listeners from parent elements
    let parent = this.el.parentElement;
    while (parent && parent !== document.body) {
      if (this.isScrollable(parent)) {
        parent.removeEventListener("scroll", this.onScroll);
      }
      parent = parent.parentElement;
    }
  }
}

// Register the component
SaladUI.register("popover", PopoverComponent);

export default PopoverComponent;
