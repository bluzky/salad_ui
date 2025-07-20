defmodule SaladUI.PopoverTest do
  use ComponentCase

  import SaladUI.Popover

  describe "test popover" do
    test "popover_trigger" do
      assigns = %{}

      html =
        ~H"""
        <.popover_trigger class="text-green-500" target="xxx-id">Popover</.popover_trigger>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ ~s(data-part="trigger")
      assert html =~ ~s(class="text-green-500")
      assert html =~ "Popover"
    end

    test "popover_content default (bottom)" do
      assigns = %{id: "xxx-id"}

      html =
        ~H"""
        <.popover_content id={@id}>Popover Content</.popover_content>
        """
        |> rendered_to_string()
        |> clean_string()

      # Check for positioner wrapper
      assert html =~ ~s(data-part="positioner")
      # default side
      assert html =~ ~s(data-side="bottom")
      assert html =~ ~s(hidden)

      # Check for content element
      assert html =~ ~s(data-part="content")
      assert html =~ ~s(id="xxx-id")

      # Check for content wrapper classes
      assert html =~ ~s(z-50)
      assert html =~ ~s(w-72)
      assert html =~ ~s(rounded-md)
      assert html =~ ~s(border)
      assert html =~ ~s(bg-popover)
      assert html =~ ~s(p-4)
      assert html =~ ~s(text-popover-foreground)
      assert html =~ ~s(shadow-md)

      assert html =~ "Popover Content"
    end

    test "It renders popover_content bottom correctly" do
      assigns = %{id: "xxx-id"}

      html =
        ~H"""
        <.popover_content id={@id} side="bottom">Popover Content</.popover_content>
        """
        |> rendered_to_string()
        |> clean_string()

      # Check for data attributes
      assert html =~ ~s(data-part="content")
      assert html =~ ~s(data-side="bottom")
      assert html =~ ~s(hidden)

      # Check for content wrapper classes
      assert html =~ ~s(z-50)
      assert html =~ ~s(w-72)
      assert html =~ ~s(rounded-md)
      assert html =~ ~s(border)
      assert html =~ ~s(bg-popover)
      assert html =~ ~s(p-4)
      assert html =~ ~s(text-popover-foreground)
      assert html =~ ~s(shadow-md)

      assert html =~ "Popover Content"
    end

    test "It renders popover_content right correctly" do
      assigns = %{id: "xxx-id"}

      html =
        ~H"""
        <.popover_content id={@id} side="right">Popover Content</.popover_content>
        """
        |> rendered_to_string()
        |> clean_string()

      # Check for data attributes
      assert html =~ ~s(data-part="content")
      assert html =~ ~s(data-side="right")
      assert html =~ ~s(hidden)

      # Check for content wrapper classes
      assert html =~ ~s(z-50)
      assert html =~ ~s(w-72)
      assert html =~ ~s(rounded-md)
      assert html =~ ~s(border)
      assert html =~ ~s(bg-popover)
      assert html =~ ~s(p-4)
      assert html =~ ~s(text-popover-foreground)
      assert html =~ ~s(shadow-md)

      assert html =~ "Popover Content"
    end
  end
end
