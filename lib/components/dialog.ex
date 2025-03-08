defmodule SaladUI.Components.Dialog do
  @moduledoc false
  use Phoenix.Component

  attr :id, :string, required: true
  attr :class, :string, default: ""
  attr :title, :string, default: nil
  attr :description, :string, default: nil
  attr :close_button, :boolean, default: true
  attr :close_on_outside_click, :boolean, default: true
  attr :open, :boolean, default: false
  attr :on_open, :any, default: nil
  attr :on_close, :any, default: nil
  attr :animation_type, :string, default: "fade", values: ["none", "fade", "scale", "slide-down", "slide-up"]
  slot :trigger
  slot :inner_block, required: true

  def dialog(assigns) do
    # Create a mapping of client events to server handlers
    event_mappings = %{}

    # Add opened -> on_open mapping if on_open is provided
    event_mappings =
      if assigns.on_open do
        Map.put(event_mappings, "opened", assigns.on_open)
      else
        event_mappings
      end

    # Add closed -> on_close mapping if on_close is provided
    event_mappings =
      if assigns.on_close do
        Map.put(event_mappings, "closed", assigns.on_close)
      else
        event_mappings
      end

    # Encode the event mappings
    event_mappings_json = Jason.encode!(event_mappings)

    # Set initial state based on open attribute
    initial_state = if(assigns.open, do: "open", else: "closed")

    # Prepare the options JSON
    options =
      Jason.encode!(%{
        closeOnOutsideClick: assigns.close_on_outside_click,
        animations: get_animation_config(assigns.animation_type)
      })

    ~H"""
    <div
      id={@id}
      class={"saladui-dialog #{@class}"}
      data-component="dialog"
      data-options={options}
      data-state={initial_state}
      data-event-mappings={event_mappings_json}
      phx-hook="SaladUI"
      data-part="root"
    >
      <%= if render_slot(@trigger) do %>
        <div data-part="trigger" class="saladui-dialog-trigger">
          {render_slot(@trigger)}
        </div>
      <% end %>

      <div
        data-part="content"
        class="saladui-dialog-content"
        aria-hidden={if(@open, do: "false", else: "true")}
        role="dialog"
      >
        <div class="saladui-dialog-overlay" data-action="close"></div>
        <div class="saladui-dialog-panel">
          <div class="saladui-dialog-header">
            <%= if @title do %>
              <h2 id={"#{@id}-title"} class="saladui-dialog-title">
                {@title}
              </h2>
            <% end %>

            <%= if @close_button do %>
              <button
                type="button"
                data-part="close-trigger"
                class="saladui-dialog-close-button"
                aria-label="Close dialog"
                data-action="close"
              >
                &times;
              </button>
            <% end %>
          </div>

          <%= if @description do %>
            <p id={"#{@id}-desc"} class="saladui-dialog-description">
              {@description}
            </p>
          <% end %>

          <div class="saladui-dialog-body">
            {render_slot(@inner_block)}
          </div>
        </div>
      </div>
    </div>
    """
  end

  # Get predefined animation config based on animation type
  defp get_animation_config("none"), do: nil

  defp get_animation_config(_) do
    %{
      "closed_to_open" => %{
        start_class: "saladui-fade-in",
        end_class: "saladui-fade-in-active",
        duration: 250,
        display: "flex",
        # Keep display as-is after animation
        final_display: nil,
        timing: "ease-out",
        # Apply to content part only
        target_part: "content"
      },
      "open_to_closed" => %{
        start_class: "saladui-fade-out",
        end_class: "saladui-fade-out-active",
        duration: 200,
        # Keep visible during animation
        display: "flex",
        # Hide after animation completes
        final_display: "none",
        timing: "ease-in",
        # Apply to content part only
        target_part: "content"
      }
    }
  end
end
