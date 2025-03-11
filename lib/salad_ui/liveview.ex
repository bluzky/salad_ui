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

defimpl Jason.Encoder, for: Phoenix.LiveView.JS do
  def encode(value, opts) do
    Jason.Encode.list(value.ops, opts)
  end
end
