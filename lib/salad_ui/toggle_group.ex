defmodule SaladUI.ToggleGroup do
  @moduledoc false
  use SaladUI, :component

  @doc """
  A set of two-state buttons that can be toggled on or off.


  ## Example:

    <.toggle_group name="style" type="single" value="bold">
      <.toggle_group_item value="bold" builder={builder} aria-label="Toggle bold">
        <.icon name="hero-bold" class="h-4 w-4" />
      </.toggle_group_item>
      <.toggle_group_item value="italic" builder={builder} aria-label="Toggle italic">
        <.icon name="hero-italic" class="h-4 w-4" />
      </.toggle_group_item>
      <.toggle_group_item value="underline" builder={builder} aria-label="Toggle underline">
        <.icon name="hero-underline" class="h-4 w-4" />
      </.toggle_group_item>
    </.toggle_group>
  """
  attr :name, :any, required: true
  attr :class, :string, default: nil
  attr :variant, :string, default: "default"
  attr :size, :string, default: "default"
  attr :type, :string, values: ~w(single multiple), default: "single"

  attr :value, :string,
    default: nil,
    doc: "The value of the toggle group. It's a single value for single type and a list of values for multiple type."

  attr :disabled, :boolean, default: false
  attr :rest, :global
  slot :inner_block

  def toggle_group(assigns) do
    ensure_valid_value_type!(assigns)

    ~H"""
    <div class={classes(["flex items-center justify-center gap-1", @class])}>
      <%= render_slot(@inner_block, assigns) %>
    </div>
    """
  end

  defp validate_value_type(%{value: value, type: type} = _assigns) do
    cond do
      type == "multiple" and not is_list(value) ->
        raise ArgumentError, "The value of the toggle group must be a list for multiple type."

      type == "single" and not (is_nil(value) or is_binary(value)) ->
        raise ArgumentError, "The value of the toggle group must be a single value for single type."

      true ->
        nil
    end
  end

  attr :class, :string, default: nil
  attr :disabled, :boolean, default: false
  attr :value, :string, default: nil
  attr :builder, :map, required: true, doc: "The builder context of toggle group."
  attr :rest, :global
  slot :inner_block

  def toggle_group_item(%{builder: %{type: "single"}} = assigns) do
    assigns =
      assigns
      |> assign(:variant_class, variant(assigns.builder))
      |> assign(:checked, assigns.value == assigns.builder.value)

    ~H"""
    <button
      onclick="this.querySelector('.toggle-input').click()"
      disabled={@disabled || @builder.disabled}
      class={
        classes([
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 has-[:checked]:bg-accent has-[:checked]:text-accent-foreground",
          @variant_class,
          @class
        ])
      }
    >
      <input
        type="radio"
        class="toggle-input hidden"
        name={@builder.name}
        value={@value}
        checked={@checked}
        {@rest}
      />
      <%= render_slot(@inner_block) %>
    </button>
    """
  end

  def toggle_group_item(%{builder: %{type: "multiple"}} = assigns) do
    assigns =
      assigns
      |> assign(:variant_class, variant(assigns.builder))
      |> assign(:checked, assigns.value in assigns.builder.value)

    ~H"""
    <button
      onclick="this.querySelector('.toggle-input').click()"
      disabled={@disabled || @builder.disabled}
      class={
        classes([
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 has-[:checked]:bg-accent has-[:checked]:text-accent-foreground",
          @variant_class,
          @class
        ])
      }
    >
      <input
        type="checkbox"
        class="toggle-input hidden"
        name={@builder.name <> "[]"}
        value={@value}
        checked={@checked}
        {@rest}
      />
      <%= render_slot(@inner_block) %>
    </button>
    """
  end

  @variants %{
    variant: %{
      "default" => "bg-transparent",
      "outline" => "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
    },
    size: %{
      "default" => "h-10 px-3",
      "sm" => "h-9 px-2.5",
      "lg" => "h-11 px-5"
    }
  }

  @default_variants %{
    variant: "default",
    size: "default"
  }

  defp variant(props) do
    variants = Map.take(props, ~w(variant size)a)
    variants = Map.merge(@default_variants, variants)

    Enum.map_join(variants, " ", fn {key, value} -> @variants[key][value] end)
  end
end
