# JavaScript Component Patterns

This guide covers common patterns, best practices, and solutions for building SaladUI JavaScript components.

> For the lifecycle rules behind the setup/teardown pairing used throughout
> this guide, see [Component Lifecycle](component_lifecycle.md).

## Table of Contents

1. [Component Structure Patterns](#component-structure-patterns)
2. [State Management Patterns](#state-management-patterns)
3. [Event Handling Patterns](#event-handling-patterns)
4. [Accessibility Patterns](#accessibility-patterns)
5. [Integration Patterns](#integration-patterns)
6. [Common Component Types](#common-component-types)

## Component Structure Patterns

### Basic Component Template

```javascript
import Component from "../core/component";
import SaladUI from "../index";

class MyComponent extends Component {
  constructor(el, hookContext) {
    super(el, {
      hookContext,
      initialState: "idle",
      ignoreItems: true  // Exclude data-part="*-item" from queryParts
    });

    // Cache frequently accessed parts
    this.trigger = this.getPart("trigger");
    this.content = this.getPart("content");

    // Component-specific initialization
    this.value = null;
  }

  getComponentConfig() {
    return {
      stateMachine: this.getStateMachineConfig(),
      events: this.getEventConfig(),
      hiddenConfig: this.getHiddenConfig(),
      ariaConfig: this.getAriaConfig()
    };
  }

  getStateMachineConfig() {
    return {
      idle: {
        enter: "onIdleEnter",
        transitions: { activate: "active" }
      },
      active: {
        enter: "onActiveEnter",
        exit: "onActiveExit",
        transitions: { deactivate: "idle" }
      }
    };
  }

  getEventConfig() {
    return {
      idle: {
        mouseMap: {
          trigger: { click: "activate" }
        }
      },
      active: {
        keyMap: {
          Escape: "deactivate"
        }
      }
    };
  }

  getHiddenConfig() {
    return {
      idle: { content: true },
      active: { content: false }
    };
  }

  getAriaConfig() {
    return {
      trigger: {
        all: { role: "button" },
        active: { expanded: "true" },
        idle: { expanded: "false" }
      }
    };
  }

  // State handlers
  onIdleEnter() {
    this.cleanup();
  }

  onActiveEnter() {
    this.setup();
    this.pushEvent("activated");
  }

  onActiveExit() {
    this.cleanup();
  }

  // Helper methods
  setup() {
    // Setup logic
  }

  cleanup() {
    // Cleanup logic
  }

  beforeDestroy() {
    this.cleanup();
    // Additional cleanup
  }
}

SaladUI.register("my-component", MyComponent);
export default MyComponent;
```

### Component with External Dependencies

```javascript
import Component from "../core/component";
import SaladUI from "../index";
import FocusTrap from "../core/focus-trap";
import ClickOutsideMonitor from "../core/click-outside";

class ModalComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext, initialState: "closed" });

    this.contentPanel = this.getPart("content-panel");
    this.config.preventDefaultKeys = ["Escape"];
  }

  getComponentConfig() {
    return {
      stateMachine: {
        closed: {
          enter: "onClosedEnter",
          transitions: { open: "open" }
        },
        open: {
          enter: "onOpenEnter",
          transitions: { close: "closed" }
        }
      },
      events: {
        open: {
          keyMap: { Escape: "close" }
        }
      },
      hiddenConfig: {
        closed: { content: true },
        open: { content: false }
      }
    };
  }

  setupComponentEvents() {
    super.setupComponentEvents();

    // Setup click outside detection
    if (this.options.closeOnOutsideClick) {
      this.clickOutsideMonitor = new ClickOutsideMonitor(
        [this.contentPanel],
        (event) => {
          if (event.target.dataset.part === "overlay") {
            this.transition("close");
          }
        }
      );
    }
  }

  // Pair teardown with setup, not beforeDestroy() — teardownComponentEvents()
  // is guaranteed to run whenever setupComponentEvents() does (including if
  // setupEvents() is ever re-invoked), so it's the only safe place to undo
  // what setup created. See docs/component_lifecycle.md#common-pitfalls.
  teardownComponentEvents() {
    super.teardownComponentEvents();

    this.clickOutsideMonitor?.destroy();
    this.clickOutsideMonitor = null;
  }

  onOpenEnter() {
    // Initialize focus trap
    if (!this.focusTrap) {
      this.focusTrap = new FocusTrap(this.contentPanel);
    }
    this.focusTrap.activate();

    // start()/stop() just pause/resume the monitor created in
    // setupComponentEvents() above — they don't create or destroy it.
    this.clickOutsideMonitor?.start();

    this.pushEvent("opened");
  }

  onClosedEnter() {
    this.focusTrap?.deactivate();
    this.clickOutsideMonitor?.stop();
    this.pushEvent("closed");
  }

  beforeDestroy() {
    // FocusTrap isn't created in setupComponentEvents(), so its cleanup
    // stays here rather than in teardownComponentEvents().
    this.focusTrap?.destroy();
    this.focusTrap = null;
  }
}

SaladUI.register("modal", ModalComponent);
export default ModalComponent;
```

## State Management Patterns

### Binary State (Open/Closed)

```javascript
getStateMachineConfig() {
  return {
    closed: {
      enter: "onClosedEnter",
      transitions: {
        open: "open",
        toggle: "open"
      }
    },
    open: {
      enter: "onOpenEnter",
      transitions: {
        close: "closed",
        toggle: "closed"
      }
    }
  };
}
```

### Multi-State with Loading

```javascript
getStateMachineConfig() {
  return {
    idle: {
      transitions: {
        submit: "loading",
        reset: "idle"
      }
    },
    loading: {
      enter: "onLoadingEnter",
      transitions: {
        success: "success",
        error: "error",
        cancel: "idle"
      }
    },
    success: {
      enter: "onSuccessEnter",
      transitions: {
        reset: "idle"
      }
    },
    error: {
      enter: "onErrorEnter",
      transitions: {
        retry: "loading",
        reset: "idle"
      }
    }
  };
}

onLoadingEnter() {
  this.pushEvent("loading");
  // Show loading spinner
}

onSuccessEnter() {
  this.pushEvent("success");
  // Show success message
  setTimeout(() => this.transition("reset"), 2000);
}

onErrorEnter(params) {
  this.pushEvent("error", { message: params.error });
  // Show error message
}
```

### Conditional Transitions

```javascript
getStateMachineConfig() {
  return {
    editing: {
      transitions: {
        save: (params) => {
          // Validate before transitioning
          if (this.validate(params.data)) {
            return "saved";
          } else {
            return "error";
          }
        },
        cancel: "idle"
      }
    },
    saved: {
      enter: (params) => {
        this.pushEvent("saved", params.data);
      },
      transitions: { edit: "editing" }
    },
    error: {
      enter: (params) => {
        this.showErrors(params.errors);
      },
      transitions: { retry: "editing" }
    }
  };
}

validate(data) {
  // Validation logic
  return data && data.value;
}
```

### State with History

```javascript
constructor(el, hookContext) {
  super(el, { hookContext });
  this.stateHistory = [];
}

onStateChanged(prevState, nextState) {
  this.stateHistory.push({
    from: prevState,
    to: nextState,
    timestamp: Date.now()
  });

  // Keep last 10 transitions
  if (this.stateHistory.length > 10) {
    this.stateHistory.shift();
  }

  return super.onStateChanged(prevState, nextState);
}

handleCommand(command, params) {
  if (command === "undo") {
    const lastTransition = this.stateHistory[this.stateHistory.length - 2];
    if (lastTransition) {
      return this.transition("revert", { toState: lastTransition.from });
    }
  }
  return super.handleCommand(command, params);
}
```

## Event Handling Patterns

### Mouse Event Patterns

```javascript
getEventConfig() {
  return {
    idle: {
      mouseMap: {
        trigger: {
          click: "open",
          mouseenter: (event) => {
            this.preload(); // Preload content on hover
          }
        },
        item: {
          click: (event) => {
            const value = event.target.dataset.value;
            this.selectItem(value);
          },
          mouseenter: "highlightItem",
          mouseleave: "unhighlightItem"
        }
      }
    },
    open: {
      mouseMap: {
        overlay: {
          click: "close"
        },
        content: {
          click: (event) => {
            // Prevent closing when clicking content
            event.stopPropagation();
          }
        }
      }
    }
  };
}

highlightItem(event) {
  event.target.classList.add("highlighted");
}

unhighlightItem(event) {
  event.target.classList.remove("highlighted");
}
```

### Keyboard Navigation Pattern

```javascript
getEventConfig() {
  return {
    open: {
      keyEventTarget: "content",  // Keys are handled on content part
      keyMap: {
        Escape: "close",
        ArrowDown: (event) => {
          event.preventDefault();
          this.navigateNext();
        },
        ArrowUp: (event) => {
          event.preventDefault();
          this.navigatePrev();
        },
        Enter: (event) => {
          event.preventDefault();
          this.selectCurrent();
        },
        Home: (event) => {
          event.preventDefault();
          this.navigateFirst();
        },
        End: (event) => {
          event.preventDefault();
          this.navigateLast();
        },
        " ": "toggleCurrent"  // Space key
      }
    }
  };
}

constructor(el, hookContext) {
  super(el, { hookContext });
  this.currentIndex = 0;
  this.items = [];
}

setupComponentEvents() {
  super.setupComponentEvents();
  this.updateItems();
}

updateItems() {
  this.items = this.getAllParts("item");
}

navigateNext() {
  this.currentIndex = Math.min(this.currentIndex + 1, this.items.length - 1);
  this.focusCurrentItem();
}

navigatePrev() {
  this.currentIndex = Math.max(this.currentIndex - 1, 0);
  this.focusCurrentItem();
}

navigateFirst() {
  this.currentIndex = 0;
  this.focusCurrentItem();
}

navigateLast() {
  this.currentIndex = this.items.length - 1;
  this.focusCurrentItem();
}

focusCurrentItem() {
  const item = this.items[this.currentIndex];
  if (item) {
    item.focus();
    item.scrollIntoView({ block: "nearest" });
  }
}

selectCurrent() {
  const item = this.items[this.currentIndex];
  if (item) {
    const value = item.dataset.value;
    this.selectItem(value);
  }
}
```

### Global Event Handlers (Active in All States)

```javascript
getEventConfig() {
  return {
    _all: {
      keyMap: {
        "?": () => this.showHelp(),  // Help in any state
        F1: () => this.showHelp()
      }
    },
    idle: {
      mouseMap: {
        trigger: { click: "open" }
      }
    },
    open: {
      keyMap: {
        Escape: "close"
      }
    }
  };
}
```

### Event Debouncing Pattern

```javascript
constructor(el, hookContext) {
  super(el, { hookContext });
  this.searchTimeout = null;
}

getEventConfig() {
  return {
    open: {
      mouseMap: {
        "search-input": {
          input: (event) => {
            this.debouncedSearch(event.target.value);
          }
        }
      }
    }
  };
}

debouncedSearch(query) {
  clearTimeout(this.searchTimeout);
  this.searchTimeout = setTimeout(() => {
    this.performSearch(query);
  }, 300);
}

performSearch(query) {
  this.pushEvent("search", { query });
}

beforeDestroy() {
  clearTimeout(this.searchTimeout);
}
```

## Accessibility Patterns

### Dialog/Modal ARIA

```javascript
getAriaConfig() {
  return {
    trigger: {
      all: {
        haspopup: "dialog",
        controls: () => this.getPartId("content")
      },
      open: { expanded: "true" },
      closed: { expanded: "false" }
    },
    content: {
      all: {
        role: "dialog",
        modal: "true"
      },
      open: { hidden: "false" },
      closed: { hidden: "true" }
    },
    "content-panel": {
      open: {
        labelledby: () => this.getPartId("title"),
        describedby: () => this.getPartId("description")
      }
    },
    title: {
      all: { role: "heading" }
    }
  };
}
```

### Menu ARIA

```javascript
getAriaConfig() {
  return {
    trigger: {
      all: {
        haspopup: "menu",
        controls: () => this.getPartId("content")
      },
      open: { expanded: "true" },
      closed: { expanded: "false" }
    },
    content: {
      all: { role: "menu" }
    },
    item: {
      all: {
        role: "menuitem",
        tabindex: "-1"
      }
    },
    separator: {
      all: { role: "separator" }
    }
  };
}
```

### Select/Listbox ARIA

```javascript
getAriaConfig() {
  return {
    trigger: {
      all: {
        role: "combobox",
        haspopup: "listbox",
        controls: () => this.getPartId("content")
      },
      open: { expanded: "true" },
      closed: { expanded: "false" }
    },
    content: {
      all: { role: "listbox" }
    },
    item: {
      all: {
        role: "option",
        tabindex: "-1"
      },
      selected: { selected: "true" },
      unselected: { selected: "false" }
    }
  };
}
```

### Tabs ARIA

```javascript
getAriaConfig() {
  return {
    list: {
      all: { role: "tablist" }
    },
    trigger: {
      all: {
        role: "tab",
        controls: (el) => {
          const value = el.dataset.value;
          return this.getPartId(`content-${value}`);
        }
      },
      active: {
        selected: "true",
        tabindex: "0"
      },
      inactive: {
        selected: "false",
        tabindex: "-1"
      }
    },
    content: {
      all: {
        role: "tabpanel",
        tabindex: "0"
      }
    }
  };
}
```

### Dynamic ARIA Values

```javascript
getAriaConfig() {
  return {
    slider: {
      all: {
        role: "slider",
        orientation: () => this.options.orientation || "horizontal",
        valuemin: () => this.min.toString(),
        valuemax: () => this.max.toString(),
        valuenow: () => this.value.toString(),
        valuetext: () => this.formatValue(this.value)
      }
    }
  };
}

formatValue(value) {
  if (this.options.format === "percentage") {
    return `${value}%`;
  }
  return value.toString();
}
```

## Integration Patterns

### Server Command Handling

```javascript
handleCommand(command, params = {}) {
  switch (command) {
    case "open":
      return this.transition("open", params);

    case "close":
      return this.transition("close", params);

    case "update":
      this.updateData(params.data);
      return true;

    case "reset":
      this.reset();
      return true;

    case "highlight":
      this.highlightItem(params.index);
      return true;

    default:
      // Fallback to state machine transition
      return super.handleCommand(command, params);
  }
}

updateData(data) {
  this.data = data;
  this.render();
}

reset() {
  this.data = null;
  this.currentIndex = 0;
  this.transition("idle");
}

highlightItem(index) {
  const item = this.items[index];
  if (item) {
    item.classList.add("highlighted");
    setTimeout(() => {
      item.classList.remove("highlighted");
    }, 1000);
  }
}
```

### Event Mapping to Server

```javascript
onOpenEnter() {
  // Send simple event
  this.pushEvent("opened");
}

onItemSelected(event) {
  const item = event.target.closest("[data-part='item']");
  const value = item.dataset.value;
  const label = item.textContent.trim();

  // Send event with data
  this.pushEvent("item-selected", {
    value: value,
    label: label,
    index: this.items.indexOf(item),
    timestamp: Date.now()
  });

  this.transition("close");
}

onSearchPerformed(query) {
  // Send search event
  this.pushEvent("search", {
    query: query,
    resultCount: this.results.length
  });
}
```

### Option-Based Behavior

```javascript
constructor(el, hookContext) {
  super(el, { hookContext });

  // Read options from data-options attribute
  this.closeOnSelect = this.options.closeOnSelect !== false;
  this.clearable = this.options.clearable === true;
  this.searchable = this.options.searchable === true;
  this.multiple = this.options.multiple === true;
}

getComponentConfig() {
  const config = {
    stateMachine: { /* ... */ },
    events: {
      open: {
        mouseMap: {
          item: {
            click: (event) => {
              this.selectItem(event);

              // Only close if option is enabled
              if (this.closeOnSelect && !this.multiple) {
                this.transition("close");
              }
            }
          }
        }
      }
    }
  };

  // Add searchable events if enabled
  if (this.searchable) {
    config.events.open.mouseMap["search-input"] = {
      input: (event) => this.filterItems(event.target.value)
    };
  }

  return config;
}
```

## Common Component Types

### Toggle Components (Switch, Checkbox)

```javascript
class ToggleComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext, initialState: "unchecked" });
    this.input = this.getPart("input");
  }

  getComponentConfig() {
    return {
      stateMachine: {
        unchecked: {
          enter: "onUncheckedEnter",
          transitions: {
            check: "checked",
            toggle: "checked"
          }
        },
        checked: {
          enter: "onCheckedEnter",
          transitions: {
            uncheck: "unchecked",
            toggle: "unchecked"
          }
        }
      },
      events: {
        _all: {
          mouseMap: {
            root: { click: "toggle" }
          },
          keyMap: {
            " ": "toggle",
            Enter: "toggle"
          }
        }
      },
      ariaConfig: {
        root: {
          all: { role: "checkbox" },
          checked: { checked: "true" },
          unchecked: { checked: "false" }
        }
      }
    };
  }

  onCheckedEnter() {
    if (this.input) this.input.checked = true;
    this.pushEvent("checked", { value: true });
  }

  onUncheckedEnter() {
    if (this.input) this.input.checked = false;
    this.pushEvent("checked", { value: false });
  }
}
```

### Overlay Components (Popover, Tooltip, Dropdown)

```javascript
class OverlayComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext, initialState: "closed" });
    this.contentPanel = this.getPart("content-panel");
    this.trigger = this.getPart("trigger");
  }

  getComponentConfig() {
    return {
      stateMachine: {
        closed: {
          transitions: { open: "open" }
        },
        open: {
          enter: "onOpenEnter",
          exit: "onOpenExit",
          transitions: { close: "closed" }
        }
      },
      events: {
        closed: {
          mouseMap: {
            trigger: { click: "open" }
          }
        },
        open: {
          keyMap: {
            Escape: "close"
          }
        }
      },
      hiddenConfig: {
        closed: { content: true },
        open: { content: false }
      }
    };
  }

  onOpenEnter() {
    this.positionContent();
    this.setupClickOutside();
  }

  onOpenExit() {
    this.teardownClickOutside();
  }

  positionContent() {
    // Position content relative to trigger
    const triggerRect = this.trigger.getBoundingClientRect();
    const contentRect = this.contentPanel.getBoundingClientRect();

    // Simple positioning (enhance with Floating UI, etc.)
    this.contentPanel.style.top = `${triggerRect.bottom + 8}px`;
    this.contentPanel.style.left = `${triggerRect.left}px`;
  }

  setupClickOutside() {
    this.clickOutsideHandler = (event) => {
      if (!this.contentPanel.contains(event.target) &&
          !this.trigger.contains(event.target)) {
        this.transition("close");
      }
    };
    document.addEventListener("click", this.clickOutsideHandler);
  }

  teardownClickOutside() {
    if (this.clickOutsideHandler) {
      document.removeEventListener("click", this.clickOutsideHandler);
      this.clickOutsideHandler = null;
    }
  }

  beforeDestroy() {
    this.teardownClickOutside();
  }
}
```

### Collection Components (Accordion, Tabs)

```javascript
class AccordionComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext, ignoreItems: false });
    this.items = this.getAllParts("item");
    this.allowMultiple = this.options.allowMultiple !== false;
    this.openItems = new Set();
  }

  getComponentConfig() {
    return {
      stateMachine: {
        idle: {
          transitions: {
            toggle: "idle"  // Stay in idle, handle internally
          }
        }
      },
      events: {
        idle: {
          mouseMap: {
            "item-trigger": {
              click: (event) => {
                const item = event.target.closest("[data-part='item']");
                this.toggleItem(item);
              }
            }
          }
        }
      },
      ariaConfig: {
        "item-trigger": {
          all: { role: "button" }
        },
        "item-content": {
          all: { role: "region" }
        }
      }
    };
  }

  toggleItem(item) {
    const itemId = item.dataset.value;
    const isOpen = this.openItems.has(itemId);

    if (isOpen) {
      this.closeItem(itemId);
    } else {
      if (!this.allowMultiple) {
        // Close all other items
        this.openItems.forEach(id => this.closeItem(id));
      }
      this.openItem(itemId);
    }
  }

  openItem(itemId) {
    this.openItems.add(itemId);
    const item = this.items.find(el => el.dataset.value === itemId);
    if (item) {
      const content = item.querySelector("[data-part='item-content']");
      const trigger = item.querySelector("[data-part='item-trigger']");

      if (content) content.hidden = false;
      if (trigger) trigger.setAttribute("aria-expanded", "true");

      this.pushEvent("item-opened", { value: itemId });
    }
  }

  closeItem(itemId) {
    this.openItems.delete(itemId);
    const item = this.items.find(el => el.dataset.value === itemId);
    if (item) {
      const content = item.querySelector("[data-part='item-content']");
      const trigger = item.querySelector("[data-part='item-trigger']");

      if (content) content.hidden = true;
      if (trigger) trigger.setAttribute("aria-expanded", "false");

      this.pushEvent("item-closed", { value: itemId });
    }
  }
}
```

These patterns provide a solid foundation for building robust, accessible, and maintainable SaladUI components.
