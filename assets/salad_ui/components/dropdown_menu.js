// saladui/components/dropdown_menu.js
import Component from "../core/component.js";
import SaladUI from "../index.js";
import PositionedElement from "../core/positioned-element.js";
import Menu from "./menu.js";

/**
 * DropdownMenuComponent class for SaladUI framework
 * Manages a dropdown menu with support for keyboard navigation and accessibility
 */
class DropdownMenuComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });

    // Initialize core properties
    this.trigger = this.getPart("trigger");
    this.positioner = this.getPart("positioner");
    this.content = this.positioner?.querySelector("[data-part='content']");
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleTriggerKeydown = this.handleTriggerKeydown.bind(this);

    if (this.content && !this.content.id) {
      this.content.id = `${this.el.id}-content`;
      this.updateUI();
    }

    this.menu = this.content
      ? new Menu(this.content, {
          hookContext,
          rootEl: this.el,
          onItemSelect: this.onItemSelect.bind(this),
        })
      : null;

    // Set keyboard navigation defaults
    this.config.preventDefaultKeys = ["Escape", "ArrowDown", " ", "Enter"];
  }

  getComponentConfig() {
    return {
      stateMachine: {
        closed: {
          enter: "onClosedEnter",
          transitions: {
            open: "open",
            toggle: "open",
          },
        },
        open: {
          enter: "onOpenEnter",
          transitions: {
            close: "closed",
            toggle: "closed",
          },
        },
      },
      events: {
        closed: {
          keyMap: {
            ArrowDown: "open",
            " ": "open",
            Enter: "open",
          },
        },
        open: {
          keyMap: {
            Escape: "close",
          },
        },
      },
      hiddenConfig: {
        closed: {
          positioner: true, // Hide the positioner in closed state
        },
        open: {
          positioner: false, // Show the positioner in open state
        },
      },
      ariaConfig: {
        trigger: {
          all: {
            haspopup: "menu",
            controls: () => this.content?.id || null,
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
            role: "menu",
          },
        },
      },
    };
  }

  initializePositionedElement() {
    if (this.positioner && this.trigger && !this.positionedElement) {
      const side = this.positioner.getAttribute("data-side") || "bottom";
      const align = this.positioner.getAttribute("data-align") || "start";
      const sideOffset = parseInt(
        this.positioner.getAttribute("data-side-offset") || "4",
        10,
      );
      const alignOffset = parseInt(
        this.positioner.getAttribute("data-align-offset") || "0",
        10,
      );

      // Get portal options
      const usePortal = this.options.usePortal === true;
      let portalContainer = null;
      if (this.options.portalContainer) {
        portalContainer = document.querySelector(this.options.portalContainer);
      }

      this.positionedElement = new PositionedElement(
        this.positioner,
        this.trigger,
        {
          placement: side,
          alignment: align,
          sideOffset,
          alignOffset,
          flip: true,
          usePortal,
          portalContainer: portalContainer || document.body,
          trapFocus: false,
          onOutsideClick: () =>
            this.transition("close", { restoreFocus: false }),
        },
      );
    }
  }

  afterMount() {
    if (this.state === "open") {
      this.activateOpenState(false);
    }
  }

  setupComponentEvents() {
    super.setupComponentEvents();
    this.trigger?.addEventListener("click", this.handleTriggerClick);
    this.trigger?.addEventListener("keydown", this.handleTriggerKeydown);
  }

  teardownComponentEvents() {
    super.teardownComponentEvents();
    this.trigger?.removeEventListener("click", this.handleTriggerClick);
    this.trigger?.removeEventListener("keydown", this.handleTriggerKeydown);
  }

  handleTriggerClick() {
    if (this.state === "open") {
      this.previousFocusEl = this.trigger;
    }

    this.transition("toggle");
  }

  handleTriggerKeydown(event) {
    if (event.defaultPrevented || this.state !== "open") return;

    const keyActions = {
      ArrowUp: () => this.menu?.navigateItem("prev"),
      ArrowDown: () => this.menu?.navigateItem("next"),
      Home: () => this.menu?.navigateItem("first"),
      End: () => this.menu?.navigateItem("last"),
      Escape: () => this.transition("close"),
      Enter: () => this.transition("close"),
      " ": () => this.transition("close"),
    };
    const action = keyActions[event.key];
    if (!action) return;

    event.preventDefault();
    event.stopPropagation();
    action();
  }

  activateOpenState(pushEvent = true) {
    const activeElement = document.activeElement;
    this.previousFocusEl =
      this.previousFocusEl ||
      (activeElement && activeElement !== document.body
        ? activeElement
        : this.trigger);

    this.initializePositionedElement();
    this.positionedElement?.activate();
    this.menu?.activate();
    window.requestAnimationFrame(() => {
      if (this.destroyed || typeof document === "undefined") return;

      if (
        this.state === "open" &&
        !this.content?.contains(document.activeElement)
      ) {
        this.menu?.activate();
      }
    });

    if (pushEvent) {
      this.pushEvent("open");
    }
  }

  onOpenEnter() {
    this.activateOpenState();
  }

  onClosedEnter({ restoreFocus = true } = {}) {
    this.positionedElement?.deactivate();
    this.pushEvent("close");

    if (!restoreFocus) {
      this.previousFocusEl = null;
      return;
    }

    const focusTarget = this.previousFocusEl?.isConnected
      ? this.previousFocusEl
      : this.trigger;

    focusTarget?.focus();
    this.previousFocusEl = null;
  }

  onItemSelect() {
    this.transition("close");
  }

  beforeDestroy() {
    this.el.dataset.state = this.state;

    // Clean up the positioned element
    if (this.positionedElement) {
      this.positionedElement.destroy();
      this.positionedElement = null;
    }

    // Clean up menu items
    if (this.menu) {
      this.menu.destroy();
      this.menu = null;
    }
  }
}

// Register the component
SaladUI.register("dropdown-menu", DropdownMenuComponent);

export default DropdownMenuComponent;
