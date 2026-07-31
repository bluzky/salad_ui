defmodule SaladUI.Slider do
  @moduledoc """
  Implementation of slider component for selecting values within a range.

  Sliders provide users with a visual representation of a value within a range,
  and allow them to adjust it by dragging a thumb or pressing arrow keys.

  ## Examples:

      <.slider id="volume-slider" min={0} max={100} value={50} on-value-changed="volume_changed" />

      <.slider id="price-range" min={10} max={1000} step={10} value={500} class="w-[300px]" />

  ## Component events

  * `:on-value-changed` - Maps the `value-changed` event. Fired when the slider value changes.

  ## Server commands

  * `"setValue"` - Sets the slider value. Requires a `:value` param.
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

  ## Component events

  * `:on-value-changed` - Fired when the slider value changes.

  ## Server commands

  * `"setValue"` - Sets the slider value. Requires a `:value` param.
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

    # Ensure value is numeric, within bounds, and snapped to step
    value =
      value
      |> normalize_number(assigns.min)
      |> snap_to_step(assigns.min, assigns.max, assigns.step)

    # Collect event mappings
    event_map = event_mappings(assigns)

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
      class={classes(["relative", @disabled && "opacity-50", @class])}
      data-component="slider"
      data-state="idle"
      data-value={@value}
      data-options={@options}
      data-event-mappings={@event_map}
      tabindex={if @disabled, do: "-1", else: "0"}
      aria-disabled={if @disabled, do: "true", else: nil}
      phx-hook="SaladUI"
      data-part="root"
      phx-no-format
      {@rest}
    >
      <div
        class="relative flex w-full touch-none select-none items-center"
      >
        <div data-part="track" class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <div data-part="range" class="absolute h-full bg-primary" />
        </div>
        <div
          data-disabled={if @disabled, do: "true", else: nil}
          data-part="thumb"
          class={
            classes([
              "absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              @disabled && "pointer-events-none"
            ])
          }
        />
      </div>
      <input type="hidden" name={@name} value={@value} />
    </div>
    """
  end

  # Snap a value to the nearest step while preserving exact boundaries.
  defp snap_to_step(value, min, max, step) when is_number(step) and step > 0 do
    cond do
      value <= min ->
        min

      value >= max ->
        max

      true ->
        step_count = round((value - min) / step)
        snapped = min + step * step_count

        snapped |> max(min) |> min(max)
    end
  end

  defp snap_to_step(value, min, max, _step), do: value |> max(min) |> min(max)

  defp normalize_number(value, _default) when is_number(value), do: value

  defp normalize_number(value, default) when is_binary(value) do
    case Float.parse(value) do
      {number, _rest} -> number
      :error -> default
    end
  end

  defp normalize_number(_value, default), do: default
end
