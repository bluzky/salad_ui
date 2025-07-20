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

      assert html =~ ~s(data-part="trigger")
      assert html =~ ~s(class="text-green-500")
      assert html =~ "Hover Card"
    end

    test "hover_card_content top" do
      assigns = %{}

      html =
        ~H"""
        <.hover_card_content>Hover Card Content</.hover_card_content>
        """
        |> rendered_to_string()
        |> clean_string()

      # Check for data attributes
      assert html =~ ~s(data-part="content")
      assert html =~ ~s(data-side="top")
      assert html =~ ~s(hidden)

      # Check for content wrapper classes
      assert html =~ ~s(z-50)
      assert html =~ ~s(w-64)
      assert html =~ ~s(rounded-md)
      assert html =~ ~s(border)
      assert html =~ ~s(bg-popover)
      assert html =~ ~s(p-4)
      assert html =~ ~s(text-popover-foreground)
      assert html =~ ~s(shadow-md)

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

      # Check for data attributes
      assert html =~ ~s(data-part="content")
      assert html =~ ~s(data-side="bottom")
      assert html =~ ~s(hidden)

      # Check for content wrapper classes
      assert html =~ ~s(z-50)
      assert html =~ ~s(w-64)
      assert html =~ ~s(rounded-md)
      assert html =~ ~s(border)
      assert html =~ ~s(bg-popover)
      assert html =~ ~s(p-4)
      assert html =~ ~s(text-popover-foreground)
      assert html =~ ~s(shadow-md)

      assert html =~ "Hover Card Content"
    end

    test "It renders hover_card_content right correctly" do
      assigns = %{}

      html =
        ~H"""
        <.hover_card_content side="right">Hover Card Content</.hover_card_content>
        """
        |> rendered_to_string()
        |> clean_string()

      # Check for data attributes
      assert html =~ ~s(data-part="content")
      assert html =~ ~s(data-side="right")
      assert html =~ ~s(hidden)

      # Check for content wrapper classes
      assert html =~ ~s(z-50)
      assert html =~ ~s(w-64)
      assert html =~ ~s(rounded-md)
      assert html =~ ~s(border)
      assert html =~ ~s(bg-popover)
      assert html =~ ~s(p-4)
      assert html =~ ~s(text-popover-foreground)
      assert html =~ ~s(shadow-md)

      assert html =~ "Hover Card Content"
    end
  end
end
