defmodule SaladUI.HoverCardTest do
  use ComponentCase

  import SaladUI.Button
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

      assert html =~
               "<div data-side=\"top\" class=\"absolute hidden p-4 mb-2 rounded-md bg-popover text-popover-foreground outline-none shadow-md z-50 left-1/2 bottom-full w-64 -translate-x-1/2 animate-in border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 fade-in-0 group-hover/hover-card:block slide-in-from-left-1/2 zoom-in-95\">Hover Card Content</div>"
    end

    test "It renders hover_card_content bottom correctly" do
      assigns = %{}

      html =
        ~H"""
        <.hover_card_content side="bottom">Hover Card Content</.hover_card_content>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<div data-side=\"bottom\" class=\"absolute hidden p-4 mt-2 rounded-md bg-popover text-popover-foreground outline-none shadow-md z-50 left-1/2 top-full w-64 -translate-x-1/2 animate-in border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 fade-in-0 group-hover/hover-card:block slide-in-from-left-1/2 zoom-in-95\">Hover Card Content</div>"
    end

    test "It renders hover_card_content right correctly" do
      assigns = %{}

      html =
        ~H"""
        <.hover_card_content side="right">Hover Card Content</.hover_card_content>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<div data-side=\"right\" class=\"absolute hidden p-4 ml-2 rounded-md bg-popover text-popover-foreground outline-none shadow-md z-50 left-full top-1/2 w-64 -translate-y-1/2 animate-in border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 fade-in-0 group-hover/hover-card:block slide-in-from-top-1/2 zoom-in-95\">Hover Card Content</div>"
    end

    test "It renders hover_card correctly" do
      assigns = %{}

      html =
        ~H"""
        <.hover_card>
          <.hover_card_trigger>
            <.button variant="link">
              @salad_ui
            </.button>
          </.hover_card_trigger>

          <.hover_card_content>
            Hover card content
          </.hover_card_content>
        </.hover_card>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<div class=\"relative inline-block group/hover-card\"><div class=\"\"><button class=\"inline-flex px-4 py-2 rounded-md text-primary transition-colors whitespace-nowrap items-center justify-center font-medium underline-offset-4 text-sm h-9 hover:underline focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50\">@salad_ui</button></div><div data-side=\"top\" class=\"absolute hidden p-4 mb-2 rounded-md bg-popover text-popover-foreground outline-none shadow-md z-50 left-1/2 bottom-full w-64 -translate-x-1/2 animate-in border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 fade-in-0 group-hover/hover-card:block slide-in-from-left-1/2 zoom-in-95\">Hover card content</div></div>"
    end
  end
end
