defmodule SaladUI.Slider do
  @moduledoc """
  Implementation of slider component for selecting values within a range.

  Sliders provide users with a visual representation of a value within a range,
  and allow them to adjust it by dragging a thumb or pressing arrow keys.

  ## Examples:

      <.slider id="volume-slider" min={0} max={100} value={50} on-value-changed={JS.push("volume_changed")} />

      <.slider id="price-range" min={10} max={1000} step={10} value={500} class="w-[300px]" />
  """
  use SaladUI, :component

  @doc """
  Renders a slider component.

  ## Options

  * `:id` - Required unique identifier for the slider.
  * `:min` - Minimum value (defaults to 0).
  * `:max` - Maximum value (defaults to 100).
  * `:step` - Step size for value changes (defaults to 1).
  * `:value` - Current value of the slider (defaults to min).
  * `:default-value` - Default value if value is not provided.
  * `:disabled` - Whether the slider is disabled (defaults to false).
  * `:on-value-changed` - Handler for value changed event.
  * `:class` - Additional CSS classes.
  """
  attr :id, :string, required: true, doc: "Unique identifier for the slider"
  attr :name, :any, default: nil, doc: "Name of the slider for form submission"
  attr :min, :integer, default: 0, doc: "Minimum value"
  attr :max, :integer, default: 100, doc: "Maximum value"
  attr :step, :integer, default: 1, doc: "Step size for value changes"
  attr :value, :integer, default: nil, doc: "Current value of the slider"
  attr :"default-value", :integer, default: nil, doc: "Default value if value is not provided"
  attr :disabled, :boolean, default: false, doc: "Whether the slider is disabled"
  attr :"on-value-changed", :any, default: nil, doc: "Handler for value changed event"
  attr :field, Phoenix.HTML.FormField, doc: "A form field struct retrieved from the form, for example: @form[:volume]"
  attr :class, :string, default: nil
  attr :rest, :global

  def slider(assigns) do
    assigns = prepare_assign(assigns)

    # Set value from default-value or min if value is not provided
    value =
      cond do
        not is_nil(assigns.value) -> assigns.value
        not is_nil(assigns[:"default-value"]) -> assigns[:"default-value"]
        true -> assigns.min
      end

    # Ensure value is within bounds and snapped to step
    value =
      value
      |> max(assigns.min)
      |> min(assigns.max)
      |> snap_to_step(assigns.step)

    # Collect event mappings
    event_map =
      add_event_mapping(%{}, assigns, "value-changed", :"on-value-changed")

    # Create options object
    options = %{
      min: assigns.min,
      max: assigns.max,
      step: assigns.step,
      defaultValue: assigns[:"default-value"],
      disabled: assigns.disabled
    }

    assigns =
      assigns
      |> assign(:value, value)
      |> assign(:event_map, json(event_map))
      |> assign(:options, json(options))

    ~H"""
    <div
      id={@id}
      class={classes(["relative", @class])}
      data-component="slider"
      data-state="idle"
      data-value={@value}
      data-options={@options}
      data-event-mappings={@event_map}
      tabindex={if @disabled, do: "-1", else: "0"}
      phx-hook="SaladUI"
      data-part="root"
      phx-no-format
      {@rest}
    >
      <div
        class="relative flex w-full touch-none select-none items-center"
        data-part="root"
      >
        <div data-part="track" class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <div data-part="range" class="absolute h-full bg-primary" />
        </div>
        <div
          disabled={@disabled}
          data-part="thumb"
          class="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 absolute"
        />
      </div>
      <input type="hidden" name={@name} value={@value} />
    </div>
    """
  end

  # Snap a value to the nearest step
  defp snap_to_step(value, step) do
    step_count = round(value / step)
    step * step_count
  end
end
