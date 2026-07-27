# JavaScript Documentation Index

Complete guide to SaladUI's JavaScript component system documentation.

## Quick Start

New to SaladUI JavaScript components? Start here:

1. **[Architecture Overview](js_architecture_overview.md)** - Understand the big picture
2. **[Simple Component Guide](implement_simple_component.md)** - Build your first component
3. **[Complex Component Guide](complex_component_guide.md)** - Add interactivity
4. **[Component Patterns](js_component_patterns.md)** - Learn best practices

## Documentation Structure

### Core Concepts

#### [JavaScript Architecture Overview](js_architecture_overview.md)
Comprehensive overview of the JavaScript architecture and how it integrates with Phoenix LiveView.

**Topics:**
- Architecture overview and diagrams
- Core system components (Component, StateMachine, Registry, Hook)
- Data flow patterns (server-to-client, client-to-server, client-to-client)
- Component lifecycle (initialization, updates, destruction)
- Integration with Phoenix LiveView
- Best practices and advanced topics

**Read this if:**
- You're new to SaladUI's JavaScript architecture
- You want to understand how components work under the hood
- You need to debug component behavior
- You're designing new components

#### [Component Lifecycle](component_lifecycle.md)
The authoritative reference for `Component`'s mount → transition → update →
destroy lifecycle, and the extension-hook contract subclasses must follow.

**Topics:**
- Mount phase (construction, `setupEvents()`, `afterMount()`)
- Runtime state transitions (pointer to State Machine Flow)
- Update flow (LiveView patch destroys and recreates the instance)
- Destroy flow (`beforeDestroy()`, `removeAllEvents()`, `teardownComponentEvents()`)
- Extension hook reference table
- Rules — and the real bug each one prevents
- Worked `DialogComponent` example
- Common pitfalls (a leaked `document` listener, explained end-to-end)

**Read this if:**
- You're overriding `setupComponentEvents()`, `afterMount()`, or `beforeDestroy()`
- You're adding a listener or utility (monitor, trap, observer) that outlives a single event
- You're debugging a listener/memory leak
- You want to know exactly when a given hook runs and what's safe to assume at that point

#### [State Machine Flow](js_state_transition_flow.md)
Visual diagrams showing state transition execution flow with and without animations.

**Topics:**
- Transition flow without animation
- Transition flow with animation
- Timing of visibility updates

**Read this if:**
- You need to understand transition timing
- You're implementing animations
- You're debugging state transition issues

### Implementation Guides

#### [Simple Component Guide](implement_simple_component.md)
Quick guide for creating simple, non-interactive components.

**Topics:**
- 4-step component creation process
- Elixir component setup
- JavaScript component basics
- Chart component example
- Key requirements checklist

**Read this if:**
- You're creating a new simple component
- You need a quick reference
- You're wrapping a third-party library (Chart.js example)

#### [Complex Component Guide](complex_component_guide.md)
Guide for creating complex components with multiple parts, states, and interactions.

**Topics:**
- Multi-part component structure
- State machine patterns
- Event handling (mouse, keyboard)
- Visibility control
- ARIA configuration
- Common complex patterns (dialogs, dropdowns, tabs, accordions)

**Read this if:**
- You're building an interactive component
- You need multiple states and transitions
- You need keyboard navigation
- You need accessibility features

#### [Component Configuration Guide](component_config_guide.md)
Complete reference for the configuration object returned by `getComponentConfig()`.

**Topics:**
- State machine configuration structure
- Events configuration (mouseMap, keyMap)
- Hidden configuration for visibility control
- ARIA configuration for accessibility
- Complete examples

**Read this if:**
- You need detailed config reference
- You're defining state machines
- You're setting up event handlers
- You're configuring ARIA attributes

### Best Practices

#### [Component Patterns](js_component_patterns.md)
Collection of common patterns, best practices, and solutions for building components.

**Topics:**
- Component structure patterns
- State management patterns (binary, multi-state, conditional)
- Event handling patterns (mouse, keyboard, debouncing)
- Accessibility patterns (dialog, menu, select, tabs)
- Integration patterns (commands, events, options)
- Common component types (toggle, overlay, collection)

**Read this if:**
- You're looking for proven solutions
- You need patterns for specific scenarios
- You want to improve component quality
- You're implementing accessibility features

### Communication

#### [Component Communications Guide](component_communications_explain.md)
Explains how communication works between different parts of the system.

**Topics:**
- Client → Server communication (events)
- Server → Client communication (commands)
- Client → Client communication (direct commands)
- Event mapping configuration
- Phoenix.LiveView.JS usage
- When to use each pattern

**Read this if:**
- You need to send data to the server
- You need to control components from LiveView
- You need component-to-component communication
- You're confused about communication patterns

### Reference

#### [Component Reference](js_component_reference.md)
Quick reference for all JavaScript components and their APIs.

**Topics:**
- Core classes (Component, StateMachine, Registry, Hook)
- All interactive components with:
  - States
  - Options
  - Events
  - Parts
  - Keyboard shortcuts
  - ARIA roles
  - Special features
- Utility classes (FocusTrap, ClickOutsideMonitor)
- Common patterns and code snippets
- Testing and debugging
- Performance tips

**Read this if:**
- You need a quick API reference
- You're looking for specific component details
- You need keyboard shortcut reference
- You need debugging tips

## Learning Paths

### Path 1: Beginner (Creating Your First Component)

1. Read: [Architecture Overview](js_architecture_overview.md) - Sections: "Architecture Overview" and "Core System Components"
2. Read: [Simple Component Guide](implement_simple_component.md)
3. Build: Create a simple display component (chart, badge, avatar)
4. Read: [Component Communications Guide](component_communications_explain.md)
5. Practice: Add server communication to your component

### Path 2: Intermediate (Building Interactive Components)

1. Read: [Architecture Overview](js_architecture_overview.md) - Complete
2. Read: [Complex Component Guide](complex_component_guide.md)
3. Read: [Component Configuration Guide](component_config_guide.md)
4. Build: Create a toggle, dropdown, or accordion
5. Read: [Component Patterns](js_component_patterns.md) - State and Event sections
6. Practice: Add keyboard navigation and ARIA

### Path 3: Advanced (Mastering Component Development)

1. Read: [Component Patterns](js_component_patterns.md) - Complete
2. Study: Existing component implementations in `assets/salad_ui/components/`
3. Read: [State Machine Flow](js_state_transition_flow.md)
4. Build: Complex component with animations (dialog, sheet, popover)
5. Read: [Component Reference](js_component_reference.md) - Testing and Performance sections
6. Practice: Optimize and test your components

### Path 4: Debugging and Troubleshooting

1. Read: [Component Lifecycle](component_lifecycle.md) - Complete
2. Read: [Component Reference](js_component_reference.md) - "Testing" and "Common Pitfalls" sections
3. Review: [Component Communications Guide](component_communications_explain.md)
4. Check: [Component Configuration Guide](component_config_guide.md) for config issues

## Common Questions

### How do I...?

#### Create a new component?
→ See [Simple Component Guide](implement_simple_component.md) or [Complex Component Guide](complex_component_guide.md)

#### Send data to the server?
→ See [Component Communications Guide](component_communications_explain.md) - "Client → Server Communication"

#### Control a component from LiveView?
→ See [Component Communications Guide](component_communications_explain.md) - "Server → Client Communication"

#### Add keyboard navigation?
→ See [Component Patterns](js_component_patterns.md) - "Keyboard Navigation Pattern"

#### Make my component accessible?
→ See [Component Patterns](js_component_patterns.md) - "Accessibility Patterns"

#### Handle state transitions?
→ See [Component Configuration Guide](component_config_guide.md) - "State Machine Configuration"

#### Debug component issues?
→ See [Component Reference](js_component_reference.md) - "Testing Components"

#### Clean up resources?
→ See [Component Patterns](js_component_patterns.md) - "Component with External Dependencies"

#### Add animations?
→ See [Architecture Overview](js_architecture_overview.md) - "Animation Integration"

#### Handle multiple instances?
→ See [Architecture Overview](js_architecture_overview.md) - "Multi-Instance Components"

## Code Examples

### Minimal Component

```javascript
import Component from "../core/component";
import SaladUI from "../index";

class MinimalComponent extends Component {
  getComponentConfig() {
    return {
      stateMachine: {
        idle: { transitions: {} }
      }
    };
  }
}

SaladUI.register("minimal", MinimalComponent);
```

### Toggle Component

```javascript
class ToggleComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext, initialState: "off" });
  }

  getComponentConfig() {
    return {
      stateMachine: {
        off: {
          enter: "onOffEnter",
          transitions: { toggle: "on" }
        },
        on: {
          enter: "onOnEnter",
          transitions: { toggle: "off" }
        }
      },
      events: {
        _all: {
          mouseMap: {
            root: { click: "toggle" }
          },
          keyMap: {
            " ": "toggle"
          }
        }
      },
      ariaConfig: {
        root: {
          all: { role: "switch" },
          on: { checked: "true" },
          off: { checked: "false" }
        }
      }
    };
  }

  onOnEnter() {
    this.pushEvent("toggled", { value: true });
  }

  onOffEnter() {
    this.pushEvent("toggled", { value: false });
  }
}
```

### Dialog Component

```javascript
import FocusTrap from "../core/focus-trap";

class DialogComponent extends Component {
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
        closed: {
          mouseMap: {
            trigger: { click: "open" }
          }
        },
        open: {
          keyMap: { Escape: "close" }
        }
      },
      hiddenConfig: {
        closed: { content: true },
        open: { content: false }
      },
      ariaConfig: {
        trigger: {
          all: { haspopup: "dialog" },
          open: { expanded: "true" },
          closed: { expanded: "false" }
        },
        content: {
          all: { role: "dialog", modal: "true" }
        }
      }
    };
  }

  onOpenEnter() {
    if (!this.focusTrap) {
      this.focusTrap = new FocusTrap(this.contentPanel);
    }
    this.focusTrap.activate();
    this.pushEvent("opened");
  }

  onClosedEnter() {
    this.focusTrap?.deactivate();
    this.pushEvent("closed");
  }

  beforeDestroy() {
    this.focusTrap?.destroy();
  }
}
```

## File Locations

```
assets/salad_ui/
├── index.js                           # Main export
├── core/                              # See core/README.md for the full file-by-file breakdown
│   ├── README.md                      # Core module overview
│   ├── component.js                   # Base Component class
│   ├── state-machine.js               # State machine
│   ├── hook.js                        # LiveView hook
│   ├── factory.js                     # Registry & factory
│   ├── utils.js                       # Animation/class/DOM utilities
│   ├── collection.js                  # Selectable/focusable item collection
│   ├── focus-trap.js                  # Focus trap utility
│   ├── click-outside.js               # Click outside monitor
│   ├── portal.js                      # DOM re-parenting utility
│   ├── positioner.js                  # Floating-element position math
│   ├── positioned-element.js          # Popover/select/tooltip positioning
│   └── scroll-manager.js              # Scroll/resize repositioning
└── components/
    ├── accordion.js
    ├── chart.js
    ├── collapsible.js
    ├── command.js
    ├── dialog.js
    ├── dropdown_menu.js
    ├── hover-card.js
    ├── menu.js
    ├── popover.js
    ├── radio_group.js
    ├── select.js
    ├── slider.js
    ├── switch.js
    ├── tabs.js
    └── tooltip.js

docs/
├── js_documentation_index.md          # This file
├── js_architecture_overview.md        # Architecture guide
├── component_lifecycle.md             # Component lifecycle reference
├── js_component_patterns.md           # Patterns & best practices
├── js_component_reference.md          # API reference
├── js_state_transition_flow.md        # State transition diagrams
├── implement_simple_component.md      # Simple component guide
├── complex_component_guide.md         # Complex component guide
├── component_config_guide.md          # Config reference
└── component_communications_explain.md # Communication guide
```

## Contributing

When adding new components or patterns, please:

1. Add component to [Component Reference](js_component_reference.md)
2. Document new patterns in [Component Patterns](js_component_patterns.md)
3. Add examples to relevant guides
4. Update this index if adding new documentation files

## Getting Help

1. Search this documentation for your specific question
2. Review component implementations in `assets/salad_ui/components/`
3. Check the [Common Pitfalls](js_component_reference.md#common-pitfalls) section
4. Use the storybook app to test components: `cd storybook && mix phx.server`
5. Open an issue on GitHub with your question

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Overview for AI assistants
- [README.md](../README.md) - Project overview and installation
- [Elixir Component Docs](https://hexdocs.pm/salad_ui/) - Server-side component documentation
- Phoenix LiveView [Hooks Documentation](https://hexdocs.pm/phoenix_live_view/js-interop.html#client-hooks-via-phx-hook)

---

**Last Updated:** November 2024
**Version:** 1.0.0-beta.3
