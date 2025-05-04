// saladui/components/dropdown_menu.js
import Component from "../core/component";
import SaladUI from "../index";
import PositionedElement from "../core/positioned-element";
import Menu from "./menu";

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
    this.content = this.positioner.querySelector("[data-part='content']");

    this.menu = new Menu(this.content, {
      hookContext,
      onItemSelect: this.onItemSelect.bind(this),
    });

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
          mouseMap: {
            trigger: {
              click: (_e) => {
                this.transition("open");
              },
            },
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
            controls: () =>
              this.content ? this.content.id || `${this.el.id}-content` : null,
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
          onOutsideClick: () => this.transition("close"),
        },
      );
    }
  }

  onOpenEnter() {
    this.previousFocusEl = document.activeElement;

    this.initializePositionedElement();
    this.positionedElement?.activate();
    this.menu.activate();
    this.pushEvent("opened");
  }

  onClosedEnter() {
    this.positionedElement?.deactivate();
    this.pushEvent("closed");
    this.previousFocusEl?.focus();
    this.previousFocusEl = null;
  }

  onItemSelect(_item) {
    this.transition("close");
  }

  beforeDestroy() {
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
