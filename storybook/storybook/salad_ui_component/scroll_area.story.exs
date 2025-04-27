defmodule Storybook.SaladUIComponents.ScrollArea do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  def function, do: &SaladUI.ScrollArea.scroll_area/1

  def imports, do: [{SaladUI.Separator, [separator: 1]}]

  def variations do
    [
      %Variation{
        id: :scroll_area,
        template: """
        <.scroll_area class="h-72 w-48 rounded-md border">
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
      }
    ]
  end
end
