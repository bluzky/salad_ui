defmodule SaladUI.Tooltip do
  @moduledoc """
  Tooltip component

  ## Examples:

  <.tooltip id="my-tooltip">
    <.tooltip_trigger>
      <.button variant="outline">Hover me</.button>
    </.tooltip_trigger>
    <.tooltip_content class="bg-primary text-white">
     <p>Hi! I'm a tooltip.</p>
    </.tooltip_content>
  </.tooltip>
  """

  use SaladUI, :component

  attr :id, :string, required: true

  attr :side, :string,
    default: "top",
    values: ~w(bottom bottom-start bottom-end left left-start left-end right right-start right-end top top-start top-end)

  attr :options, :map,
    default: %{},
    doc: """
    Options supported by the Zag.js library for configuring this component.
    See https://zagjs.com/components/react/tooltip#machine-context for full list of available options.
    """

  attr :on_open, :list,
    default: [],
    values: [[], [:client], [:server], [:client, :server]],
    doc: """
    A list of atom indicating where to emits custom events each time the tooltip is opened/closed
    """

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  @doc """
  Renders the root container for the tooltip component
  """
  def tooltip(assigns) do
    ~H"""
    <div
      class={
        classes([
          "relative group/tooltip inline-block",
          @class
        ])
      }
      id={@id}
      phx-hook="ZagHook"
      data-component="tooltip"
      data-parts={Jason.encode!(["trigger", "positioner", "content"])}
      data-options={%{positioning: %{placement: @side}} |> Map.merge(@options) |> Jason.encode!()}
      data-listeners={[[:on_open_change | @on_open]] |> Jason.encode!()}
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Renders the trigger for the tooltip
  """
  slot :inner_block, required: true

  def tooltip_trigger(assigns) do
    ~H"""
    <div class="inline-block" data-part="trigger">
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Renders the content for the tooltip
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tooltip_content(assigns) do
    ~H"""
    <div data-part="positioner">
      <div
        data-part="content"
        class={
          classes([
            "whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100",
            "z-50 w-auto overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
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
end
