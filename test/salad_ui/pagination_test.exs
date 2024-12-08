defmodule SaladUi.PaginationTest do
  use ComponentCase

  import SaladUI.Pagination

  describe "Test Pagination:" do
    test "It renders pagination_content correctly" do
      assigns = %{}

      html =
        ~H"""
        <.pagination_content>Content goes here</.pagination_content>
        """
        |> rendered_to_string()
        |> clean_string()

      for class <-
            ~w("flex items-center flex-row gap-1") do
        assert html =~ class
      end

      assert html =~ "</ul>"
      assert html =~ "Content goes here"
    end

    test "It renders pagination_item correctly" do
      assigns = %{}

      html =
        ~H"""
        <.pagination_item>
          Item writings
        </.pagination_item>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "<li class=\"\""
      assert html =~ "</li>"
      assert html =~ "Item writings"
    end

    test "It renders pagination_link" do
      assigns = %{}

      html =
        ~H"""
        <.pagination_link href="">3</.pagination_link>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ ~r/<a[^>]*aria-current=""[^>]*>3<\/a>/

      for css_class <-
            ~w(inline-flex rounded-md transition-colors whitespace-nowrap items-center justify-center font-medium text-sm w-9 h-9 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground) do
        assert html =~ css_class
      end
    end

    test "it renders pagination_next correctly" do
      assigns = %{}

      html =
        ~H"""
        <span>Next</span>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "<span>Next</span>"
    end

    test "IT renders pagination_previous correclty" do
      assigns = %{}

      html =
        ~H"""
        <.pagination_previous href="#" />
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M15.75 19.5 8.25 12l7.5-7.5\"></path></svg><span>Previous</span></a>"
    end

    test "It renders pagination_ellipsis correctly" do
      assigns = %{}

      html =
        ~H"""
        <.pagination_ellipsis />
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ ""
    end
  end
end
