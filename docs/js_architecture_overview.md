# JavaScript Architecture Overview

This document provides a comprehensive overview of SaladUI's JavaScript architecture and how it integrates with Phoenix LiveView.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core System Components](#core-system-components)
3. [Data Flow](#data-flow)
4. [Component Lifecycle](#component-lifecycle)
5. [Integration with Phoenix LiveView](#integration-with-phoenix-liveview)

## Architecture Overview

SaladUI uses a hybrid client-server architecture that combines:

- **Phoenix Function Components** (Elixir) for server-side rendering
- **JavaScript State Machines** for client-side behavior
- **LiveView Hooks** for seamless bidirectional communication
- **Component Registry System** for dynamic component instantiation

```
┌─────────────────────────────────────────────────────────────┐
│                     Phoenix LiveView                         │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Elixir     │◄───────►│  SaladUIHook │                 │
│  │  Component   │         │  (LiveView)  │                 │
│  └──────────────┘         └──────────────┘                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ phx-hook="SaladUI"
                               │ data-component="dialog"
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              JavaScript Component System                     │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐  │
│  │   Registry   │───►│   Factory    │──►│  Component   │  │
│  │   (Map)      │    │   .create()  │   │   Instance   │  │
│  └──────────────┘    └──────────────┘   └──────────────┘  │
│                                              │              │
│                            ┌─────────────────┴─────────┐    │
│                            ▼                           ▼    │
│                    ┌──────────────┐           ┌──────────┐ │
│                    │StateMachine  │           │   ARIA   │ │
│                    │   (States &  │           │ Manager  │ │
│                    │ Transitions) │           │          │ │
│                    └──────────────┘           └──────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core System Components

### 1. Component Base Class (`core/component.js`)

The foundation of all interactive components. Provides:

- **State Management**: Integration with state machine for component behavior
- **Event Handling**: Automatic setup of mouse and keyboard events based on configuration
- **ARIA Management**: Automatic accessibility attribute handling
- **Part Management**: Query and manage component sub-elements via `data-part` attributes
- **Lifecycle Hooks**: `setupComponentEvents()`/`teardownComponentEvents()` (paired listener setup/teardown), `afterMount()` (post-mount, listeners live), `beforeDestroy()` (pre-teardown cleanup) — see the [Component Lifecycle](component_lifecycle.md) doc for the full contract
- **Server Communication**: `pushEvent()` for sending events to LiveView

**Key Properties:**
```javascript
this.el              // Root DOM element
this.hook            // LiveView hook context
this.stateMachine    // State machine instance
this.options         // Parsed from data-options attribute
this.allParts        // All queryable parts within component
this.ariaManager     // ARIA attribute manager
```

**Key Methods:**
```javascript
getComponentConfig()          // Override to define component behavior (must return a fresh object each call)
transition(event, params)     // Trigger state transitions
getPart(name)                 // Get single part by name
getAllParts(name)             // Get all parts with name
pushEvent(event, data)        // Send event to server
setupComponentEvents()        // Override: one-time listener setup, called once by setupEvents()
teardownComponentEvents()     // Override: undo setupComponentEvents(), called from removeAllEvents()
afterMount()                  // Override: runs once, right after setupEvents()
beforeDestroy()               // Override: cleanup before listeners are removed
destroy()                     // Cleanup and remove listeners
```

### 2. StateMachine (`core/state-machine.js`)

Manages component states and transitions with support for:

- **State Definitions**: Each state with enter/exit handlers
- **Transition Logic**: Event → Next State mappings
- **Conditional Transitions**: Function-based next state determination
- **Animation Support**: Returns promises for async transitions
- **Lifecycle Callbacks**: `onStateChanged` hook for side effects

**Structure:**
```javascript
{
  stateName: {
    enter: handlerFunction,     // Called when entering state
    exit: handlerFunction,      // Called when leaving state
    transitions: {
      eventName: nextState      // or function returning next state
    }
  }
}
```

**Flow:**
```
Event Triggered
    ↓
Determine Next State (from transitions map)
    ↓
Execute Exit Handler (current state)
    ↓
Update State (prevState → nextState)
    ↓
Call onStateChanged Hook (with animation support)
    ↓
Execute Enter Handler (new state)
    ↓
Update UI & Visibility
```

### 3. Component Registry & Factory (`core/factory.js`)

Provides centralized component registration and instantiation:

**Registry:**
```javascript
registry.register(type, ComponentClass)  // Register component type
registry.create(type, el, hook)          // Create instance
```

**Usage Pattern:**
```javascript
// Register (in component file)
import SaladUI from "../index";
import Component from "../core/component";

class MyComponent extends Component {
  // ...
}

SaladUI.register("my-component", MyComponent);
```

```javascript
// Instantiate (automatic via hook)
// When LiveView mounts element with:
//   phx-hook="SaladUI"
//   data-component="my-component"
```

### 4. SaladUIHook (`core/hook.js`)

Phoenix LiveView hook that bridges server and client:

**Responsibilities:**
- Mount component instances when elements are added to DOM
- Setup server event listeners for commands
- Reinitialize components on LiveView updates
- Cleanup components on element destruction

**Lifecycle:**
```javascript
mounted()    → initComponent() + setupServerEvents()
updated()    → destroy() + initComponent()
destroyed()  → destroy()
```

**Command Handling:**
```javascript
// Receives "saladui:command" events from server
this.handleEvent("saladui:command", ({command, params, target}) => {
  if (target === this.el.id) {
    this.component.handleCommand(command, params);
  }
});
```

### 5. AriaManager (in `core/component.js`)

Automatic ARIA attribute management:

- Applies `role` attributes directly
- Prefixes other attributes with `aria-`
- Supports dynamic values via functions
- Updates attributes on state changes
- Handles multiple parts with same name

**Example:**
```javascript
ariaConfig: {
  trigger: {
    all: { role: "button", haspopup: "dialog" },
    open: { expanded: "true" },
    closed: { expanded: "false" }
  }
}

// Results in:
// <div data-part="trigger"
//      role="button"
//      aria-haspopup="dialog"
//      aria-expanded="true">  <!-- when state is "open" -->
```

## Data Flow

### 1. Server to Client (Commands)

```
LiveView
    ↓ SaladUI.LiveView.send_command(socket, "dialog-id", "open")
Phoenix push_event("saladui:command", {command, target, params})
    ↓
SaladUIHook.handleEvent("saladui:command")
    ↓
Component.handleCommand(command, params)
    ↓
Component.transition(command, params)
    ↓
StateMachine executes transition
    ↓
UI Updates (visibility, ARIA, data-state)
```

### 2. Client to Server (Events)

```
User Interaction (click, keypress, etc.)
    ↓
Event Handler (mouseMap or keyMap)
    ↓
Component.transition(event, params)
    ↓
State Machine transition
    ↓
State Enter Handler calls pushEvent("open")
    ↓
Component.pushEvent() checks eventMappings
    ↓
hook.pushEventTo(el, eventHandler, payload)
    ↓
LiveView handle_event("dialog_opened", params, socket)
```

### 3. Client to Client (Direct Commands)

```
User clicks button with phx-click={SaladUI.JS.dispatch_command(...)}
    ↓
JavaScript dispatches "salad_ui:command" DOM event
    ↓
Component.onClientCommand() receives event
    ↓
Component.handleCommand(command, params)
    ↓
Component.transition(command, params)
    ↓
UI Updates (no server round-trip)
```

## Component Lifecycle

> **Full reference:** [Component Lifecycle](component_lifecycle.md) covers
> every phase in detail, the extension-hook contract (`setupComponentEvents`/
> `teardownComponentEvents`/`afterMount`/`beforeDestroy`), the rules behind
> that contract, and a worked `DialogComponent` example. Summary below.

### Initialization Flow

```javascript
1. LiveView mounts element with phx-hook="SaladUI"
2. SaladUIHook.mounted() called
3. registry.create(componentType, el, hookContext):
   a. new ComponentClass(el, hookContext) — Component constructor:
      - parseOptions() from data-options
      - initEventMappings() from data-event-mappings (binds
        onClientCommand/handleActionClick once, for the instance's lifetime)
      - initConfig() calls getComponentConfig()
      - initStateMachine() creates state machine
      - queryParts() finds all data-part elements
      - updateUI() sets initial ARIA and data-state
      - updatePartsVisibility() shows/hides parts
      // then the subclass's own constructor body runs (cache parts, etc.)
      // no DOM listeners exist yet
   b. instance.setupEvents() — called once, by the factory:
      - Add data-action click handler
      - Add salad_ui:command listener
      - Setup mouse event handlers from mouseMap
      - Setup keyboard handlers from keyMap
      - Call setupComponentEvents() hook
   c. instance.afterMount() — called once, right after setupEvents():
      - No-op by default; override for logic needing both the subclass's
        own fields and live listeners (e.g. an initial state transition)
```

Subclasses must not call `setupEvents()` themselves — see
[Component Lifecycle → Rules](component_lifecycle.md#rules) for why.

### Update Flow (LiveView Patch)

```javascript
1. LiveView patches DOM
2. SaladUIHook.updated() called
3. component.destroy() (full destroy phase, see below)
4. Reinitialize component (full initialization flow again, on a new instance)
```

Every patch to a component's root element destroys and fully recreates the
component instance — it does not diff/preserve the old one.

### Destruction Flow

```javascript
1. Element removed from DOM (or hook.updated() about to recreate it)
2. SaladUIHook.destroyed() called
3. component.destroy():
   a. beforeDestroy() hook — cleanup needing el/parts/hook still valid
      (e.g. FocusTrap)
   b. removeAllEvents():
      - Remove mouse event listeners
      - Remove keyboard event listeners
      - Remove command listener
      - teardownComponentEvents() hook — undo setupComponentEvents()
   c. Clear all references for garbage collection
```

### State Transition Flow

```javascript
1. transition(event, params) called
2. StateMachine.transition(event, params):
   - Look up transition in current state config
   - Determine next state (string or function result)
   - Execute current state's exit handler
   - Update state (prevState → nextState)
   - Call onStateChanged callback
3. Component.onStateChanged(prevState, nextState):
   - Check for animation config
   - Update UI (data-state, ARIA)
   - If animation: animate then updatePartsVisibility()
   - If no animation: updatePartsVisibility() immediately
4. Execute new state's enter handler
5. Component is now in new state
```

See [State Machine Flow](js_state_transition_flow.md) for the diagrammed
version of this sequence, with and without animation.

## Integration with Phoenix LiveView

### Component Registration Pattern

**Elixir Side:**
```elixir
defmodule SaladUI.Dialog do
  use SaladUI, :component

  def dialog(assigns) do
    ~H"""
    <div
      id={@id}
      phx-hook="SaladUI"
      data-component="dialog"
      data-part="root"
      data-options={json(%{closeOnOutsideClick: true})}
      data-event-mappings={json(%{open: "dialog_opened"})}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end
end
```

**JavaScript Side:**
```javascript
// assets/salad_ui/components/dialog.js
import Component from "../core/component";
import SaladUI from "../index";

class DialogComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext, initialState: "closed" });
  }

  getComponentConfig() {
    return {
      stateMachine: { /* ... */ },
      events: { /* ... */ },
      hiddenConfig: { /* ... */ },
      ariaConfig: { /* ... */ }
    };
  }
}

SaladUI.register("dialog", DialogComponent);
export default DialogComponent;
```

### LiveView Integration Points

1. **Mount**: `phx-hook="SaladUI"` triggers `SaladUIHook.mounted()`
2. **Commands**: `SaladUI.LiveView.send_command()` → `saladui:command` event
3. **Events**: `Component.pushEvent()` → `hook.pushEventTo()` → `handle_event()`
4. **Updates**: LiveView patches DOM → `SaladUIHook.updated()` → reinitialize
5. **Cleanup**: Element removed → `SaladUIHook.destroyed()` → cleanup

### Communication Patterns

**Pattern 1: User Action → Server**
```heex
<.dialog on-open={JS.push("dialog_opened")} on-close={JS.push("dialog_closed")}>
```
Component pushes events when state changes.

**Pattern 2: Server → Component Control**
```elixir
def handle_event("open_dialog", _, socket) do
  socket = SaladUI.LiveView.send_command(socket, "my-dialog", "open")
  {:noreply, socket}
end
```

**Pattern 3: Client → Client Direct**
```heex
<.button phx-click={SaladUI.JS.dispatch_command("open", to: "#my-dialog")}>
  Open
</.button>
```

### Data Attributes

Components use specific data attributes for configuration and behavior:

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `phx-hook="SaladUI"` | Attach LiveView hook | Required on root |
| `data-component="type"` | Component type for registry | `"dialog"`, `"select"` |
| `data-part="name"` | Sub-element identifier | `"trigger"`, `"content"` |
| `data-action="event"` | Click triggers transition | `"open"`, `"close"` |
| `data-state="current"` | Current component state | Auto-updated |
| `data-options="{...}"` | JSON configuration | Options object |
| `data-event-mappings="{...}"` | Event → Server mapping | Event handlers |

## Best Practices

### Component Development

1. **Always extend Component base class** for consistency
2. **Define getComponentConfig()** with complete state machine, events, and ARIA
3. **Use data-part** for all interactive sub-elements
4. **Provide keyboard navigation** via keyMap
5. **Include ARIA configuration** for accessibility
6. **Pair setup with teardown**: anything created in `setupComponentEvents()` must be undone in `teardownComponentEvents()`; use `beforeDestroy()` for cleanup that doesn't originate there (see [Component Lifecycle](component_lifecycle.md#rules))
7. **Use pushEvent()** for server communication
8. **Return true from handleCommand()** if command was handled

### State Machine Design

1. **Start with clear state definitions** (closed/open, idle/loading/error, etc.)
2. **Define all possible transitions** for each state
3. **Use enter handlers** for setup (focus trap, monitors)
4. **Use exit handlers** for teardown (deactivate, cleanup)
5. **Keep state logic separate** from UI updates
6. **Use params** to pass data through transitions

### Event Handling

1. **Use mouseMap** for mouse/touch events per state
2. **Use keyMap** for keyboard shortcuts per state
3. **Use data-action** for simple click transitions
4. **Specify keyEventTarget** if keys should target specific part
5. **Use \_all state** for events that work in any state
6. **Return false from executeHandler** to prevent default

### Performance

1. **Query parts once** in constructor, cache references
2. **Use setupComponentEvents()** for custom event setup
3. **Remove those listeners in the matching teardownComponentEvents()** to prevent leaks
4. **Avoid re-querying DOM** in event handlers
5. **Use event delegation** where appropriate
6. **Minimize state machine complexity** for simple components

## Advanced Topics

### Custom State Machine Logic

```javascript
transitions: {
  submit: (params) => {
    // Conditional transitions
    if (params.isValid) return "success";
    if (params.hasErrors) return "error";
    return "idle"; // fallback
  }
}
```

### Animation Integration

```javascript
// In Elixir component
data-options={json(%{
  animations: %{
    closed_to_open: %{
      target_part: "content",
      duration: 200,
      start: "opacity-0 scale-95",
      run: "opacity-100 scale-100",
      end: ""
    }
  }
})}
```

### Multi-Instance Components

Components automatically handle multiple instances via unique IDs:
```heex
<.dialog id="dialog-1">...</.dialog>
<.dialog id="dialog-2">...</.dialog>
```

Each gets its own component instance, state machine, and event handlers.

### Dynamic Values in ARIA

```javascript
ariaConfig: {
  slider: {
    all: {
      valuemin: () => this.min.toString(),
      valuemax: () => this.max.toString(),
      valuenow: () => this.value.toString()
    }
  }
}
```

Functions receive the part element and can access component state.
