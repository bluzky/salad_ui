# SaladUI Communication Guide

This document explains how communication works between different parts of the SaladUI system: client-to-server, server-to-client, and client-to-client.

## Overview

SaladUI uses a hybrid architecture with multiple communication channels:

- **Client → Server**: JavaScript components send events to LiveView
- **Server → Client**: LiveView sends commands to JavaScript components
- **Client → Client**: JavaScript components communicate directly with each other

## Client → Server Communication

JavaScript components send events to the Phoenix LiveView server.

### 1. Event Mapping Configuration

In your Elixir component, map client events to server handlers:

```elixir
defmodule SaladUI.Dialog do
  def dialog(assigns) do
    event_map = %{}
    |> add_event_mapping(assigns, "opened", :"on-open")
    |> add_event_mapping(assigns, "closed", :"on-close")
    |> add_event_mapping(assigns, "item-selected", :"on-item-selected")

    assigns = assign(assigns, :event_map, json(event_map))

    ~H"""
    <div
      data-component="dialog"
      data-event-mappings={@event_map}
      phx-hook="SaladUI"
    >
      <!-- component content -->
    </div>
    """
  end
end
```

### 2. Sending Events from JavaScript

In your JavaScript component, use `pushEvent()` to send data to the server:

```javascript
class DialogComponent extends Component {
  onOpenEnter() {
    // Send simple event
    this.pushEvent("opened");

    // Send event with data
    this.pushEvent("opened", {
      dialogId: this.el.id,
      timestamp: Date.now()
    });
  }

  selectItem(item) {
    // Send structured data
    this.pushEvent("item-selected", {
      value: item.value,
      label: item.textContent,
      index: this.items.indexOf(item)
    });
  }
}
```

### 3. Handling Events in LiveView

Handle the events in your LiveView module:

```elixir
defmodule MyAppWeb.PageLive do
  use MyAppWeb, :live_view

  # Event handler matching the event mapping
  def handle_event("dialog_opened", params, socket) do
    %{"dialogId" => dialog_id, "timestamp" => timestamp} = params

    IO.puts("Dialog #{dialog_id} opened at #{timestamp}")
    {:noreply, socket}
  end

  def handle_event("item_selected", params, socket) do
    %{"value" => value, "label" => label} = params

    socket =
      socket
      |> assign(:selected_item, value)
      |> put_flash(:info, "Selected: #{label}")

    {:noreply, socket}
  end
end
```

### 4. Using Phoenix.LiveView.JS

For simple interactions, use JS commands directly in templates:

```heex
<.dialog on-open={JS.push("dialog_opened")} on-close={JS.push("dialog_closed")}>
  <.dialog_trigger>
    <.button>Open Dialog</.button>
  </.dialog_trigger>
  <.dialog_content>
    <.button phx-click={JS.push("action_clicked", value: %{action: "save"})}>
      Save
    </.button>
  </.dialog_content>
</.dialog>
```

## Server → Client Communication

The server sends commands to JavaScript components to control their behavior.

### 1. Using SaladUI.LiveView.send_command/4

Send commands from LiveView to specific components:

```elixir
defmodule MyAppWeb.PageLive do
  def handle_event("open_dialog", _params, socket) do
    # Send command to component
    socket = SaladUI.LiveView.send_command(socket, "user-dialog", "open")
    {:noreply, socket}
  end

  def handle_event("update_chart", _params, socket) do
    new_data = get_chart_data()

    # Send command with parameters
    socket = SaladUI.LiveView.send_command(socket, "sales-chart", "update", %{
      data: new_data,
      options: %{animation: true}
    })

    {:noreply, socket}
  end

  def handle_event("close_all_dialogs", _params, socket) do
    # Send commands to multiple components
    socket =
      socket
      |> SaladUI.LiveView.send_command("dialog-1", "close")
      |> SaladUI.LiveView.send_command("dialog-2", "close")
      |> SaladUI.LiveView.send_command("dialog-3", "close")

    {:noreply, socket}
  end
end
```

### 2. Handling Commands in JavaScript

Components handle commands in the `handleCommand()` method:

```javascript
class ChartComponent extends Component {
  handleCommand(command, params) {
    switch (command) {
      case "update":
        this.updateChart(params.data, params.options);
        return true;

      case "reset":
        this.resetChart();
        return true;

      case "highlight":
        this.highlightDataPoint(params.index);
        return true;

      default:
        return super.handleCommand(command, params);
    }
  }

  updateChart(data, options = {}) {
    this.chart.data = data;
    if (options.animation) {
      this.chart.update('active');
    } else {
      this.chart.update('none');
    }
  }
}
```

## Client → Client Communication

Components can communicate directly with each other using JavaScript commands without server involvement.

### Using SaladUI.JS.dispatch_command/3

Send commands directly between components using JavaScript actions in templates:

```heex
<!-- Button that opens a dialog -->
<.button phx-click={SaladUI.JS.dispatch_command("open", to: "#user-dialog")}>
  Open Dialog
</.button>

<!-- Button that updates a chart -->
<.button phx-click={SaladUI.JS.dispatch_command("update",
  to: "#sales-chart",
  detail: %{data: @new_chart_data})}>
  Refresh Chart
</.button>

<!-- Toggle multiple components -->
<.button phx-click={
  %JS{}
  |> SaladUI.JS.dispatch_command("toggle", to: "#sidebar")
  |> SaladUI.JS.dispatch_command("close", to: "#dropdown")
}>
  Toggle Layout
</.button>
```

### How Client-to-Client Works

When you use `SaladUI.JS.dispatch_command/3`, here's what happens:

1. **JavaScript Generation**: The function generates JavaScript that dispatches a custom DOM event
2. **Event Dispatch**: The browser fires a `salad_ui:command` event with the command details
3. **Component Reception**: The target component automatically receives and processes the command
4. **No Server Round-trip**: Everything happens in the browser without contacting the server

### Under the Hood

```javascript
// What SaladUI.JS.dispatch_command generates
document.dispatchEvent(new CustomEvent('salad_ui:command', {
  detail: {
    command: 'open',
    params: { data: newData },
    target: 'user-dialog'
  }
}));

// Components automatically listen for this event from both client and server
class Component {
  setupEvents() {
    document.addEventListener('salad_ui:command', (event) => {
      const { command, params, target } = event.detail;

      if (target === this.el.id) {
        this.handleCommand(command, params);
      }
    });
  }
}
```

### Command Parameters

You can pass data between components using the `detail` parameter:

```heex
<!-- Pass simple data -->
<.button phx-click={SaladUI.JS.dispatch_command("highlight",
  to: "#data-table",
  detail: %{row_id: @selected_row})}>
  Highlight Row
</.button>

<!-- Pass complex data -->
<.button phx-click={SaladUI.JS.dispatch_command("filter",
  to: "#product-list",
  detail: %{
    filters: %{
      category: @category,
      price_range: %{min: @min_price, max: @max_price},
      in_stock: true
    }
  })}>
  Apply Filters
</.button>
```

### Chaining Commands

Execute multiple commands in sequence:

```heex
<.button phx-click={
  %JS{}
  |> SaladUI.JS.dispatch_command("close", to: "#main-dialog")
  |> SaladUI.JS.dispatch_command("open", to: "#confirmation-dialog")
  |> SaladUI.JS.dispatch_command("focus", to: "#cancel-button")
}>
  Show Confirmation
</.button>
```

### Handling Commands in Components

Components receive commands through their `handleCommand` method the same way it handle server command:

```javascript
class DataTableComponent extends Component {
  handleCommand(command, params) {
    switch (command) {
      case "highlight":
        this.highlightRow(params.row_id);
        return true;

      case "filter":
        this.applyFilters(params.filters);
        return true;

      case "reset":
        this.clearFilters();
        this.clearHighlight();
        return true;

      default:
        return super.handleCommand(command, params);
    }
  }

  highlightRow(rowId) {
    // Remove previous highlights
    this.el.querySelectorAll('.highlighted').forEach(row => {
      row.classList.remove('highlighted');
    });

    // Highlight specific row
    const targetRow = this.el.querySelector(`[data-row-id="${rowId}"]`);
    if (targetRow) {
      targetRow.classList.add('highlighted');
    }
  }

  applyFilters(filters) {
    this.currentFilters = filters;
    this.filterRows();
    this.updateUI();
  }
}
```

## Communication Patterns Summary

### When to Use Each Pattern

**Client → Server**:
- User actions that need server processing
- Form submissions and validation
- Data persistence
- Navigation changes
- Real-time updates to other users

**Server → Client**:
- Update component state based on server events
- Show/hide components based on permissions
- Update data displays after server processing
- Coordinate multiple components from server logic

**Client → Client**:
- Immediate UI feedback without server round-trip
- Filter/search interactions
- Component coordination and synchronization
- Local state management
