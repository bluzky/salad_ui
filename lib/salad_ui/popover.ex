defmodule SaladUI.Popover do
  @moduledoc """
  Enhanced implementation of popover component from https://ui.shadcn.com/docs/components/popover

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

  ## Options

  * `:id` - Required unique identifier for the popover.
  * `:open` - Whether the popover is initially open. Defaults to `false`.
  * `:animation` - Whether to animate the popover. Defaults to `true`.
  * `:on-open` - Handler for popover open event.
  * `:on-close` - Handler for popover close event.
  * `:class` - Additional CSS classes.
  """
  attr :id, :string, required: true, doc: "Unique identifier for the popover"
  attr :open, :boolean, default: false, doc: "Whether the popover is initially open"
  attr :"portal-container", :string, default: nil, doc: "The portal container to render the popover in"
  attr :class, :string, default: nil
  attr :"on-open", :any, default: nil, doc: "Handler for popover open event"
  attr :"on-close", :any, default: nil, doc: "Handler for popover close event"
  attr :rest, :global
  slot :inner_block, required: true

  def popover(assigns) do
    # Collect event mappings
    event_map =
      %{}
      |> add_event_mapping(assigns, "opened", :"on-open")
      |> add_event_mapping(assigns, "closed", :"on-close")

    assigns =
      assigns
      |> assign(:event_map, Jason.encode!(event_map))
      |> assign(:initial_state, if(assigns.open, do: "open", else: "closed"))
      |> assign(
        :options,
        Jason.encode!(%{
          animations: get_animation_config(),
          portalContainer: assigns[:"portal-container"]
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
      data-action="toggle"
      class={classes(["", @class])}
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The popover content that appears when triggered.

  ## Options

  * `:side` - Placement of the popover relative to the trigger (top, right, bottom, left). Defaults to `"bottom"`.
  * `:align` - Alignment of the popover (start, center, end). Defaults to `"center"`.
  * `:side-offset` - Distance from the trigger in pixels. Defaults to `8`.
  * `:align-offset` - Offset along the alignment axis. Defaults to `0`.
  * `:class` - Additional CSS classes.
  """
  attr :class, :string, default: nil
  attr :side, :string, values: ~w(top right bottom left), default: "bottom"
  attr :align, :string, values: ~w(start center end), default: "center"
  attr :"side-offset", :integer, default: 8, doc: "Distance from the trigger in pixels"
  attr :"align-offset", :integer, default: 0, doc: "Offset along the alignment axis"
  attr :rest, :global
  slot :inner_block, required: true

  def popover_content(assigns) do
    assigns = assign(assigns, side_offset: assigns[:"side-offset"], align_offset: assigns[:"align-offset"])
    ~H"""
    <div
      data-part="positioner"
      data-side={@side}
      data-align={@align}
      data-side-offset={@side_offset}
      data-align-offset={@align_offset}
      class="absolute z-50"
      hidden
    >
      <div
        data-part="content"
        data-side={@side}
        data-align={@align}
        class={
          classes([
            "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
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
        duration: 130,
        target_part: "content"
      }
    }
  end
end
