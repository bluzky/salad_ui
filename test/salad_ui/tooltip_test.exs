defmodule SaladUI.TooltipTest do
  use ComponentCase

  import SaladUI.Tooltip

  describe "tooltip" do
    test "renders root with generated id, hook, options, and event mappings" do
      assigns = %{}

      html =
        ~H"""
        <.tooltip open-delay={125} close-delay={50} on-open="opened" on-close="closed">
          <.tooltip_trigger>Trigger</.tooltip_trigger>
          <.tooltip_content>Content</.tooltip_content>
        </.tooltip>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ ~r/id="tooltip-\d+"/
      assert html =~ "data-component=\"tooltip\""
      assert html =~ "data-state=\"closed\""
      assert html =~ "phx-hook=\"SaladUI\""
      assert html =~ "data-part=\"root\""
      assert html =~ "openDelay"
      assert html =~ "125"
      assert html =~ "closeDelay"
      assert html =~ "50"
      assert html =~ "open"
      assert html =~ "opened"
      assert html =~ "close"
      assert html =~ "closed"
      refute html =~ "closed_to_open"
      assert html =~ "open_to_closed"
    end

    test "renders explicit id and trigger" do
      assigns = %{}

      html =
        ~H"""
        <.tooltip id="help-tooltip">
          <.tooltip_trigger class="text-green-500">Help</.tooltip_trigger>
          <.tooltip_content>Tooltip content</.tooltip_content>
        </.tooltip>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "id=\"help-tooltip\""
      assert html =~ "data-part=\"trigger\""
      assert html =~ "class=\"text-green-500\""
      assert html =~ "Help"
    end

    test "renders content with positioning attributes" do
      assigns = %{}

      html =
        ~H"""
        <.tooltip_content side="right" align="start" side-offset={12} align-offset={4}>
          Tooltip content
        </.tooltip_content>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "data-part=\"content\""
      assert html =~ "data-side=\"right\""
      assert html =~ "data-align=\"start\""
      assert html =~ "data-side-offset=\"12\""
      assert html =~ "data-align-offset=\"4\""
      assert html =~ "z-50 overflow-hidden rounded-md border border-border bg-popover"
      assert html =~ "data-[side=right]:slide-in-from-left-2"
      assert html =~ "hidden"
      assert html =~ "Tooltip content"
    end
  end
end
