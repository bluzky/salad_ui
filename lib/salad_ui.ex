defmodule SaladUI do
  @moduledoc """
  SaladUI - A comprehensive UI component library for Phoenix LiveView applications.

  SaladUI provides a collection of accessible, customizable UI components that combine
  server-side rendering with client-side interactivity. Built specifically for Phoenix
  LiveView, it offers seamless integration between Elixir and JavaScript.

  ## Features

  - **40+ UI Components** - Buttons, forms, overlays, navigation, and data display
  - **Accessibility First** - ARIA compliant with keyboard navigation and screen reader support
  - **LiveView Integration** - Two-way communication between server and client
  - **Customizable** - Tailwind CSS based with variant support
  - **Type Safe** - Full attribute validation and documentation

  ## Quick Start

  Add SaladUI to your Phoenix application:

      # In your core components module
      use SaladUI

      # In templates
      <.button variant="primary" phx-click="save">
        Save Changes
      </.button>

  ## Component Categories

  ### Layout & Structure
  - `card/1` - Content containers with headers and footers
  - `separator/1` - Visual dividers between content sections
  - `scroll_area/1` - Custom scrollable containers

  ### Forms & Input
  - `button/1` - Interactive buttons with multiple variants
  - `input/1` - Text inputs with validation support
  - `textarea/1` - Multi-line text input areas
  - `checkbox/1` - Binary choice inputs
  - `radio_group/1` - Single choice from multiple options
  - `select/1` - Dropdown selection menus
  - `slider/1` - Range value selection
  - `switch/1` - Toggle controls
  - `form/1`, `form_item/1`, `form_label/1` - Form structure and validation

  ### Navigation
  - `tabs/1` - Tabbed content navigation
  - `breadcrumb/1` - Hierarchical navigation paths
  - `pagination/1` - Page navigation controls
  - `sidebar/1` - Application navigation sidebars

  ### Overlays & Dialogs
  - `dialog/1` - Modal dialogs and confirmations
  - `alert_dialog/1` - Alert and confirmation dialogs
  - `sheet/1` - Slide-out panels
  - `popover/1` - Contextual popup content
  - `tooltip/1` - Hover information displays
  - `hover_card/1` - Rich hover content
  - `dropdown_menu/1` - Contextual action menus

  ### Feedback & Status
  - `alert/1` - Status messages and notifications
  - `badge/1` - Labels and status indicators
  - `progress/1` - Progress bars and loading states
  - `skeleton/1` - Loading placeholder content

  ### Data Display
  - `table/1` - Data tables with sorting and selection
  - `chart/1` - Data visualization charts
  - `avatar/1` - User profile images
  - `accordion/1` - Collapsible content sections

  ### Utility
  - `toggle/1`, `toggle_group/1` - Toggle controls and groups
  - `collapsible/1` - Expandable content areas
  - `command/1` - Command palette interfaces

  ## Architecture

  SaladUI uses a hybrid architecture combining:

  - **Phoenix Function Components** - Server-side rendering with HEEx templates
  - **JavaScript State Machines** - Client-side behavior and interactivity
  - **LiveView Hooks** - Seamless server-client communication
  - **Automatic ARIA** - Accessibility attributes managed by the framework

  ## Usage Patterns

  ### Basic Component Usage

      <.button variant="outline" size="lg">
        Large Outline Button
      </.button>

  ### Form Integration

      <.form for={@form} phx-change="validate" phx-submit="save">
        <.form_item>
          <.form_label>Email</.form_label>
          <.form_control>
            <.input field={@form[:email]} type="email" />
          </.form_control>
          <.form_message field={@form[:email]} />
        </.form_item>
      </.form>

  ### Interactive Components with Events

      <.dialog id="user-dialog" on-open={JS.push("dialog_opened")}>
        <.dialog_trigger>
          <.button>Edit Profile</.button>
        </.dialog_trigger>
        <.dialog_content>
          <!-- Dialog content -->
        </.dialog_content>
      </.dialog>

  ### Server-Client Communication

      # Send commands to components from LiveView
      def handle_event("open_dialog", _params, socket) do
        socket = SaladUI.LiveView.send_command(socket, "user-dialog", "open")
        {:noreply, socket}
      end

  ## Customization

  Components support extensive customization through:

  - **Variants** - Pre-defined style variations (e.g., `variant="destructive"`)
  - **Classes** - Custom CSS classes via the `class` attribute
  - **Slots** - Flexible content areas within components
  - **Attributes** - Comprehensive configuration options

  ## Accessibility

  All components include:

  - Proper ARIA attributes and roles
  - Keyboard navigation support
  - Focus management for overlays
  - Screen reader announcements
  - High contrast support

  ## Development

  When extending SaladUI:

  1. **Follow naming conventions** - Use `kebab-case` for data attributes
  2. **Implement state machines** - Define clear states and transitions
  3. **Handle accessibility** - Include ARIA configuration
  4. **Test thoroughly** - Verify keyboard and screen reader usage
  5. **Document examples** - Provide clear usage examples
  """

  def component do
    quote do
      use Phoenix.Component

      import SaladUI.Helpers

      # alias OrangeCmsWeb.Components.LadUI.LadJS
      alias Phoenix.LiveView.JS

      defp classes(input) do
        TwMerge.merge(List.flatten(input))
      end
    end
  end

  @doc """
  When used, dispatch to the appropriate macro.
  """
  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end

  defmacro __using__(_) do
    quote do
      import SaladUI.Accordion
      import SaladUI.Alert
      import SaladUI.AlertDialog
      import SaladUI.Avatar
      import SaladUI.Badge
      import SaladUI.Breadcrumb
      import SaladUI.Button
      import SaladUI.Card
      import SaladUI.Chart
      import SaladUI.Checkbox
      import SaladUI.Collapsible
      import SaladUI.Dialog
      import SaladUI.DropdownMenu
      import SaladUI.Form
      import SaladUI.Helpers
      import SaladUI.HoverCard
      import SaladUI.Icon
      import SaladUI.Input
      import SaladUI.Label
      import SaladUI.Menu
      import SaladUI.Pagination
      import SaladUI.Popover
      import SaladUI.Progress
      import SaladUI.RadioGroup
      import SaladUI.ScrollArea
      import SaladUI.Select
      import SaladUI.Separator
      import SaladUI.Sheet
      import SaladUI.Sidebar
      import SaladUI.Skeleton
      import SaladUI.Slider
      import SaladUI.Switch
      import SaladUI.Table
      import SaladUI.Tabs
      import SaladUI.Textarea
      import SaladUI.Toggle
      import SaladUI.ToggleGroup
      import SaladUI.Tooltip
    end
  end
end
