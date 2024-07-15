defmodule SaladUI.Skeleton do
  @moduledoc false
  use SaladUI, :component

  @doc """
  Render skeleton
  """
  attr :class, :string, default: nil
  attr :rest, :global

  def skeleton(assigns) do
    ~H"""
    <div
      class={
        classes([
          "animate-pulse rounded-md bg-muted",
          @class
        ])
      }
      {@rest}
    >
    </div>
    """
  end
end
