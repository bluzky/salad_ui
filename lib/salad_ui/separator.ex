defmodule SaladUI.Separator do
  @moduledoc """
  Implementation of a separator component for dividing content.

  ## Examples:

      <.separator orientation="horizontal" />
      <.separator orientation="vertical" class="h-6" />
  """
  use SaladUI, :component

  @doc """
  Renders a separator.

  ## Options

  * `:orientation` - The orientation of the separator (`horizontal` or `vertical`). Defaults to `horizontal`.
  * `:class` - Additional CSS classes
  """
  attr :orientation, :string, values: ~w(vertical horizontal), default: "horizontal"
  attr :class, :string, default: nil
  attr :rest, :global, include: ~w(disabled form name value)

  def separator(assigns) do
    ~H"""
    <div
      role="separator"
      aria-orientation={@orientation}
      class={
        classes([
          "shrink-0 bg-border",
          (@orientation == "horizontal" && "h-[1px] w-full") || "h-full w-[1px]",
          @class
        ])
      }
      {@rest}
    >
    </div>
    """
  end
end
