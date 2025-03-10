defmodule SaladUI.Popover do
  @moduledoc """
  Implementation of popover component from https://ui.shadcn.com/docs/components/popover

  ## Example:

      <.popover id="profile-popover">
        <.popover_trigger>
          <.button variant="outline">Open Popover</.button>
        </.popover_trigger>
        <.popover_content side="bottom" align="center">
          <div class="p-4">
            <h3 class="font-medium">Profile</h3>
            <p class="mt-2">View and edit your profile details</p>
          </div>
        </.popover_content>
      </.popover>
  """
  use SaladUI, :component

  @doc """
  The main popover component that manages state and positioning.
  """
  attr :id, :string, required: true, doc: "Unique identifier for the popover"
  attr :open, :boolean, default: false, doc: "Whether the popover is initially open"
  attr :class, :string, default: nil
  attr :on_open, :any, default: nil, doc: "Handler for popover open event"
  attr :on_close, :any, default: nil, doc: "Handler for popover close event"
  attr :rest, :global
  slot :inner_block, required: true

  def popover(assigns) do
    # Collect event mappings
    event_map =
      %{}
      |> add_event_mapping(assigns, "opened", :on_open)
      |> add_event_mapping(assigns, "closed", :on_close)

    assigns =
      assigns
      |> assign(:event_map, Jason.encode!(event_map))
      |> assign(:initial_state, if(assigns.open, do: "open", else: "closed"))
      |> assign(
        :options,
        Jason.encode!(%{
          animations: get_animation_config()
        })
      )

    ~H"""
    <div
      id={@id}
      class={classes(["relative inline-block", @class])}
      data-component="popover"
      data-state={@initial_state}
      data-event-mappings={@event_map}
      data-options={@options}
      phx-hook="SaladUI"
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The trigger element that toggles the popover.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def popover_trigger(assigns) do
    ~H"""
    <div
      data-part="trigger"
      data-action="open"
      class={classes(["", @class])}
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The popover content that appears when triggered.
  """
  attr :class, :string, default: nil
  attr :side, :string, values: ~w(top right bottom left), default: "bottom"
  attr :align, :string, values: ~w(start center end), default: "center"
  attr :rest, :global
  slot :inner_block, required: true

  def popover_content(assigns) do
    ~H"""
    <div data-part="positioner" data-side={@side} data-align={@align} class="absolute z-50">
      <div
        data-part="content"
        class={
          classes([
            "rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
            "animate-in fade-in-0 zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            @class
          ])
        }
        {@rest}
      >
        {render_slot(@inner_block)}
      </div>
    </div>
    """
  end

  defp get_animation_config do
    %{
      "open_to_closed" => %{
        duration: 150,
        target_part: "content"
      }
    }
  end
end
