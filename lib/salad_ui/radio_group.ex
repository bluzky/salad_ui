defmodule SaladUI.RadioGroup do
  @moduledoc false
  use SaladUI, :component

  @doc """
  Radio input group component

  ## Examples:

      <.radio_group name="question-1" value="option-2">
      <div class="flex items-center space-x-2">
        <.radio_group_item builder={builder} value="option-one" id="option-one"></.radio_group_item>
        <.label for="option-one">
          Option One
        </.label>
      </div>
      <div class="flex items-center space-x-2">
        <.radio_group_item builder={builder} value="option-two" id="option-two"></.radio_group_item>
        <.label for="option-two">
          Option Two
        </.label>
      </div>
    </.radio_group>

  """
  attr :name, :string, default: nil
  attr :value, :any, default: nil
  attr :class, :string, default: nil
  slot :inner_block, required: true

  def radio_group(assigns) do
    assigns = assign(assigns, :builder, %{name: assigns.name, value: assigns.value})

    ~H"""
    <div
      role="radiogroup"
      aria-required="false"
      dir="ltr"
      class={classes(["grid gap-2", @class])}
      tabindex="0"
      style="outline: none;"
    >
      <%= render_slot(@inner_block, @builder) %>
    </div>
    """
  end

  attr :builder, :map, required: true
  attr :class, :string, default: nil
  attr :checked, :any, default: false
  attr :value, :string, default: nil
  attr :rest, :global

  def radio_group_item(assigns) do
    ~H"""
    <input
      type="radio"
      class={
        classes([
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          @class
        ])
      }
      name={@builder.name}
      checked={normalize_boolean(@checked) || @builder.value == @value}
      {@rest}
    />
    """
  end
end
