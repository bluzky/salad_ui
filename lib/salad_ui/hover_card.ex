defmodule SaladUI.HoverCard do
  @moduledoc """
  Hover card component

  ## Examples:

  <.hover_card id="my-hover-card">
    <.hover_card_trigger>
      <.button variant="link">
        @salad_ui
      </.button>
    </.hover_card_trigger>
    <.hover_card_content>
        Hover card content
    </.hover_card_content>
  </.hover_card>
  """
  use SaladUI, :component

  @doc """
  Renders the root container for the hover card
  """

  attr :id, :string, required: true
  attr :open, :boolean, default: false

  attr :side, :string,
    default: "top",
    values: ~w(bottom bottom-start bottom-end left left-start left-end right right-start right-end top top-start top-end)

  attr :options, :map,
    default: %{},
    doc: """
    Options supported by the Zag.js library for configuring this component.
    See https://zagjs.com/components/react/tabs#machine-context for full list of available options.
    """

  attr :on_open, :list,
    default: [],
    values: [[], [:client], [:server], [:client, :server]],
    doc: """
    A list of atoms indicating where to emit custom events each time the hover card is opened/closed
    """

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def hover_card(assigns) do
    ~H"""
    <div
      class={
        classes([
          "inline-block relative group/hover-card",
          @class
        ])
      }
      id={@id}
      phx-hook="ZagHook"
      data-component="hover-card"
      data-parts={Jason.encode!(["trigger", "positioner", "content", "arrow", "arrow-tip"])}
      data-options={
        %{open: @open, positioning: %{placement: @side}} |> Map.merge(@options) |> Jason.encode!()
      }
      data-listeners={[[:on_open_change | @on_open]] |> Jason.encode!()}
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Renders the trigger for the hover card
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def hover_card_trigger(assigns) do
    ~H"""
    <div
      data-part="trigger"
      class={
        classes([
          "",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Renders the content for the hover card
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def hover_card_content(assigns) do
    ~H"""
    <div data-part="positioner" class="inline-block">
      <div
        data-part="content"
        class={
          classes([
            "opacity-0 group-hover/hover-card:opacity-100",
            "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95",
            @class
          ])
        }
        {@rest}
      >
        <div data-part="arrow">
          <div data-part="arrow-tip"></div>
        </div>
        {render_slot(@inner_block)}
      </div>
    </div>
    """
  end
end
