defmodule SaladUi.ScrollAreaTest do
  use ComponentCase

  import SaladUI.ScrollArea
  import SaladUI.Separator

  describe "Test scroll_area" do
    test "It renders scroll_area correctly" do
      assigns = %{}

      html =
        ~H"""
        <.scroll_area>
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
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "<div class=\"p-4\">"
      assert html =~ "<div class=\"-mr-3\" style=\"min-width: 100%;\">"
      assert html =~ "<h4 class=\"mb-4 text-sm font-medium leading-none\">Tags</h4>"
      assert html =~ "<div class=\"salad-scroll-area rounded-[inherit] h-full w-full overflow-y-auto overflow-x-hidden\">"

      for tag <- 1..50 do
        assert html =~ "v1.2.0-beta.#{tag}"
      end
    end
  end
end
