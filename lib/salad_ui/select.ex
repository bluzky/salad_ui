defmodule SaladUI.Select do
  @moduledoc """
  Implement of select components from https://ui.shadcn.com/docs/components/select

  ## Examples:

      <form>
         <.select default="banana" id="fruit-select">
            <.select_trigger class="w-[180px]">
              <.select_value placeholder=".select a fruit"/>
            </.select_trigger>
            <.select_content>
              <.select_group>
                <.select_label>Fruits</.select_label>
                <.select_item value="apple">Apple</.select_item>
                <.select_item value="banana">Banana</.select_item>
                <.select_item value="blueberry">Blueberry</.select_item>
                <.select_separator />
                <.select_item disabled value="grapes">Grapes</.select_item>
                <.select_item value="pineapple">Pineapple</.select_item>
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
  attr :multiple, :boolean, default: false, doc: "Allow multiple selection"
  attr :on_value_changed, :any, default: nil, doc: "Handler for value changed event"
  attr :on_open, :any, default: nil, doc: "Handler for select open event"
  attr :on_close, :any, default: nil, doc: "Handler for select closed event"

  attr :field, Phoenix.HTML.FormField, doc: "a form field struct retrieved from the form, for example: @form[:email]"

  attr :label, :string,
    default: nil,
    doc: "The display label of the select value. If not provided, the value will be used."

  attr :placeholder, :string, default: nil, doc: "The placeholder text when no value is selected."

  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def select(assigns) do
    assigns = prepare_assign(assigns)

    # Collect event mappings
    event_map =
      %{}
      |> add_event_mapping(assigns, "value-changed", :on_value_changed)
      |> add_event_mapping(assigns, "opened", :on_open)
      |> add_event_mapping(assigns, "closed", :on_close)

    assigns =
      assigns
      |> assign(:event_map, json(event_map))
      |> assign(:builder, %{
        id: assigns.id,
        name: assigns.name,
        value: assigns.value,
        label: assigns.label,
        placeholder: assigns.placeholder
      })
      |> assign(
        :options,
        json(%{
          initialValue: assigns.value,
          name: assigns.name,
          multiple: assigns.multiple,
          animations: get_animation_config()
        })
      )

    ~H"""
    <div
      id={@id}
      class={classes(["relative inline-flex", @class])}
      data-component="select"
      data-state="closed"
      data-options={@options}
      data-event-mappings={@event_map}
      phx-hook="SaladUI"
      {@rest}
    >
      {render_slot(@inner_block, @builder)}
    </div>
    """
  end

  attr :class, :string, default: nil
  slot :inner_block, required: true
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
      {render_slot(@inner_block)}
      <span class="h-4 w-4 opacity-50">
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
          class="lucide lucide-chevron-down h-4 w-4"
        >
          <path d="M6 9l6 6 6-6"></path>
        </svg>
      </span>
    </button>
    """
  end

  attr :placeholder, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global

  def select_value(assigns) do
    ~H"""
    <span
      data-part="value"
      class={
        classes(["select-value pointer-events-none before:content-[attr(data-content)]", @class])
      }
      data-content={@placeholder}
      data-placeholder={@placeholder}
      {@rest}
    >
    </span>
    """
  end

  attr :builder, :map, required: true, doc: "The builder of the select component"

  attr :class, :string, default: nil
  attr :side, :string, values: ~w(top bottom), default: "bottom"
  slot :inner_block, required: true

  attr :rest, :global

  def select_content(assigns) do
    position_class =
      case assigns.side do
        "top" -> "bottom-full mb-1"
        "bottom" -> "top-full mt-1"
      end

    assigns =
      assigns
      |> assign(:position_class, position_class)
      |> assign(:id, assigns.builder.id <> "-content")

    ~H"""
    <div
      id={@id}
      data-part="content"
      data-side={@side}
      hidden
      class={
        classes([
          "absolute min-w-full",
          "z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          @position_class,
          @class
        ])
      }
      {@rest}
    >
      <div class="relative w-full p-1">
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
    <div data-part="group" class={classes([@class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def select_label(assigns) do
    ~H"""
    <div data-part="label" class={classes(["py-1.5 pl-8 pr-2 text-sm font-semibold", @class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :builder, :map, required: false, doc: "The builder of the select component"
  attr :value, :string, required: true
  attr :disabled, :boolean, default: false
  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def select_item(assigns) do
    ~H"""
    <div
      data-part="item"
      data-value={@value}
      data-disabled={to_string(@disabled)}
      class={
        classes([
          "group/item",
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
          @disabled && "pointer-events-none opacity-50",
          @class
        ])
      }
      tabindex={if @disabled, do: "-1", else: "0"}
      {@rest}
    >
      <div class="absolute top-0 left-0 w-full h-full group-hover/item:bg-accent rounded group-data-[highlighted=true]/item:bg-accent">
      </div>
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <span aria-hidden="true" class="hidden group-data-[selected=true]/item:block">
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
      <span class="z-0 data-[selected=true]:font-medium">{render_slot(@inner_block)}</span>
    </div>
    """
  end

  def select_separator(assigns) do
    ~H"""
    <div data-part="separator" class={classes(["-mx-1 my-1 h-px bg-muted"])}></div>
    """
  end

  defp get_animation_config do
    %{
      "open_to_closed" => %{
        duration: 130,
        target_part: "content"
      }
    }
  end
end
