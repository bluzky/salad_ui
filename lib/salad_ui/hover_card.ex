defmodule SaladUI.HoverCard do
  @moduledoc false
  use SaladUI, :component

  @doc """
  Render hover card wrapper
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def hover_card(assigns) do
    ~H"""
    <div
      class={
        classes([
          "inline-block relative group/hover-card",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def hover_card_trigger(assigns) do
    ~H"""
    <div
      class={
        classes([
          "",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:side, :string, values: ~w(bottom left right top), default: "top")
  attr(:align, :string, values: ["start", "center", "end"], default: "center")
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def hover_card_content(assigns) do
    align = align(assigns.align, assigns.side)

    assigns =
      assigns
      |> assign(:variant_class, variant(%{side: assigns.side, align: align}))
      |> assign(:variant_style, style_variant(%{align: align}))

    ~H"""
    <div
      data-side={@side}
      class={
        classes([
          "absolute hidden group-hover/hover-card:block",
          "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          @variant_class,
          @class
        ])
      }
      style={@variant_style}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  # decide align class based on side
  defp align(align, side) do
    cond do
      side in ["top", "bottom"] ->
        "#{align}-horizontal"

      side in ["left", "right"] ->
        "#{align}-vertical"
    end
  end

  @variants %{
    side: %{
      "top" => "bottom-full mb-2",
      "bottom" => "top-full mt-2",
      "left" => "right-full mr-2",
      "right" => "left-full ml-2"
    },
    align: %{
      "start-horizontal" => "left-0",
      "center-horizontal" => "left-1/2 -translate-x-1/2",
      "end-horizontal" => "right-0",
      "start-vertical" => "top-0",
      "center-vertical" => "top-1/2 -translate-y-1/2",
      "end-vertical" => "bottom-0"
    }
  }

  defp variant(variants) do
    Enum.map_join(variants, " ", fn {key, value} ->
      @variants[key][value]
    end)
  end

  @style_variants %{
    align: %{
      "center-horizontal" => "--tw-enter-translate-x: -50%",
      "center-vertical" => "--tw-enter-translate-y: -50%"
    }
  }

  defp style_variant(variants) do
    Enum.map_join(variants, " ", fn {key, value} ->
      @style_variants[key][value]
    end)
  end
end
