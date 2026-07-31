defmodule SaladUI.LiveView do
  @moduledoc """
  Helper functions for integrating SaladUI components with Phoenix LiveView.

  SaladUI components communicate with LiveView in two directions:

  ## Component events (client → server)

  Interactive components expose `on-*` attributes such as `on-open`, `on-close`,
  `on-value-changed`, and `on-select`. These attributes map component lifecycle or
  interaction events to LiveView handlers.

  Event attributes accept either:

  - a server event name string, pushed with `pushEventTo/3`
  - a `%Phoenix.LiveView.JS{}` command, executed on the component root

  ```heex
  <.sheet
    id="profile-sheet"
    on-open="sheet_opened"
    on-close={JS.push("sheet_closed")}
  >
    ...
  </.sheet>
  ```

  ```elixir
  def handle_event("sheet_opened", params, socket) do
    # params include component metadata such as componentId and component
    {:noreply, socket}
  end

  def handle_event("sheet_closed", _params, socket) do
    {:noreply, socket}
  end
  ```

  Components emit their documented client events when state changes or user
  interactions occur. Common dialog-like events are `open` and `close`.

  ## Server commands (server → client)

  Use `send_command/4` inside LiveView callbacks to control a component by id.
  Commands map to component state-machine transitions or component-specific commands.
  Common commands are `"open"`, `"close"`, and `"toggle"`.

  ```elixir
  def handle_event("open_profile", _params, socket) do
    socket = SaladUI.LiveView.send_command(socket, "profile-sheet", "open")
    {:noreply, socket}
  end

  def handle_event("close_profile", _params, socket) do
    socket = SaladUI.LiveView.send_command(socket, "profile-sheet", "close")
    {:noreply, socket}
  end
  ```

  `send_command/4` pushes the LiveView event `"saladui:command"` to the browser.
  SaladUI's hook receives it, matches `target` against the component root id, and calls
  the component's `handleCommand(command, params)`.

  ## Client-side commands

  Use `SaladUI.JS.dispatch_command/3` when a LiveView JS command should control a
  component directly in the browser.

  ```heex
  <.button phx-click={%JS{} |> SaladUI.JS.dispatch_command("open", to: "#profile-sheet")}>
    Open
  </.button>
  ```

  This dispatches a DOM event named `"salad_ui:command"` on the target element.
  """

  @doc """
  Send a command from a LiveView process to a SaladUI component.

  ## Parameters

  - `socket` - LiveView socket.
  - `component_id` - ID of the target component root.
  - `command` - Command or state-machine transition name, such as `"open"`,
    `"close"`, or `"toggle"`.
  - `params` - Optional command payload. Defaults to `%{}`.

  ## Example

  ```elixir
  socket = SaladUI.LiveView.send_command(socket, "dialog", "open")
  ```

  With params:

  ```elixir
  socket = SaladUI.LiveView.send_command(socket, "chart", "update", %{series: data})
  ```
  """
  def send_command(socket, component_id, command, params \\ %{}) do
    Phoenix.LiveView.push_event(socket, "saladui:command", %{
      command: command,
      params: params,
      target: component_id
    })
  end
end

defmodule SaladUI.JS do
  @moduledoc """
  Helper functions for controlling SaladUI components from `Phoenix.LiveView.JS`.
  """

  alias Phoenix.LiveView.JS

  @doc """
  Dispatch a command to a SaladUI component using a LiveView JS command.

  This is useful when client-side UI actions should control another SaladUI
  component without a server round trip.

  ## Parameters

  - `js` - `%Phoenix.LiveView.JS{}` pipeline. Defaults to `%JS{}`.
  - `command_name` - Command or state-machine transition name.
  - `opts` - Options passed to `JS.dispatch/3`. Use `:to` to target a component
    selector and `:detail` for command params. Client commands default to
    `bubbles: false` so nested SaladUI components do not receive the same command.

  ## How it works

  This dispatches a `"salad_ui:command"` DOM custom event. The target SaladUI
  component receives it and calls `handleCommand(command, params)`, same as server
  commands sent by `SaladUI.LiveView.send_command/4`.

  ## Example

  ```heex
  <.button phx-click={%JS{} |> SaladUI.JS.dispatch_command("open", to: "#dialog")}>
    Open dialog
  </.button>
  ```

  With params:

  ```heex
  <.button
    phx-click={
      %JS{}
      |> SaladUI.JS.dispatch_command("update", to: "#chart", detail: %{series: @series})
    }
  >
    Update chart
  </.button>
  ```
  """
  def dispatch_command(command_name) do
    dispatch_command(%JS{}, command_name, [])
  end

  def dispatch_command(command_name, opts) when is_list(opts) do
    dispatch_command(%JS{}, command_name, opts)
  end

  def dispatch_command(%JS{} = js, command_name, opts \\ []) do
    details = %{
      command: command_name,
      params: Keyword.get(opts, :detail, %{}) || %{}
    }

    opts =
      opts
      |> Keyword.put(:detail, details)
      |> Keyword.put_new(:bubbles, false)

    JS.dispatch(js, "salad_ui:command", opts)
  end
end

if !Code.ensure_loaded?(Jason.Encoder.Phoenix.LiveView.JS) do
  defimpl Jason.Encoder, for: Phoenix.LiveView.JS do
    def encode(value, opts) do
      Jason.Encode.list(value.ops, opts)
    end
  end
end
