# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SaladUI is a Phoenix LiveView UI component library inspired by shadcn/ui. It provides 40+ accessible, customizable components combining server-side rendering with client-side interactivity through a hybrid architecture using Phoenix Function Components, JavaScript State Machines, and LiveView Hooks.

## Development Commands

### Testing
```bash
# Run all tests
mix test

# Run tests with color output (default alias)
mix test

# Run tests with coverage
mix coveralls

# Run tests in watch mode
mix test.watch
```

### Code Quality
```bash
# Format code (uses Phoenix.LiveView.HTMLFormatter and Styler)
mix format

# Run static analysis
mix credo

# Run full audit (format + credo + coverage)
mix audit
```

### Storybook Development
```bash
# Start the storybook Phoenix server for component development
cd storybook
mix phx.server
# Access at http://localhost:4000
```

### Installation Tasks
```bash
# Quick setup (library mode) - configures Tailwind and JS
mix salad.setup

# Full installation (local customization) - copies components locally
mix salad.install
# With options:
mix salad.install --prefix MyUI --color-scheme slate
```

## Architecture

### Component Structure

SaladUI uses a three-layer architecture:

1. **Elixir Layer** (`lib/salad_ui/*.ex`):
   - Phoenix Function Components that render HEEx templates
   - Each component module uses `use SaladUI, :component` which imports helpers and Phoenix.Component
   - Components defined with `attr`, `slot`, and function components
   - Use `TwMerge` for Tailwind class merging via `classes/1` helper
   - Support for variants through `button_variant/1` and `variant_class/2` helpers

2. **JavaScript Layer** (`assets/salad_ui/`):
   - **State Machines** (`core/state-machine.js`): Handle component behavior and transitions
   - **Component Base Class** (`core/component.js`): Base class providing state management, event handling, ARIA support
   - **Component Implementations** (`components/*.js`): Specific component behavior (dialog, select, popover, etc.)
   - **LiveView Hook** (`core/hook.js`): Bridges Phoenix LiveView and JavaScript components via `SaladUIHook`
   - **Factory Pattern** (`core/factory.js`): Registry system to instantiate components dynamically

3. **Integration Layer**:
   - `lib/salad_ui/liveview.ex`: Server-to-client communication via `SaladUI.LiveView.send_command/4`
   - `lib/salad_ui/liveview.ex`: Client-side JS commands via `SaladUI.JS.dispatch_command/3`
   - Components use `data-component`, `data-part`, `data-action` attributes for JS binding
   - Event mappings defined via `data-event-mappings` attribute (JSON encoded)

### Component Communication

Components communicate through multiple patterns:

- **Server → Client**: Use `SaladUI.LiveView.send_command(socket, component_id, command, params)` to control components from LiveView
- **Client → Client**: Use `SaladUI.JS.dispatch_command(js, command, to: "#component-id")` for JS-based control
- **Client → Server**: Components fire LiveView events via `on-open`, `on-close`, etc. attributes that accept event names or JS commands
- **State Machines**: Components implement transitions that can be triggered by commands (e.g., "open", "close", "toggle")

### Key Patterns

1. **Component Data Attributes**:
   - `data-component="dialog"`: Identifies component type for JS binding
   - `data-part="trigger"`: Identifies sub-elements within a component
   - `data-action="open"`: Defines action triggered by interaction
   - `data-options`: JSON-encoded configuration
   - `data-event-mappings`: JSON-encoded event handlers
   - `phx-hook="SaladUI"`: Attaches the LiveView hook

2. **Variant System**:
   - Defined in component modules or `lib/salad_ui/helpers.ex`
   - Use `variant_class/2` for flexible variant configuration
   - Pre-built `button_variant/1` for button components
   - Variants support size, style, and other visual variations

3. **Form Integration**:
   - `prepare_assign/1` extracts field data from `Phoenix.HTML.FormField`
   - `field_errors/1` and `has_error?/1` for validation state
   - Error translation via configured `:error_translator_function` in config

4. **Dynamic Rendering**:
   - `dynamic/1` component renders tags dynamically based on `tag` attribute
   - `as_child/1` implements shadcn/ui's `asChild` pattern for composition

## File Organization

```
lib/salad_ui/
├── *.ex                    # Individual component modules (button.ex, dialog.ex, etc.)
├── helpers.ex              # Shared helpers (variants, form utils, dynamic rendering)
├── liveview.ex             # LiveView integration (send_command, JS helpers)
└── mix/tasks/              # Mix tasks for installation

assets/salad_ui/
├── index.js                # Entry point, exports SaladUI object
├── core/
│   ├── component.js        # Base Component class
│   ├── state-machine.js    # State machine implementation
│   ├── hook.js             # SaladUIHook for LiveView integration
│   ├── factory.js          # Component registry and factory
│   └── utils.js            # DOM utilities, animations
└── components/
    └── *.js                # Component-specific JS (dialog.js, select.js, etc.)

storybook/                  # Phoenix app for component development/demos
test/salad_ui/              # Component tests (needs expansion)
```

## Component Development

When creating or modifying components:

1. **Elixir Component**:
   - Use `use SaladUI, :component` at the top
   - Define attributes with `attr` macro, slots with `slot` macro
   - Use `classes/1` helper to merge Tailwind classes
   - Build event mappings via `event_mappings/1` helper
   - Encode options as JSON with `json/1` helper
   - Set `phx-hook="SaladUI"` on root element if JS interaction needed

2. **JavaScript Component** (if interactive):
   - Extend `Component` base class from `core/component.js`
   - Define state machine configuration in `initConfig()` method
   - Implement ARIA configuration for accessibility
   - Register component in `core/factory.js` registry
   - Handle state transitions and update UI accordingly

3. **Testing**:
   - Tests in `test/salad_ui/` directory
   - Currently v1 components lack comprehensive unit tests (contributions welcome)
   - Use storybook app for manual testing during development

4. **Accessibility**:
   - Define `ariaConfig` in JS component
   - Use proper ARIA attributes and roles
   - Implement keyboard navigation
   - Test with screen readers

## Configuration

Application config options (in consuming apps):

```elixir
# config/config.exs
config :salad_ui, :error_translator_function, {MyAppWeb.CoreComponents, :translate_error}
```

## Common Patterns

### Creating a Component with JS Interaction

```elixir
# lib/salad_ui/my_component.ex
defmodule SaladUI.MyComponent do
  use SaladUI, :component

  attr :id, :string, required: true
  attr :open, :boolean, default: false
  attr :"on-open", :any, default: nil
  slot :inner_block, required: true

  def my_component(assigns) do
    event_map = event_mappings(assigns)
    assigns = assign(assigns, :event_map, json(event_map))

    ~H"""
    <div
      id={@id}
      data-component="my-component"
      data-options={json(%{someOption: true})}
      data-event-mappings={@event_map}
      phx-hook="SaladUI"
      data-part="root"
    >
      {render_slot(@inner_block)}
    </div>
    """
  end
end
```

### Controlling Components from LiveView

```elixir
# In your LiveView module
def handle_event("open_dialog", _params, socket) do
  socket = SaladUI.LiveView.send_command(socket, "my-dialog-id", "open")
  {:noreply, socket}
end
```

### Using Variants

```elixir
# Define variant config
config = %{
  variants: %{
    variant: %{
      default: "bg-primary text-primary-foreground",
      outline: "border border-input bg-background"
    },
    size: %{default: "h-9", sm: "h-7", lg: "h-12"}
  },
  default_variants: %{variant: "default", size: "default"}
}

# Apply variants
class = variant_class(config, %{variant: "outline", size: "lg"})
```

## Installation Methods

The library supports two installation modes:

1. **Library Mode** (`mix salad.setup`):
   - Uses components directly from the package
   - Faster setup, no customization
   - Import components: `import SaladUI.Button`

2. **Local Mode** (`mix salad.install`):
   - Copies components to `lib/my_app_web/components/ui/`
   - Full customization possible
   - Custom module prefix support
   - Import: `import MyAppWeb.Components.UI.Button`

## Dependencies

- `phoenix_live_view ~> 1.0`: Core LiveView functionality
- `tw_merge ~> 0.1`: Tailwind class merging
- `igniter ~> 0.5`: Code generation for installation tasks
- `tailwind ~> 0.2`: Tailwind CSS compiler
- Development: `credo`, `styler`, `ex_doc`, `excoveralls`

## Notes

- Uses `Styler` for automatic code formatting
- Phoenix LiveView HTML formatter enabled
- Mix environment paths: test includes `test/support`
- Elixir version: ~> 1.14
- Color schemes defined in `assets/tailwind.colors.json`
- Package files include lib, assets, priv, and docs
