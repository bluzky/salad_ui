defmodule SaladUI.Progress do
  @moduledoc """
  Implementation of Progress component for displaying completion percentages or loading states.

  Progress bars visually represent the completion status of an operation, providing
  immediate feedback about how far along a task or process is.

  ## Examples:

      <.progress value={50} />
      <.progress value={75} class="w-[60%]" />
  """
  use SaladUI, :component

  @doc """
  Renders a progress bar.

  ## Options

  * `:value` - The current progress value (0-100)
  * `:class` - Additional CSS classes
  """
  attr :class, :string, default: nil
  attr :value, :integer, default: 0, doc: "Current progress value (0-100)"
  attr :max, :integer, default: 100, doc: "Maximum value"
  attr :indeterminate, :boolean, default: false, doc: "Whether the progress is indeterminate"
  attr :rest, :global

  def progress(assigns) do
    # Normalize and clamp value between 0 and 100
    value = normalize_integer(assigns[:value] || 0)
    value = min(max(value, 0), assigns[:max] || 100)

    assigns = assign(assigns, :value, value)

    ~H"""
    <div
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax={@max || 100}
      aria-valuenow={if @indeterminate, do: nil, else: @value}
      class={classes(["relative h-4 w-full overflow-hidden rounded-full bg-secondary", @class])}
      data-indeterminate={to_string(@indeterminate)}
      {@rest}
    >
      <div
        class={classes([
          "h-full w-full flex-1 bg-primary transition-all",
          @indeterminate && "animate-indeterminate-progress"
        ])}
        style={if @indeterminate, do: nil, else: "transform: translateX(-#{100 - @value}%)"}
      >
      </div>
    </div>
    """
  end
end
