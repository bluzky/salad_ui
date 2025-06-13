# SaladUI Component Configuration Reference

This document defines the configuration structure for SaladUI components returned by `getComponentConfig()`.

## Overview

```javascript
getComponentConfig() {
  return {
    stateMachine: { /* State definitions and transitions */ },
    events: { /* Event handlers by state */ },
    hiddenConfig: { /* Visibility control by state */ },
    ariaConfig: { /* ARIA attributes by part and state */ }
  };
}
```

## State Machine Configuration

Defines component states, transitions, and lifecycle handlers.

### Structure

```javascript
stateMachine: {
  stateName: {
    enter: "handlerMethod" | handlerFunction,    // Called when entering state
    exit: "handlerMethod" | handlerFunction,     // Called when leaving state
    transitions: {
      eventName: "targetState" | transitionFunction
    }
  }
}
```

### Example

```javascript
stateMachine: {
  closed: {
    enter: "onClosedEnter",
    exit: "onClosedExit",
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
  },
  loading: {
    enter: () => console.log("Loading started"),
    transitions: {
      complete: "idle",
      error: "error"
    }
  }
}
```

### State Handler Methods

```javascript
// Method referenced by string
onOpenEnter(params) {
  console.log("Dialog opened with", params);
  this.pushEvent("opened");
}

// Inline function
enter: (params) => {
  this.setupComponent(params);
}
```

### Transition Functions

```javascript
transitions: {
  // Simple transition
  open: "open",

  // Conditional transition
  toggle: (params) => {
    return this.state === "open" ? "closed" : "open";
  },

  // Complex transition logic
  submit: (params) => {
    if (params.isValid) {
      return "success";
    } else {
      return "error";
    }
  }
}
```

## Events Configuration

Defines event handlers for different states, organized by event type and target part.

### Structure

```javascript
events: {
  stateName: {
    mouseMap: {
      partName: {
        eventType: "action" | handlerFunction
      }
    },
    keyMap: {
      keyName: "action" | handlerFunction
    },
    keyEventTarget: "partName"  // Optional: which part receives key events
  },
  _all: {  // Special state: applies to all states
    // Event handlers that work in any state
  }
}
```

### Mouse Events

```javascript
events: {
  closed: {
    mouseMap: {
      trigger: {
        click: "open",                    // Trigger transition
        mouseenter: "handleMouseEnter",   // Call method
        mouseleave: (event) => {          // Inline function
          this.clearHover();
        }
      },
      "menu-item": {
        click: "selectItem",
        mouseenter: "highlightItem"
      }
    }
  },
  open: {
    mouseMap: {
      overlay: { click: "close" },
      "close-button": { click: "close" },
      content: {
        click: (event) => event.stopPropagation()
      }
    }
  }
}
```

### Keyboard Events

```javascript
events: {
  open: {
    keyEventTarget: "content",  // Keys are listened on content part
    keyMap: {
      Escape: "close",
      Enter: "confirm",
      ArrowDown: () => this.navigateNext(),
      ArrowUp: () => this.navigatePrev(),
      " ": "toggle",
      Tab: (event) => {
        // Custom tab handling
        this.handleTabNavigation(event);
      }
    }
  },
  _all: {
    keyMap: {
      "?": () => this.showHelp()  // Help works in any state
    }
  }
}
```

### Key Names

Any valid `event.key` value can be used:

```javascript
keyMap: {
  "a": "actionA",
  "Enter": "confirm",
  "Escape": "cancel",
  "ArrowDown": "next",
  " ": "toggle",           // Space key
  "F1": "help",
  "Delete": "remove",
  "Backspace": "back",
  "Meta": "showMenu",      // Cmd/Windows key
  "Control": "multiSelect"
}
```

### Mouse Events

Any valid DOM mouse event can be used:

```javascript
mouseMap: {
  partName: {
    "click": "action",
    "dblclick": "doubleClick",
    "mousedown": "startDrag",
    "mouseup": "endDrag",
    "mouseenter": "hover",
    "mouseleave": "unhover",
    "mouseover": "over",
    "mouseout": "out",
    "contextmenu": "showContext",
    "focus": "focused",
    "blur": "blurred",
    "focusin": "focusIn",
    "focusout": "focusOut"
  }
}

## Hidden Configuration

Controls part visibility based on component state.

### Structure

```javascript
hiddenConfig: {
  stateName: {
    partName: boolean  // true = hidden, false = visible
  }
}
```

### Example

```javascript
hiddenConfig: {
  closed: {
    content: true,        // Hide content when closed
    overlay: true,
    "loading-spinner": true
  },
  open: {
    content: false,       // Show content when open
    overlay: false,
    "close-button": false
  },
  loading: {
    content: true,
    "loading-spinner": false,  // Show spinner when loading
    "error-message": true
  },
  error: {
    content: true,
    "loading-spinner": true,
    "error-message": false     // Show error when in error state
  }
}
```

### How It Works

When component transitions to a state:
1. Gets visibility rules for that state
2. For each part in the rules:
   - Sets `element.hidden = true` if rule is `true`
   - Sets `element.hidden = false` if rule is `false`
3. Parts not mentioned in rules keep their current visibility

## ARIA Configuration

Sets accessibility attributes on parts based on state.

### Structure

```javascript
ariaConfig: {
  partName: {
    all: { attribute: "value" },        // Always applied
    stateName: { attribute: "value" }   // Applied in specific state
  }
}
```

### Basic Example

```javascript
ariaConfig: {
  trigger: {
    all: { role: "button", haspopup: "dialog" },
    open: { expanded: "true" },
    closed: { expanded: "false" }
  },
  content: {
    all: { role: "dialog" },
    open: { hidden: "false" },
    closed: { hidden: "true" }
  }
}
```

### Attribute Mapping

```javascript
// Config -> HTML
role: "button"           // -> role="button"
expanded: "true"         // -> aria-expanded="true"
hidden: "true"           // -> aria-hidden="true"
labelledby: "title-id"   // -> aria-labelledby="title-id"
```

### Dynamic Values

```javascript
ariaConfig: {
  slider: {
    all: {
      role: "slider",
      valuemin: () => this.min.toString(),
      valuenow: () => this.value.toString()
    }
  }
}
```

### Common Patterns

```javascript
// Dialog
ariaConfig: {
  trigger: {
    all: { haspopup: "dialog" },
    open: { expanded: "true" },
    closed: { expanded: "false" }
  },
  content: {
    all: { role: "dialog" }
  }
}

// Menu
ariaConfig: {
  trigger: {
    all: { haspopup: "menu" },
    open: { expanded: "true" }
  },
  content: { all: { role: "menu" } },
  item: { all: { role: "menuitem" } }
}

// Tabs
ariaConfig: {
  list: { all: { role: "tablist" } },
  trigger: {
    all: { role: "tab" },
    active: { selected: "true" }
  },
  content: { all: { role: "tabpanel" } }
}
```

## Complete Example

```javascript
getComponentConfig() {
  return {
    stateMachine: {
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
          toggle: "closed",
          select: "closed"
        }
      }
    },

    events: {
      closed: {
        mouseMap: {
          trigger: { click: "open" }
        },
        keyMap: {
          Enter: "open",
          " ": "open",
          ArrowDown: "open"
        }
      },
      open: {
        keyEventTarget: "content",
        mouseMap: {
          overlay: { click: "close" },
          item: { click: "selectItem" }
        },
        keyMap: {
          Escape: "close",
          ArrowDown: () => this.navigateNext(),
          ArrowUp: () => this.navigatePrev()
        }
      }
    },

    hiddenConfig: {
      closed: {
        content: true,
        overlay: true
      },
      open: {
        content: false,
        overlay: false
      }
    },

    ariaConfig: {
      trigger: {
        all: { haspopup: "listbox" },
        open: { expanded: "true" },
        closed: { expanded: "false" }
      },
      content: {
        all: { role: "listbox" }
      },
      item: {
        all: { role: "option" },
        selected: { selected: "true" },
        unselected: { selected: "false" }
      }
    }
  };
}
```
