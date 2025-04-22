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

  ## Example
  ```elixir
  send_command(socket, "#dialog", "open")
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

defmodule SaladUI.LiveView.JS do
  @moduledoc """
  Helper functions for integrating SaladUI with Phoenix LiveView using JavaScript commands.
  """

  @doc """
  Dispatch a command to a SaladUI component using JavaScript.
  This is useful for programmatically controlling components from client-side code.

  ## Parameters
  - `js`: The JavaScript object.
  - `command_name`: The name of the command to dispatch.
  - `opts`: Options for the command, including `:detail` for additional parameters.

  ## How it works
  This function use JS.dispatch to send a command to the component similar to `send_command/4`.

  Each component listens for the `salad_ui:command` event and executes the corresponding command similar to the way it handle `send_command/4` from server side .

  ## Example
  ```elixir
  <button
    phx-click={%JS{} |> SaladUI.LiveView.JS.dispatch_command("open", to: "#dialog")}> Click me </button>
  ```
  """
  def dispatch_command(js \\ %Phoenix.LiveView.JS{}, command_name, opts \\ []) do
    details = %{
      command: command_name,
      params: opts[:detail]
    }

    Phoenix.LiveView.JS.dispatch(
      js,
      "salad_ui:command",
      opts |> Keyword.put(:detail, details) |> IO.inspect(label: "dispatch_command")
    )
  end
end

defimpl Jason.Encoder, for: Phoenix.LiveView.JS do
  def encode(value, opts) do
    Jason.Encode.list(value.ops, opts)
  end
end
