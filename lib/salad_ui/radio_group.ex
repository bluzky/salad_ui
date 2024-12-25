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
  attr :id, :string, default: nil, doc: "The id of the radio group."
  attr :name, :string, default: nil
  attr :value, :any, default: nil
  attr :"default-value", :any
  attr :field, Phoenix.HTML.FormField, doc: "a form field struct retrieved from the form, for example: @form[:email]"
  attr :class, :string, default: nil
  attr :disabled, :boolean, default: false
  attr :on_value_change, :string, default: nil, doc: "`push_event` event to push to server when select value changed"

  slot :inner_block, required: true

  def radio_group(assigns) do
    assigns = prepare_assign(assigns)
    assigns = assign(assigns, :builder, %{name: assigns.name, value: assigns.value})

    ~H"""
    <div
      id={@id}
      data-component="radio_group"
      data-parts={Jason.encode!(~w(root item))}
      data-options={Jason.encode!(%{value: @value, name: @name, disabled: @disabled})}
      data-listeners={Jason.encode!(%{value: ["push:#{@on_value_change}"]})}
      data-part="root"
      phx-hook="ZagHook"
      class={classes(["grid gap-2", @class])}
      style="outline: none;"
    >
      {render_slot(@inner_block, @builder)}
    </div>
    """
  end

  attr :builder, :map, required: true
  attr :class, :string, default: nil
  attr :value, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def radio_group_item(assigns) do
    ~H"""
    <label
      class={classes(["inline-flex space-x-2", @class])}
      data-part="item"
      data-parts={Jason.encode!(~w(item-hidden-input item-control item-text))}
      data-props={Jason.encode!(%{value: @value})}
    >
      <span
        data-part="item-control"
        class="group/radio aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 inline-grid"
      >
        <span class="hidden items-center justify-center group-data-[state=checked]/radio:flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-circle h-2.5 w-2.5 fill-current text-current"
          >
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </span>
      </span>
      {render_slot(@inner_block)}
      <input
        data-part="item-hidden-input"
        type="radio"
        class="hidden"
        value={@value}
        checked={@builder.value == @value}
        {@rest}
      />
    </label>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global, include: ~w(disabled form name value for)
  slot :inner_block, required: true

  def radio_group_item_label(assigns) do
    ~H"""
    <span
      data-part="item-text"
      class={
        classes([
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </span>
    """
  end
end
