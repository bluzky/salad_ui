# dialog.ex
defmodule SaladUI.Components.Dialog do
  use Phoenix.Component
  use Phoenix.HTML

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
    # Determine which events to send to server
    server_events = []
    server_events = if(assigns.on_open, do: ["opened" | server_events], else: server_events)
    server_events = if(assigns.on_close, do: ["closed" | server_events], else: server_events)

    # Prepare the options JSON
    options = Jason.encode!(%{
      closeOnOutsideClick: assigns.close_on_outside_click,
      animations: get_animation_config(assigns.animation_type)
    })

    # Set initial state based on open attribute
    initial_state = if(assigns.open, do: "open", else: "closed")

    ~H"""
    <div
      id={@id}
      class={"saladui-dialog #{@class}"}
      data-component="dialog"
      data-options={options}
      data-state={initial_state}
      data-server-events={Enum.join(server_events, " ")}
      style={if(@open, do: "display: flex", else: "display: none")}
      phx-hook="SaladUI"
    >
      <%= if render_slot(@trigger) do %>
        <div data-trigger>
          <%= render_slot(@trigger) %>
        </div>
      <% end %>

      <div data-part="content" class="saladui-dialog-content">
        <%= if @title do %>
          <h2 data-part="title" id={"#{@id}-title"} class="saladui-dialog-title">
            <%= @title %>
          </h2>
        <% end %>

        <%= if @description do %>
          <p data-part="description" id={"#{@id}-desc"} class="saladui-dialog-description">
            <%= @description %>
          </p>
        <% end %>

        <div data-part="body" class="saladui-dialog-body">
          <%= render_slot(@inner_block) %>
        </div>

        <%= if @close_button do %>
          <button
            type="button"
            data-part="close-button"
            class="saladui-dialog-close-button"
            aria-label="Close dialog"
            data-action="close"
          >
            &times;
          </button>
        <% end %>
      </div>
    </div>
    """
  end

  # Get predefined animation config based on animation type
  defp get_animation_config("none"), do: nil

  defp get_animation_config("fade") do
    %{
      "closed_to_open" => %{
        start_class: "saladui-fade-in",
        end_class: "saladui-fade-in-active",
        duration: 250,
        display: "flex",
        timing: "ease-out"
      },
      "open_to_closed" => %{
        start_class: "saladui-fade-out",
        end_class: "saladui-fade-out-active",
        duration: 200,
        display: "flex",
        timing: "ease-in"
      }
    }
  end

  defp get_animation_config("scale") do
    %{
      "closed_to_open" => %{
        start_class: "saladui-dialog-enter",
        end_class: "saladui-dialog-enter-active",
        duration: 300,
        display: "flex",
        timing: "ease-out"
      },
      "open_to_closed" => %{
        start_class: "saladui-dialog-exit",
        end_class: "saladui-dialog-exit-active",
        duration: 250,
        display: "flex",
        timing: "ease-in"
      }
    }
  end

  defp get_animation_config("slide-down") do
    %{
      "closed_to_open" => %{
        start_class: "saladui-slide-down",
        end_class: "saladui-slide-down-active",
        duration: 350,
        display: "flex",
        timing: "ease-out"
      },
      "open_to_closed" => %{
        start_class: "saladui-slide-up",
        end_class: "saladui-slide-up-active",
        duration: 300,
        display: "flex",
        timing: "ease-in"
      }
    }
  end

  defp get_animation_config("slide-up") do
    %{
      "closed_to_open" => %{
        start_class: "saladui-slide-up-reverse",
        end_class: "saladui-slide-up-reverse-active",
        duration: 350,
        display: "flex",
        timing: "ease-out"
      },
      "open_to_closed" => %{
        start_class: "saladui-slide-down-reverse",
        end_class: "saladui-slide-down-reverse-active",
        duration: 300,
        display: "flex",
        timing: "ease-in"
      }
    }
  end

  defp get_animation_config(_), do: get_animation_config("fade")
end
