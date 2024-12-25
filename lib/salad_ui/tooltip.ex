defmodule SaladUI.Tooltip do
  @moduledoc false
  use SaladUI, :component

  @doc """
  Render a tooltip

  ## Examples:

  <.tooltip>
    <.button variant="outline">Hover me</.button>
    <.tooltip_content class="bg-primary text-white" theme={nil}>
     <p>Hi! I'm a tooltip.</p>
    </.tooltip_content>
  </.tooltip>

  """
  attr :class, :string, default: nil
  attr :side, :string, default: "top", values: ~w(bottom left right top)
  attr :rest, :global
  slot :inner_block, required: true

  def tooltip(assigns) do
    ~H"""
    <div
      data-component="tooltip"
      data-parts={Jason.encode!(["root", "trigger", "positioner", "content"])}
      data-part="root"
      data-options={
        Jason.encode!(%{
          id: unique_id(),
          positioning: %{strategy: "fixed", placement: @side}
        })
      }
      phx-hook="ZagHook"
      class={@class}
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Render only for compatible with shad ui
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tooltip_trigger(assigns) do
    ~H"""
    <div data-part="trigger" class={@class} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Render
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tooltip_content(assigns) do
    ~H"""
    <div data-part="positioner">
      <div
        data-part="content"
        hidden
        class={
          classes([
            "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2",
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
