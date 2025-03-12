defmodule SaladUI.Badge do
  @moduledoc """
  Implementation of badge component for displaying short labels, statuses, or counts.

  Badges are small UI elements typically used to highlight status, categories, or counts
  in a compact format. They are designed to be visually distinct and draw attention to
  important information.

  ## Examples:

      <.badge>New</.badge>
      <.badge variant="secondary">Beta</.badge>
      <.badge variant="destructive">Error</.badge>
      <.badge variant="outline">Version 1.0</.badge>

      <div class="flex gap-2">
        <.badge>Default</.badge>
        <.badge variant="secondary">Secondary</.badge>
        <.badge variant="destructive">Destructive</.badge>
        <.badge variant="outline">Outline</.badge>
      </div>
  """
  use SaladUI, :component

  @doc """
  Renders a badge component.

  ## Options

  * `:class` - Additional CSS classes to apply to the badge.
  * `:variant` - The visual style of the badge. Available variants:
    * `"default"` - Primary color with white text (default)
    * `"secondary"` - Secondary color with contrasting text
    * `"destructive"` - Typically red, for warning or error states
    * `"outline"` - Bordered style with no background

  ## Examples

      <.badge>Badge</.badge>
      <.badge variant="destructive">Warning</.badge>
      <.badge variant="outline" class="text-sm">Custom</.badge>
  """
  attr :class, :string, default: nil

  attr :variant, :string,
    values: ~w(default secondary destructive outline),
    default: "default",
    doc: "the badge variant style"

  attr :rest, :global
  slot :inner_block, required: true

  def badge(assigns) do
    assigns = assign(assigns, :variant_class, variant(assigns))

    ~H"""
    <div
      class={
        classes([
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          @variant_class,
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @variants %{
    variant: %{
      "default" => "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      "secondary" => "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      "destructive" => "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      "outline" => "text-foreground"
    }
  }

  @default_variants %{
    variant: "default"
  }

  defp variant(props) do
    variants = Map.merge(@default_variants, props)

    Enum.map_join(variants, " ", fn {key, value} -> @variants[key][value] end)
  end
end
