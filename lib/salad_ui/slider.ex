defmodule SaladUI.Slider do
  @moduledoc false
  use SaladUI, :component

  @doc """
  Render Slider range input

  ## Example


      <.slider class="w-[60%]" id="slider-single-default-slider" max={50} min={10} step={5} value={20}/>

  """
  attr :id, :string, required: true
  attr :name, :string, default: nil
  attr :value, :integer, default: 0
  attr :min, :integer, default: 0
  attr :max, :integer, default: 100
  attr :step, :integer, default: 1

  attr :field, Phoenix.HTML.FormField, doc: "a form field struct retrieved from the form, for example: @form[:email]"

  attr :options, :map,
    default: %{},
    doc: """
    Options supported by the Zag.js library for configuring this component.
    See https://zagjs.com/components/react/slider#machine-context for full list of available options.
    """

  attr :listeners, :list,
    default: [],
    doc: """
    Event listeners supported by the Zag.js library for configuring this component.
    Each listener it's a tuple with the event name as an atom and where to handle it (`:client`, `:server` or both).
    See https://zagjs.com/components/react/slider#listening-for-events for full list of available listeners.
    """

  attr :class, :string, default: nil
  attr :rest, :global

  def slider(assigns) do
    assigns =
      prepare_assign(assigns)

    assigns =
      assigns
      |> Map.put(:value, normalize_integer(assigns[:value] || 0))
      |> Map.put(:min, normalize_integer(assigns[:min] || 0))
      |> Map.put(:max, normalize_integer(assigns[:max]))
      |> Map.put(:step, normalize_integer(assigns[:step]))

    ~H"""
    <div
      class={classes(["relative w-full", @class])}
      id={@id}
      phx-hook="ZagHook"
      data-component="slider"
      data-parts={Jason.encode!(["control", "track", "range", "thumb", "hidden-input"])}
      data-options={
        %{
          # zag expects the value as an array
          value: [@value],
          min: @min,
          max: @max,
          step: @step,
          name: @name
        }
        |> Map.merge(@options)
        |> Jason.encode!()
      }
      data-listeners={@listeners |> tuples_to_lists() |> Jason.encode!()}
    >
      <span data-part="control" class="flex w-full items-center">
        <span data-part="track" class="h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <span data-part="range" class="h-full bg-primary"></span>
        </span>
        <span
          data-part="thumb"
          data-options={Jason.encode!(%{value: @value})}
          class="h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
        </span>
      </span>
      <input
        data-part="hidden-input"
        data-options={Jason.encode!(%{value: @value})}
        class="w-full cursor-pointer"
        phx-update="ignore"
        {@rest}
      />
    </div>
    """
  end
end
