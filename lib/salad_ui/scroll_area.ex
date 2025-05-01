defmodule SaladUI.ScrollArea do
  @moduledoc """
  Implementation of a scroll area component with custom styling.

  The scroll area provides a consistent scrolling experience across different browsers
  and platforms, with customizable styling for the scrollbar.

  ## Examples:

      <.scroll_area class="h-[200px]">
        <div class="p-4">
          <h4 class="mb-4 text-sm font-medium leading-none">Tags</h4>
          <%= for tag <- 1..50 do %>
            <div class="text-sm">
              v1.2.0-beta.<%= tag %>
            </div>
            <.separator class="my-2" />
          <% end %>
        </div>
      </.scroll_area>
  """
  use SaladUI, :component

  @doc """
  Renders a custom scrollable area.

  ## Options

  * `:class` - Additional CSS classes to apply to the scroll area container
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block

  def scroll_area(assigns) do
    ~H"""
    <div class={classes(["relative overflow-hidden", @class])} {@rest}>
      <div class="salad-scroll-area rounded-[inherit] h-full w-full overflow-y-auto overflow-x-hidden">
        <div class="-mr-3" style="min-width: 100%;">
          {render_slot(@inner_block)}
        </div>
      </div>
    </div>
    """
  end
end
