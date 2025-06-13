# Quick Complex Component Guide

Complex components have multiple parts, states, and interactions. Follow this pattern:

## Step 1: Create Elixir Component

```elixir
defmodule SaladUI.Dialog do
  use SaladUI, :component

  # Main container
  attr :id, :string, required: true
  attr :open, :boolean, default: false
  attr :"on-open", :any, default: nil
  attr :"on-close", :any, default: nil
  slot :inner_block, required: true

  def dialog(assigns) do
    event_map = %{}
    |> add_event_mapping(assigns, "opened", :"on-open")
    |> add_event_mapping(assigns, "closed", :"on-close")

    assigns = assign(assigns, :event_map, json(event_map))

    ~H"""
    <div
      id={@id}
      data-component="dialog"
      data-part="root"
      data-event-mappings={@event_map}
      phx-hook="SaladUI"
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  # Trigger element
  def dialog_trigger(assigns) do
    ~H"""
    <div data-part="trigger" data-action="open">
      {render_slot(@inner_block)}
    </div>
    """
  end

  # Content element
  def dialog_content(assigns) do
    ~H"""
    <div data-part="content" hidden>
      <div data-part="overlay"></div>
      <div data-part="content-panel">
        {render_slot(@inner_block)}
        <button data-part="close-trigger" data-action="close">×</button>
      </div>
    </div>
    """
  end
end
```

## Step 2: Create JavaScript Component

```javascript
import Component from "../core/component";
import SaladUI from "../index";
import FocusTrap from "../core/focus-trap";

class DialogComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });
    this.content = this.getPart("content");
    this.contentPanel = this.getPart("content-panel");
  }

  getComponentConfig() {
    return {
      // State machine
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

      // Events by state
      events: {
        closed: {
          mouseMap: {
            trigger: { click: "open" }
          }
        },
        open: {
          mouseMap: {
            "close-trigger": { click: "close" },
            overlay: { click: "close" }
          },
          keyMap: {
            Escape: "close"
          }
        }
      },

      // Visibility control
      hiddenConfig: {
        closed: { content: true },
        open: { content: false }
      },

      // Accessibility
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
    };
  }

  // State handlers
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

SaladUI.register("dialog", DialogComponent);
```

## Step 3: Usage

```heex
<.dialog id="my-dialog" on-open={JS.push("dialog_opened")}>
  <.dialog_trigger>
    <.button>Open Dialog</.button>
  </.dialog_trigger>
  <.dialog_content>
    <h2>Dialog Title</h2>
    <p>Dialog content here.</p>
  </.dialog_content>
</.dialog>
```

## Key Complex Component Elements

### Multiple Parts
```elixir
data-part="root"          # Main container
data-part="trigger"       # Opens the component
data-part="content"       # Main content area
data-part="close-trigger" # Closes the component
```

### Actions
```elixir
data-action="open"   # Triggers open transition
data-action="close"  # Triggers close transition
data-action="toggle" # Toggles between states
```

### State Machine Pattern
```javascript
stateMachine: {
  state1: {
    enter: "onState1Enter",        // Called when entering state
    exit: "onState1Exit",          // Called when leaving state
    transitions: {
      event: "state2"              // event -> new state
    }
  }
}
```

### Event Handling
```javascript
events: {
  stateName: {
    mouseMap: {
      partName: { eventType: "action" }
    },
    keyMap: {
      KeyName: "action"
    }
  }
}
```

### Server Communication
```elixir
# In template
data-event-mappings={json(%{"opened" => assigns[:"on-open"]})}
```

```javascript
// In JavaScript
this.pushEvent("opened", { data: value });
```

## Common Complex Patterns

### Dropdown/Select
- **Parts**: trigger, content, item
- **States**: closed, open
- **Features**: positioning, keyboard navigation

### Tabs
- **Parts**: list, trigger, content
- **States**: per tab (active/inactive)
- **Features**: keyboard navigation, ARIA

### Accordion
- **Parts**: item, trigger, content
- **States**: collapsed, expanded
- **Features**: single/multiple open

### Modal/Sheet
- **Parts**: trigger, content, overlay
- **States**: closed, open
- **Features**: focus trap, click outside

Complex components follow this pattern but scale up with more parts, states, and interactions.
