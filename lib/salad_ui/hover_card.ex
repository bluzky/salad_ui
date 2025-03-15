defmodule SaladUI.HoverCard do
  @moduledoc """
  Implementation of hover card component with positioning and hover interactions.

  When a user hovers over the trigger element, the content card appears with a small delay.
  The card disappears when the user moves away from both the trigger and the content.

  ## Examples:

      <.hover_card id="user-hover-card">
        <.hover_card_trigger>
          <.button variant="link">@salad_ui</.button>
        </.hover_card_trigger>
        <.hover_card_content>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-3">
              <img src="/images/avatar.png" alt="" class="h-10 w-10 rounded-full" />
              <div>
                <div class="font-semibold">SaladUI</div>
                <div class="text-sm text-muted-foreground">@salad_ui</div>
              </div>
            </div>
            <p class="text-sm">
              UI component library for modern web applications.
            </p>
          </div>
        </.hover_card_content>
      </.hover_card>
  """
  use SaladUI, :component

  @doc """
  The main hover card component that manages state and positioning.

  ## Options

  * `:id` - Required unique identifier for the hover card.
  * `:open-delay` - Delay in milliseconds before opening the hover card. Defaults to `300`.
  * `:close-delay` - Delay in milliseconds before closing the hover card. Defaults to `200`.
  * `:on-open` - Handler for hover card open event.
  * `:on-close` - Handler for hover card close event.
  * `:class` - Additional CSS classes.
  """
  attr :id, :string, required: true, doc: "Unique identifier for the hover card"
  attr :"open-delay", :integer, default: 300, doc: "Delay in milliseconds before opening the hover card"
  attr :"close-delay", :integer, default: 200, doc: "Delay in milliseconds before closing the hover card"
  attr :"on-open", :any, default: nil, doc: "Handler for hover card open event"
  attr :"on-close", :any, default: nil, doc: "Handler for hover card close event"
  attr :class, :string, default: nil
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
      |> assign(:event_map, Jason.encode!(event_map))
      |> assign(
        :options,
        Jason.encode!(%{
          openDelay: assigns[:"open-delay"],
          closeDelay: assigns[:"close-delay"],
          animations: get_animation_config()
        })
      )

    ~H"""
    <div
      id={@id}
      class={classes(["inline-block relative", @class])}
      data-component="hover-card"
      data-state="closed"
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
  The trigger element that activates the hover card when hovered.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def hover_card_trigger(assigns) do
    ~H"""
    <div data-part="trigger" class={classes(["", @class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The hover card content that appears when triggered.

  ## Options

  * `:side` - Placement of the hover card relative to the trigger (top, right, bottom, left). Defaults to `"top"`.
  * `:align` - Alignment of the hover card (start, center, end). Defaults to `"center"`.
  * `:side-offset` - Distance from the trigger in pixels. Defaults to `4`.
  * `:align-offset` - Offset along the alignment axis. Defaults to `0`.
  * `:class` - Additional CSS classes.
  """
  attr :class, :string, default: nil
  attr :side, :string, values: ~w(top right bottom left), default: "top"
  attr :align, :string, values: ~w(start center end), default: "center"
  attr :"side-offset", :integer, default: 4, doc: "Distance from the trigger in pixels"
  attr :"align-offset", :integer, default: 0, doc: "Offset along the alignment axis"
  attr :rest, :global
  slot :inner_block, required: true

  def hover_card_content(assigns) do
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
      style="postion: fixed;"
      class="z-50"
      hidden
      {@rest}
    >
      <div
        class={
          classes([
            "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            @class
          ])
        }
        data-part="content-wrapper"
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
