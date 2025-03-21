defmodule SaladUI.RadioGroup do
  @moduledoc """
  Implementation of radio group component from https://ui.shadcn.com/docs/components/radio-group

  ## Examples:

      <.radio_group name="subscription" default="monthly" on_value_changed={JS.push("plan_changed")}>
        <div class="flex flex-col space-y-2">
          <div class="flex items-center space-x-2">
            <.radio_group_item value="monthly" id="monthly"/>
            <.label for="monthly">Monthly</label>
          </div>
          <div class="flex items-center space-x-2">
            <.radio_group_item value="yearly" id="yearly"/>
            <.label for="yearly">Yearly</label>
          </div>
        </div>
      </.radio_group>
  """
  use SaladUI, :component

  @doc """
  Radio group component that allows selection of one option from a set.
  """
  attr :id, :string, default: nil
  attr :name, :string, default: nil
  attr :value, :any, default: nil, doc: "The current value of the radio group"
  attr :"default-value", :any, default: nil, doc: "The default value of the radio group"
  attr :"on-value-changed", :any, default: nil, doc: "Handler for value changed event"
  attr :field, Phoenix.HTML.FormField, doc: "a form field struct retrieved from the form, for example: @form[:email]"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def radio_group(assigns) do
    assigns = prepare_assign(assigns)
    assigns = assign_new(assigns, :id, fn -> "radio-group-#{System.unique_integer()}" end)

    # Collect event mappings
    event_map =
      add_event_mapping(%{}, assigns, "value-changed", :"on-value-changed")

    assigns =
      assigns
      |> assign(:event_map, Jason.encode!(event_map))
      |> assign(:options,
        Jason.encode!(%{
          initialValue: assigns.value
        })
      )

    ~H"""
    <div
      id={@id}
      class={classes(["grid gap-2", @class])}
      data-component="radio-group"
      data-state="idle"
      data-options={@options}
      data-event-mappings={@event_map}
      phx-hook="SaladUI"
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Individual radio button in a radio group.
  """
  attr :id, :string, required: true
  attr :value, :string, required: true
  attr :disabled, :boolean, default: false
  attr :class, :string, default: nil
  attr :rest, :global

  def radio_group_item(assigns) do
    ~H"""
    <div
      data-part="item"
      data-value={@value}
      data-state="unchecked"
      data-disabled={to_string(@disabled)}
      class={
        classes([
          "group/item",
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 inline-grid",
          @class
        ])
      }
      tabindex="-1"
      {@rest}
    >
      <input
        type="radio"
        id={@id}
        value={@value}
        disabled={@disabled}
        class="sr-only"
        tabindex="-1"
      />
      <span class="hidden group-data-[state=checked]/item:flex items-center justify-center">
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
    </div>
    """
  end
end
