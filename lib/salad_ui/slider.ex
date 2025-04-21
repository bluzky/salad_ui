defmodule SaladUI.Slider do
  @moduledoc """
  Implementation of slider component for selecting a numeric value within a range.

  Sliders allow users to make selections from a range of values by moving a thumb along a track.
  They are ideal for adjusting settings like volume, opacity, or other parameters where visual
  feedback on the selected value is helpful.

  ## Examples:

      <.slider id="volume-slider" min={0} max={100} step={1} value={50} />

      <.slider
        id="price-range"
        class="w-[60%]"
        min={10}
        max={50}
        step={5}
        value={20}
        on-value-changed={JS.push("price_changed")}
      />
  """
  use SaladUI, :component

  @doc """
  Renders a slider component.

  ## Options

  * `:id` - Required unique identifier for the slider.
  * `:min` - Minimum value of the slider (default: 0)
  * `:max` - Maximum value of the slider (default: 100)
  * `:step` - Step value for increments (default: 1)
  * `:value` - Current value of the slider (default: 0)
  * `:default-value` - Default value if no value is provided
  * `:name` - Name attribute for the hidden input
  * `:on-value-changed` - Handler for value change events
  * `:class` - Additional CSS classes
  * `:field` - Form field for integration with Phoenix forms
  """
  attr :id, :string, required: true
  attr :class, :string, default: nil
  attr :name, :string, default: nil
  attr :value, :integer, default: 0, doc: "Current value of the slider"
  attr :"default-value", :integer
  attr :field, Phoenix.HTML.FormField, doc: "a form field struct retrieved from the form, for example: @form[:email]"
  attr :"on-value-changed", :any, default: nil, doc: "Handler for value change events"
  attr :min, :integer, default: 0
  attr :max, :integer, default: 100
  attr :step, :integer, default: 1
  attr :rest, :global

  def slider(assigns) do
    assigns = prepare_assign(assigns)

    assigns =
      assigns
      |> Map.put(:value, normalize_integer(assigns[:value] || 0))
      |> Map.put(:min, normalize_integer(assigns[:min] || 0))
      |> Map.put(:max, normalize_integer(assigns[:max]))
      |> Map.put(:step, normalize_integer(assigns[:step]))

    # Collect event mappings
    event_map =
      add_event_mapping(%{}, assigns, "value-changed", :"on-value-changed")

    assigns =
      assigns
      |> assign(:event_map, json(event_map))
      |> assign(
        :options,
        json(%{})
      )

    ~H"""
    <div
      id={@id}
      class={classes(["relative w-full", @class])}
      style={"--#{@id}-val: #{(@value - @min)/(@max - @min) * 100}"}
      data-component="slider"
      data-state="idle"
      data-options={@options}
      data-event-mappings={@event_map}
      phx-hook="SaladUI"
      data-part="root"
      {@rest}
    >
      <span class={["relative flex w-full touch-none select-none items-center"]}>
        <span
          data-part="track"
          data-orientation="horizontal"
          class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
        >
          <span
            data-part="range"
            data-orientation="horizontal"
            class="absolute h-full bg-primary"
            style={"left: 0%; right: calc(100% - var(--#{@id}-val)*1%)"}
          >
          </span>
        </span>
        <span style={"transform: translateX(-50%); position: absolute; left: calc(var(--#{@id}-val)*1%);"}>
          <span
            data-part="thumb"
            role="slider"
            aria-valuemin={@min}
            aria-valuemax={@max}
            aria-valuenow={@value}
            aria-orientation="horizontal"
            data-orientation="horizontal"
            tabindex="0"
            class="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
          </span>
        </span>
      </span>
      <input
        data-part="input"
        type="range"
        class="absolute top-0 -left-2 z-1 w-full appearance-none cursor-pointer opacity-0"
        phx-update="ignore"
        style="width: calc(100% + 20px)"
        {%{min: @min, max: @max, value: @value, step: @step, id: "#{@id}-input", name: @name}}
      />
    </div>
    """
  end
end
