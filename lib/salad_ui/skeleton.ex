defmodule SaladUI.Skeleton do
  @moduledoc """
  Skeleton loading component for showing placeholder content while data is loading.

  Skeleton loaders provide visual feedback to users during data loading, improving perceived performance.

  ## Examples:

      <.skeleton class="h-4 w-full" />

      # Card loading skeleton
      <div class="space-y-2">
        <.skeleton class="h-32 w-full rounded-lg" />
        <.skeleton class="h-4 w-2/3" />
        <.skeleton class="h-4 w-full" />
        <.skeleton class="h-4 w-full" />
      </div>

      # Avatar and text loading skeleton
      <div class="flex items-center gap-4">
        <.skeleton class="h-12 w-12 rounded-full" />
        <div class="space-y-2">
          <.skeleton class="h-4 w-32" />
          <.skeleton class="h-4 w-24" />
        </div>
      </div>
  """
  use SaladUI, :component

  @doc """
  Renders a skeleton loading placeholder.

  ## Attributes

  * `:class` - Additional CSS classes to apply to the skeleton element. Use this to control
    dimensions (width, height), border radius and other visual aspects.
  * `:rest` - Additional HTML attributes to apply to the skeleton element.

  ## Examples

      <.skeleton class="h-6 w-24" />
      <.skeleton class="h-12 w-12 rounded-full" />
      <.skeleton class="h-4 w-full max-w-sm" />
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
