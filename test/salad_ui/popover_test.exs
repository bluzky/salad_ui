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

      assert html =~ ~r/<div class=\"text-green-500\".+Popover<\/div>/
    end

    test "popover_content top" do
      assigns = %{}

      html =
        ~H"""
        <.popover_content>Popover Content</.popover_content>
        """
        |> rendered_to_string()
        |> clean_string()

      for class <- ~w(absolute hidden p-4 mb-2 rounded-md bg-popover text-popover-foreground outline-none shadow-md z-50 left-1/2 bottom-full w-72 -translate-x-1/2 animate-in border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:hidden fade-in-0 slide-in-from-left-1/2 zoom-in-95) do
        assert html =~ class
      end
      assert html =~ "Popover Content"
      assert html =~ "data-side=\"top\""
    end

    test "It renders popover_content bottom correctly" do
      assigns = %{}

      html =
        ~H"""
        <.popover_content side="bottom">Popover Content</.popover_content>
        """
        |> rendered_to_string()
        |> clean_string()

      for class <- ~w(absolute hidden p-4 mt-2 rounded-md bg-popover text-popover-foreground outline-none shadow-md z-50 left-1/2 top-full w-72 -translate-x-1/2 animate-in border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:hidden fade-in-0 slide-in-from-left-1/2 zoom-in-95) do
        assert html =~ class
      end
      assert html =~ "Popover Content"
    end

    test "It renders popover_content right correctly" do
      assigns = %{}

      html =
        ~H"""
        <.popover_content side="right">Popover Content</.popover_content>
        """
        |> rendered_to_string()
        |> clean_string()

      for class <- ~w(absolute hidden p-4 ml-2 rounded-md bg-popover text-popover-foreground outline-none shadow-md z-50 left-full top-1/2 w-72 -translate-y-1/2 animate-in border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:hidden fade-in-0 slide-in-from-top-1/2 zoom-in-95) do
        assert html =~ class
      end
      assert html =~ "Popover Content"
      assert html =~ "data-side=\"right\""
    end
  end
end
