defmodule SaladUI.Tooltip do
  @moduledoc """
  Implementation of Tooltip component for SaladUI framework.

  Tooltips provide additional information about an element when hovering over it.

  ## Examples:

      <.tooltip id="help-tooltip">
        <.tooltip_trigger>
          <.button variant="ghost" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-help-circle h-4 w-4">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <path d="M12 17h.01"></path>
            </svg>
          </.button>
        </.tooltip_trigger>
        <.tooltip_content side="top" align="center">
          Need help? Click here for more information.
        </.tooltip_content>
      </.tooltip>
  """
  use SaladUI, :component

  @doc """
  The main tooltip component that manages state and positioning.

  ## Options

  * `:id` - Unique identifier for the tooltip (optional, auto-generated if not provided).
  * `:open-delay` - Delay in milliseconds before opening the tooltip. Defaults to `150`.
  * `:close-delay` - Delay in milliseconds before closing the tooltip. Defaults to `100`.
  * `:on-open` - Handler for tooltip open event.
  * `:on-close` - Handler for tooltip close event.
  * `:class` - Additional CSS classes.
  """
  attr :id, :string, default: nil
  attr :"open-delay", :integer, default: 150, doc: "Delay in milliseconds before opening the tooltip"
  attr :"close-delay", :integer, default: 100, doc: "Delay in milliseconds before closing the tooltip"
  attr :"on-open", :any, default: nil, doc: "Handler for tooltip open event"
  attr :"on-close", :any, default: nil, doc: "Handler for tooltip close event"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tooltip(assigns) do
    assigns = assign_new(assigns, :id, fn -> "tooltip-#{System.unique_integer()}" end)

    # Collect event mappings
    event_map =
      %{}
      |> add_event_mapping(assigns, "opened", :"on-open")
      |> add_event_mapping(assigns, "closed", :"on-close")

    assigns =
      assigns
      |> assign(:event_map, json(event_map))
      |> assign(
        :options,
        json(%{
          openDelay: assigns[:"open-delay"],
          closeDelay: assigns[:"close-delay"],
          animations: get_animation_config()
        })
      )

    ~H"""
    <div
      id={@id}
      class={classes(["relative inline-block", @class])}
      data-component="tooltip"
      data-state="closed"
      data-event-mappings={@event_map}
      data-options={@options}
      data-part="root"
      phx-hook="SaladUI"
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The trigger element that activates the tooltip when hovered.

  If not provided, the first child of the tooltip will be used as trigger.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tooltip_trigger(assigns) do
    ~H"""
    <div data-part="trigger" class={classes(["", @class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The tooltip content that appears when triggered.

  ## Options

  * `:side` - Placement of the tooltip relative to the trigger (top, right, bottom, left). Defaults to `"top"`.
  * `:align` - Alignment of the tooltip (start, center, end). Defaults to `"center"`.
  * `:side-offset` - Distance from the trigger in pixels. Defaults to `4`.
  * `:align-offset` - Offset along the alignment axis. Defaults to `0`.
  * `:class` - Additional CSS classes.
  """
  attr :class, :string, default: nil
  attr :side, :string, values: ~w(top right bottom left), default: "top"
  attr :align, :string, values: ~w(start center end), default: "center"
  attr :"side-offset", :integer, default: 8, doc: "Distance from the trigger in pixels"
  attr :"align-offset", :integer, default: 0, doc: "Offset along the alignment axis"
  attr :rest, :global
  slot :inner_block, required: true

  def tooltip_content(assigns) do
    assigns =
      assign(assigns,
        side_offset: assigns[:"side-offset"],
        align_offset: assigns[:"align-offset"]
      )

    ~H"""
    <div
      data-part="content"
      data-side={@side}
      data-align={@align}
      data-side-offset={@side_offset}
      data-align-offset={@align_offset}
      class={
        classes([
          "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          @class
        ])
      }
      hidden
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  defp get_animation_config do
    %{
      "closed_to_open" => %{
        duration: 200,
        target_part: "content"
      },
      "open_to_closed" => %{
        duration: 130,
        target_part: "content"
      }
    }
  end
end
