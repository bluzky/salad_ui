defmodule SaladUI.HoverCardTest do
  use ComponentCase

  import SaladUI.HoverCard

  describe "test hover_card" do
    test "hover_card_trigger" do
      assigns = %{}

      html =
        ~H"""
        <.hover_card_trigger class="text-green-500">Hover Card</.hover_card_trigger>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "<div class=\"text-green-500\">Hover Card</div>"
    end

    test "hover_card_content top" do
      assigns = %{}

      html =
        ~H"""
        <.hover_card_content>Hover Card Content</.hover_card_content>
        """
        |> rendered_to_string()
        |> clean_string()

      for class <-
            ~w(absolute hidden p-4 mb-2 rounded-md bg-popover text-popover-foreground outline-none shadow-md z-50 left-1/2 bottom-full w-64 -translate-x-1/2 animate-in border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 fade-in-0 group-hover/hover-card:block slide-in-from-left-1/2 zoom-in-95) do
        assert html =~ class
      end

      assert html =~ "Hover Card Content"
    end

    test "It renders hover_card_content bottom correctly" do
      assigns = %{}

      html =
        ~H"""
        <.hover_card_content side="bottom">Hover Card Content</.hover_card_content>
        """
        |> rendered_to_string()
        |> clean_string()

      for class <-
            ~w(absolute hidden p-4 mt-2 rounded-md bg-popover text-popover-foreground outline-none shadow-md z-50 left-1/2 top-full w-64 -translate-x-1/2 animate-in border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 fade-in-0 group-hover/hover-card:block slide-in-from-left-1/2 zoom-in-95) do
        assert html =~ class
      end

      assert html =~ "Hover Card Content"
      assert html =~ "data-side=\"bottom\""
    end

    test "It renders hover_card_content right correctly" do
      assigns = %{}

      html =
        ~H"""
        <.hover_card_content side="right">Hover Card Content</.hover_card_content>
        """
        |> rendered_to_string()
        |> clean_string()

      for class <-
            ~w(absolute hidden p-4 ml-2 rounded-md bg-popover text-popover-foreground outline-none shadow-md z-50 left-full top-1/2 w-64 -translate-y-1/2 animate-in border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 fade-in-0 group-hover/hover-card:block slide-in-from-top-1/2 zoom-in-95) do
        assert html =~ class
      end

      assert html =~ "Hover Card Content"
    end
  end
end
