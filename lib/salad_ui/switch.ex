defmodule SaladUI.Switch do
  @moduledoc """
  Implementation of a switch/toggle component.

  A switch is a control that allows users to toggle between checked and not checked states.
  """
  use SaladUI, :component

  @doc """
  Renders a switch component.

  ## Props
    * `:id` - The id to be applied to the input element
    * `:name` - The name to be applied to the input element
    * `:class` - Additional CSS classes
    * `:value` - The current value of the switch
    * `:default-value` - The default value of the switch
    * `:field` - Phoenix form field
    * `:disabled` - Whether the switch is disabled
    * `:on-checked-changed` - Handler for value change event
  """
  attr :id, :string, default: nil
  attr :name, :string, default: nil
  attr :class, :string, default: nil
  attr :checked, :boolean, default: false
  attr :disabled, :boolean, default: false
  attr :"on-checked-changed", :any, default: nil, doc: "Handler for value change event"

  attr :field, Phoenix.HTML.FormField, doc: "a form field struct retrieved from the form, for example: @form[:active]"
  attr :rest, :global

  def switch(assigns) do
    assigns = prepare_assign(assigns)

    # Normalize value for boolean
    assigns = assign(assigns, :checked, normalize_boolean(assigns.checked))

    # Collect event mappings
    event_map =
      add_event_mapping(%{}, assigns, "checked-changed", :"on-checked-changed")

    assigns =
      assigns
      |> assign(:event_map, json(event_map))
      |> assign(:initial_state, if(assigns.checked, do: "checked", else: "unchecked"))
      |> assign(
        :options,
        json(%{
          disabled: assigns.disabled
        })
      )

    ~H"""
    <div
      id={@id}
      data-component="switch"
      data-state={@initial_state}
      data-options={@options}
      data-event-mappings={@event_map}
      data-part="root"
      phx-hook="SaladUI"
      data-disabled={@disabled}
      class={
        classes([
          "switch-root inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          @class
        ])
      }
      tabindex={if @disabled, do: "-1", else: "0"}
      {@rest}
    >
      <input type="hidden" name={@name} value="false" />
      <input
        type="checkbox"
        id={"#{@id}-input"}
        name={@name}
        value="true"
        class="sr-only"
        checked={@checked}
        disabled={@disabled}
        aria-checked={@checked}
        data-part="input"
      />
      <span
        data-part="thumb"
        data-state={@initial_state}
        class="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      />
    </div>
    """
  end
end
