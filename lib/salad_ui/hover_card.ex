defmodule SaladUI.HoverCard do
  @moduledoc """
  Implementation of hover card component with interactive positioning functionality.

  HoverCards show additional information when users hover over an element,
  similar to tooltips but with more complex content.

  ## Example:

      <.hover_card id="user-card" open-delay={300} close-delay={200} on-open={JS.push("card_opened")}>
        <.hover_card_trigger>
          <.button variant="link">@salad_ui</.button>
        </.hover_card_trigger>
        <.hover_card_content side="top" align="center">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <img src="/images/avatar.png" class="h-10 w-10 rounded-full" />
              <div>
                <h3 class="font-medium">SaladUI</h3>
                <p class="text-sm text-muted-foreground">@salad_ui</p>
              </div>
            </div>
            <p class="text-sm">UI Component Library for LiveView</p>
          </div>
        </.hover_card_content>
      </.hover_card>
  """
  use SaladUI, :component

  @doc """
  Primary hover card component that manages state and positioning.

  ## Options

  * `:id` - Required unique identifier for the hover card.
  * `:open` - Whether the hover card is initially open. Defaults to `false`.
  * `:open_delay` - Delay in milliseconds before showing the card. Defaults to `300`.
  * `:close_delay` - Delay in milliseconds before hiding the card. Defaults to `200`.
  * `:portal_container` - The portal container to render the hover card in. Defaults to `body`.
  * `:on_open` - Handler for hover card open event.
  * `:on_close` - Handler for hover card close event.
  * `:class` - Additional CSS classes.
  """
  attr :id, :string, required: true, doc: "Unique identifier for the hover card"
  attr :open, :boolean, default: false, doc: "Whether the hover card is initially open"
  attr :"open-delay", :integer, default: 300, doc: "Delay in milliseconds before showing the card"
  attr :"close-delay", :integer, default: 200, doc: "Delay in milliseconds before hiding the card"
  attr :"portal-container", :string, default: nil, doc: "The portal container to render the hover card in"
  attr :class, :string, default: nil
  attr :"on-open", :any, default: nil, doc: "Handler for hover card open event"
  attr :"on-close", :any, default: nil, doc: "Handler for hover card close event"
  attr :rest, :global
  slot :inner_block, required: true

  def hover_card(assigns) do
    # Collect event mappings
    event_map =
      %{}
      |> add_event_mapping(assigns, "opened", :"on-open")
      |> add_event_mapping(assigns, "closed", :"on-close")

    assigns =
      assigns
      |> assign(:event_map, json(event_map))
      |> assign(:initial_state, if(assigns.open, do: "open", else: "closed"))
      |> assign(
        :options,
        json(%{
          openDelay: assigns[:"open-delay"],
          closeDelay: assigns[:"close-delay"],
          animations: get_animation_config(),
          portalContainer: assigns[:"portal-container"]
        })
      )

    ~H"""
    <div
      id={@id}
      class={classes(["relative inline-block", @class])}
      data-component="hover-card"
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
  The trigger element that activates the hover card on hover.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def hover_card_trigger(assigns) do
    ~H"""
    <div
      data-part="trigger"
      class={classes(["", @class])}
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The hover card content that appears when triggered.

  ## Options

  * `:side` - Placement of the hover card relative to the trigger (top, right, bottom, left). Defaults to `"bottom"`.
  * `:align` - Alignment of the hover card (start, center, end). Defaults to `"center"`.
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

  def hover_card_content(assigns) do
    assigns = assign(assigns, :side_offset, assigns[:"side-offset"])
    assigns = assign(assigns, :align_offset, assigns[:"align-offset"])

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
        class={
          classes([
            "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
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
