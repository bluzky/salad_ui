# saladui_live_view.ex
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

  @doc """
  Send a custom event to a SaladUI component.
  """
  def send_event(socket, component_id, event, params \\ %{}) do
    Phoenix.LiveView.push_event(socket, "saladui:event", %{
      event: event,
      params: params,
      target: component_id
    })
  end
end
