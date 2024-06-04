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
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def tooltip(assigns) do
    ~H"""
    <div
      class={
        classes([
          "relative group/tooltip inline-block",
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
  attr(:side, :string, default: "top", values: ~w(bottom left right top))
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def tooltip_content(assigns) do
    assigns =
      assigns
      |> assign(:variant_class, variant(%{side: assigns.side}))
      |> assign(:variant_style, style_variant(%{side: assigns.side}))

    ~H"""
    <div
      data-side={@side}
      class={
        classes([
          "tooltip-content absolute whitespace-nowrap hidden group-hover/tooltip:block",
          "z-50 w-auto overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
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

  @variants %{
    side: %{
      "top" => "bottom-full mb-2 left-1/2 -translate-x-1/2",
      "bottom" => "top-full mt-2 left-1/2 -translate-x-1/2",
      "left" => "right-full mr-2 top-1/2 -translate-y-1/2",
      "right" => "left-full ml-2 top-1/2 -translate-y-1/2"
    }
  }

  defp variant(variants) do
    Enum.map_join(variants, " ", fn {key, value} ->
      @variants[key][value]
    end)
  end

  @style_variants %{
    side: %{
      "top" => "--tw-enter-translate-x: -50%",
      "bottom" => "--tw-enter-translate-x: -50%",
      "left" => "--tw-enter-translate-y: -50%",
      "right" => "--tw-enter-translate-y: -50%"
    }
  }

  defp style_variant(variants) do
    Enum.map_join(variants, " ", fn {key, value} ->
      @style_variants[key][value]
    end)
  end
end
