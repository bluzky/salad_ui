defmodule SaladUI.LiveView do
  @moduledoc """
  Helper functions for integrating SaladUI with Phoenix LiveView.
  """

  @doc """
  Send a command to a SaladUI component.
  This is useful for programmatically controlling components from server-side code.
  ## Parameters
  - `socket`: The LiveView socket.
  - `component_id`: The ID of the component to send the command to.
  - `command`: The name of the command to send. Command could be any transitions that component state machine support or custom commands that supported by component.
  - `params`: Optional parameters for the command.

  ## How it works
  This pushes a `saladui:command` (no underscore) event over the LiveView socket, handled
  client-side via `handleEvent`. For dispatching a command from client-side JS instead, see
  `SaladUI.JS.dispatch_command/3`, which uses a separate `salad_ui:command` DOM event.

  ## Example
  ```elixir
  send_command(socket, "dialog", "open")
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
  Helper functions for integrating SaladUI with Phoenix LiveView using JavaScript commands.
  """

  alias Phoenix.LiveView.JS

  @doc """
  Dispatch a command to a SaladUI component using JavaScript.
  This is useful for programmatically controlling components from client-side code.

  ## Parameters
  - `js`: The JavaScript object.
  - `command_name`: The name of the command to dispatch.
  - `opts`: Options for the command, including `:detail` for additional parameters.

  ## How it works
  This function dispatches a `salad_ui:command` DOM custom event (via `JS.dispatch/3`) that the
  target component listens for and handles the same way it handles `send_command/4` — both end
  up calling the component's `handleCommand`.

  Note this is a different, client-only event from the one `send_command/4` pushes from the
  server (`saladui:command`, no underscore, delivered over the LiveView socket). The two exist
  as separate channels by design: this one is a real DOM event dispatched directly at a target
  element, while `send_command/4`'s is a LiveView `push_event` handled via `handleEvent`.

  ## Example
  ```elixir
  <button
    phx-click={%JS{} |> SaladUI.JS.dispatch_command("open", to: "#dialog")}> Click me </button>
  ```
  """
  def dispatch_command(js \\ %JS{}, command_name, opts \\ []) do
    details = %{
      command: command_name,
      params: opts[:detail]
    }

    JS.dispatch(
      js,
      "salad_ui:command",
      Keyword.put(opts, :detail, details)
    )
  end
end

if !Code.ensure_loaded?(Jason.Encoder.Phoenix.LiveView.JS) do
  defimpl Jason.Encoder, for: Phoenix.LiveView.JS do
    def encode(value, opts) do
      Jason.Encode.list(value.ops, opts)
    end
  end
end
