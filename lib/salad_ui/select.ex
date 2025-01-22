defmodule SaladUI.Select do
  @moduledoc """
  Implement of select components from https://ui.shadcn.com/docs/components/select

  ## Examples:
      <form>
         <.select default="banana" id="fruit-select" placeholder="Select a fruit" items={[%{label: "Apple", value: "apple"}, %{label: "Banana", value: "banana"}, %{label: "Blueberry", value: "blueberry"}, %{label: "Grapes", value: "grapes", disabled: true}, %{label: "Pineapple", value: "pineapple"}]} :let={builder}>
            <.select_trigger class="w-[180px]" builder={builder}/>
            <.select_content>
              <.select_group>
                <.select_label>Fruits</.select_label>
                <.select_item name="fruit" value="apple" builder={builder}>Apple</.select_item>
                <.select_item name="fruit" value="banana" builder={builder}>Banana</.select_item>
                <.select_item name="fruit" value="blueberry" builder={builder}>Blueberry</.select_item>
                <.select_separator />
                <.select_item  name="fruit" disabled value="grapes" builder={builder}>Grapes</.select_item>
                <.select_item  name="fruit" value="pineapple" builder={builder}>Pineapple</.select_item>
              </.select_group>
        </.select_content>
          </.select>

        <.button type="submit">Submit</.button>
      </form>
  """
  use SaladUI, :component

  @doc """
  Ready to use select component with all required parts.
  """

  attr :id, :string, default: nil
  attr :name, :any, default: nil
  attr :value, :any, default: nil, doc: "The value of the select"
  attr :"default-value", :any, default: nil, doc: "The default value of the select"

  attr :field, Phoenix.HTML.FormField, doc: "a form field struct retrieved from the form, for example: @form[:email]"

  attr :placeholder, :string, default: nil, doc: "The placeholder text when no value is selected."

  attr :class, :string, default: nil

  attr :items, :list,
    default: [],
    doc: "The list of items to be selected. Each item is a map with 2 fields: label & value"

  attr :on_value_change, :string, default: nil, doc: "`push_event` event to push to server when select value changed"
  slot :inner_block, required: true
  attr :rest, :global

  @select_handler """
  (details, el)=>{
    el.querySelector("[data-part=value-text]").setAttribute("data-content", details.items[0].label);
    el.querySelector(`input[value=${details.value[0]}]`).checked = true;
  }
  """
  def select(assigns) do
    assigns =
      assigns
      |> prepare_assign()
      |> assign(:select_handler, @select_handler)

    assigns =
      assign(assigns, :builder, %{
        id: assigns.id,
        name: assigns.name,
        value: assigns.value,
        placeholder: assigns.placeholder,
        items: assigns.items,
        selected_item: Enum.find(assigns.items, &(&1.value == assigns.value))
      })

    ~H"""
    <div
      id={@id}
      class={classes(["relative group", @class])}
      data-component="select"
      data-parts={Jason.encode!(["root", "trigger", "value-text", "positioner", "content", "item"])}
      data-part="root"
      data-options={Jason.encode!(%{value: [@value], collection: %{items: @items}})}
      data-listeners={
        Jason.encode!(%{on_value_change: ["exec:#{@select_handler}", "push:#{@on_value_change}"]})
      }
      phx-hook="ZagHook"
      {@rest}
    >
      {render_slot(@inner_block, @builder)}
    </div>
    """
  end

  attr :builder, :map, required: true, doc: "The builder of the select component"
  attr :class, :string, default: nil
  attr :rest, :global

  def select_trigger(assigns) do
    ~H"""
    <button
      type="button"
      data-part="trigger"
      class={
        classes([
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          @class
        ])
      }
      {@rest}
    >
      <span
        class="select-value pointer-events-none before:content-[attr(data-content)]"
        data-part="value-text"
        data-content={
          (@builder.selected_item && @builder.selected_item.label) || @builder.placeholder
        }
      >
      </span>
      <span class="h-4 w-4 opacity-50" />
    </button>
    """
  end

  attr :class, :string, default: nil
  attr :side, :string, values: ~w(top bottom), default: "bottom"
  slot :inner_block, required: true
  attr :rest, :global

  def select_content(assigns) do
    ~H"""
    <div
      data-part="positioner"
      data-side={@side}
      class={
        classes([
          "z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          @class
        ])
      }
      {@rest}
    >
      <div class="relative w-full p-1" data-part="content">
        {render_slot(@inner_block)}
      </div>
    </div>
    """
  end

  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def select_group(assigns) do
    ~H"""
    <div role="group" class={classes([@class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def select_label(assigns) do
    ~H"""
    <div class={classes(["py-1.5 pl-8 pr-2 text-sm font-semibold", @class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :builder, :map, required: true, doc: "The builder of the select component"
  attr :value, :string, required: true
  attr :label, :string, default: nil
  attr :disabled, :boolean, default: false
  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def select_item(assigns) do
    assigns = assign(assigns, :item, Enum.find(assigns.builder.items, &(&1.value == assigns.value)))

    ~H"""
    <label
      data-part="item"
      data-props={Jason.encode!(%{item: @item})}
      data-parts={Jason.encode!(["item-indicator", "item-text"])}
      class={
        classes([
          "group/item",
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          @class
        ])
      }
      {%{"data-disabled": @disabled}}
      {@rest}
    >
      <input
        type="radio"
        class="peer w-0 opacity-0"
        name={@builder.name}
        value={@value}
        checked={@builder.value == @value}
        disabled={@disabled}
      />
      <div class="absolute top-0 left-0 w-full h-full group-data-[highlighted]/item:bg-accent rounded">
      </div>
      <span
        class="hidden peer-checked:block absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
        data-part="item-indicator"
      >
        <span aria-hidden="true">
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
            class="lucide lucide-check h-4 w-4"
          >
            <path d="M20 6 9 17l-5-5"></path>
          </svg>
        </span>
      </span>
      <span class="z-0 peer-focus:text-accent-foreground" data-part="item-text">
        {@item.label}
      </span>
    </label>
    """
  end

  def select_separator(assigns) do
    ~H"""
    <div class={classes(["-mx-1 my-1 h-px bg-muted"])}></div>
    """
  end
end
