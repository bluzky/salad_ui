defmodule SaladUI.Progress do
  @moduledoc false
  use SaladUI, :component

  @doc """
  Render progress bar

  ## Example


      <.progress class="w-[60%]" value={20}/>

  """
  attr :id, :string, required: true
  attr :value, :integer, default: 0
  attr :min, :integer, default: 0
  attr :max, :integer, default: 100

  attr :options, :map,
    default: %{},
    doc: """
    Options supported by the Zag.js library for configuring this component.
    See https://zagjs.com/components/react/linear-progress#machine-context for full list of available options.
    """

  attr :class, :string, default: nil
  attr :rest, :global

  def progress(assigns) do
    assigns = assign(assigns, :value, normalize_integer(assigns[:value]))

    ~H"""
    <div
      class={classes(["relative h-4 w-full overflow-hidden rounded-full bg-secondary", @class])}
      id={@id}
      phx-hook="ZagHook"
      data-component="progress"
      data-parts={Jason.encode!(["track", "range"])}
      data-options={
        %{
          value: @value,
          min: @min,
          max: @max
        }
        |> Map.merge(@options)
        |> Jason.encode!()
      }
      {@rest}
    >
      <div data-part="track">
        <div data-part="range" class="bg-primary transition-all" />
      </div>
    </div>
    """
  end
end
