defmodule SaladUI.LiveView do
  @moduledoc """
  Helper functions for integrating SaladUI with Phoenix LiveView.
  """

  @doc """
  Send a command to a SaladUI component.
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
  @moduledoc false
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
