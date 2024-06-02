defmodule SaladUI.ScrollArea do
  @moduledoc false
  use SaladUI, :component

  @doc """
  Render skeleton
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block)

  def scroll_area(assigns) do
    ~H"""
    <div class={classes(["relative overflow-hidden", @class])} {@rest}>
      <div class="salad-scroll-area rounded-[inherit] h-full w-full overflow-y-auto overflow-x-hidden">
        <div class="-mr-3" style="min-width: 100%;">
          <%= render_slot(@inner_block) %>
        </div>
      </div>
    </div>
    """
  end
end
