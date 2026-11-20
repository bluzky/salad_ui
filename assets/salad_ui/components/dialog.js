// saladui/components/dialog.js
import Component from "../core/component.js";
import SaladUI from "../index.js";
import FocusTrap from "../core/focus-trap.js";
import ClickOutsideMonitor from "../core/click-outside.js";

class DialogComponent extends Component {
  constructor(el, hookContext) {
    // Sheets and alert dialogs render their state as the root's `data-state`
    // (no `data-open`). Read the server-rendered value before the base
    // constructor overwrites it with the initial state.
    const stateRaw =
      el.dataset.open === undefined ? el.dataset.state : undefined;
    // A root `data-state` on a dialog driven by `data-open` was kept from the
    // instance this one replaces (see ownedAttributes): the server changed
    // `data-open`.
    const rebuilt =
      el.dataset.open !== undefined && el.hasAttribute("data-state");

    super(el, {
      hookContext,
      initialState: "closed",
    });

    // Initialize properties
    this.root = this.el;
    this.content = this.getPart("content");
    this.contentPanel = this.getPart("content-panel");
    this.config.preventDefaultKeys = ["Escape"];
    this._openRaw = el.dataset.open;
    this._stateRaw = stateRaw;
    this._rebuilt = rebuilt;
  }

  // Keep this instance across LiveView patches that leave the dialog's own
  // attributes alone (every keystroke of a phx-change form inside it). A
  // rebuild resets the state from the server-rendered `data-open`, which
  // closes a dialog the user opened on the client, and its focus trap moves
  // focus back to the first field while the user types. The state is applied
  // again, without focusing anything, to parts the patch added. The focus
  // trap reads the focusable elements anew on each Tab, so patched content
  // is fine.
  //
  // Sheets and alert dialogs render their state as `data-state` on the root
  // instead of `data-open`. A patch puts the server's value back there, so
  // they are compared against the server-rendered value seen at mount, not
  // the client's state: a sheet the user opened stays open while the server
  // keeps rendering `closed`, and rebuilds when the server changes it.
  skipReinitialize(el) {
    const same =
      el.dataset.open === this._openRaw &&
      (this._openRaw !== undefined || el.dataset.state === this._stateRaw) &&
      el.dataset.options === this._optionsRaw &&
      el.dataset.eventMappings === this._eventMappingsRaw;
    if (same) {
      this.allParts = this.collectParts();
      this.rebindReplacedParts();
      this.updateUI();
      // A running exit animation hides the content when it ends.
      if (!this.visibilityPending) this.updatePartsVisibility();
    }
    return same;
  }

  // A patch that replaced the content or its panel (rather than patching them
  // in place) leaves the focus trap and the outside-click monitor on the old
  // nodes; move them to the new ones, without moving focus.
  rebindReplacedParts() {
    const content = this.getPart("content");
    const contentPanel = this.getPart("content-panel");
    if (content === this.content && contentPanel === this.contentPanel) return;

    this.content = content;
    this.contentPanel = contentPanel;
    this.focusTrap?.retarget(contentPanel);

    if (this.clickOutsideMonitor) {
      this.clickOutsideMonitor.destroy();
      this.setupOutsideClickDetection();
      if (this.state === "open") this.clickOutsideMonitor.start();
    }
  }

  // Events tell the server what the user did. A transition the server asked
  // for by changing `data-open` is not echoed back to it.
  pushEvent(clientEvent, payload, context) {
    if (clientEvent === this._echoToSkip) {
      this._echoToSkip = null;
      return;
    }
    super.pushEvent(clientEvent, payload, context);
  }

  afterMount() {
    const requestedState =
      this.el.dataset.open === undefined
        ? this._stateRaw || "closed"
        : this.el.dataset.open === "true"
          ? "open"
          : "closed";

    if (requestedState === this.state) {
      if (this.state === "open") {
        this.activateOpenState();
      }
      return;
    }

    const event = requestedState === "open" ? "open" : "close";
    if (this._rebuilt) this._echoToSkip = event;
    this.transition(event);
  }

  getComponentConfig() {
    return {
      stateMachine: {
        closed: {
          enter: "onClosedEnter",
          exit: "onClosedExit",
          transitions: {
            open: "open",
          },
        },
        open: {
          enter: "onOpenEnter",
          exit: "onOpenExit",
          transitions: {
            close: "closed",
          },
        },
      },
      events: {
        closed: {
          keyMap: {},
        },
        open: {
          keyMap: {
            ...(this.options.closeOnEscape === false
              ? {}
              : { Escape: "close" }),
          },
        },
      },
      // The dialog sets these itself; a LiveView patch must not put back the
      // server-rendered `hidden` or drop `data-state`, which would hide the
      // open dialog for a moment and replay its opening animation. The root's
      // `data-state` is the server's to set where it renders it (sheets and
      // alert dialogs, which have no `data-open`).
      ownedAttributes: {
        root: this.el.dataset.open === undefined ? [] : ["data-state"],
        overlay: ["data-state"],
        content: ["hidden", "data-state", "aria-hidden"],
        "content-panel": [
          "data-state",
          "role",
          "aria-modal",
          "aria-labelledby",
          "aria-describedby",
        ],
        "close-trigger": ["aria-label"],
      },
      hiddenConfig: {
        closed: {
          content: true,
        },
        open: {
          content: false,
        },
      },
      ariaConfig: {
        content: {
          open: {
            hidden: "false",
          },
          closed: {
            hidden: "true",
          },
        },
        "content-panel": {
          all: {
            role: this.options.role || "dialog",
          },
          open: {
            modal: "true",
            labelledby: () => this.getPartId("title"),
            describedby: () => this.getPartId("description"),
          },
          closed: {
            modal: null,
            labelledby: null,
            describedby: null,
          },
        },
        "close-trigger": {
          all: {
            label: "Close dialog",
          },
        },
      },
    };
  }

  // Setup component events
  setupComponentEvents() {
    super.setupComponentEvents();

    // Only setup click handler if closeOnOutsideClick is enabled
    if (this.options.closeOnOutsideClick) {
      this.setupOutsideClickDetection();
    }
  }

  setupOutsideClickDetection() {
    // Create click outside monitor to handle clicks on the overlay
    this.clickOutsideMonitor = new ClickOutsideMonitor(
      [this.contentPanel],
      (event) => {
        // Only close if click was directly on the content container (overlay area)
        if (
          event.target === this.content ||
          event.target.dataset.part === "overlay"
        ) {
          this.transition("close");
        }
      },
    );
  }

  teardownComponentEvents() {
    super.teardownComponentEvents();

    // Clean up click outside monitor
    this.clickOutsideMonitor?.destroy();
    this.clickOutsideMonitor = null;
  }

  // State machine handlers
  onClosedEnter() {
    // Content hides after its exit animation completes.
  }

  onClosedExit() {
    // No special handling needed
  }

  onOpenEnter() {
    this.activateOpenState();

    // Notify the server of the state change
    this.pushEvent("open");
  }

  onOpenExit() {
    this.focusTrap?.deactivate();
    this.clickOutsideMonitor?.stop();

    // Notify before an exit animation or a LiveView patch can destroy this instance.
    this.pushEvent("close");
  }

  activateOpenState() {
    // Initialize focus trap if not already created
    this.el.focus();
    if (!this.focusTrap) {
      this.focusTrap = new FocusTrap(this.contentPanel);
    }

    // Activate focus trap
    this.focusTrap.activate();

    // Activate click outside monitor if enabled
    if (this.clickOutsideMonitor) {
      this.clickOutsideMonitor.start();
    }

    // Escape handling uses the component key map.
  }

  beforeDestroy() {
    // Clean up focus trap
    this.focusTrap?.destroy();
    this.focusTrap = null;
  }
}

// Register the component
SaladUI.register("dialog", DialogComponent);

export default DialogComponent;
