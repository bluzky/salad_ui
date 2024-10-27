defmodule SaladUI.PopoverTest do
  use ComponentCase

  import SaladUI.Button
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

      assert html =~
               "<div data-side=\"top\" data-state=\"closed\" phx-click-away=\"[[&quot;set_attr&quot;,{&quot;attr&quot;:[&quot;data-state&quot;,&quot;closed&quot;]}]]\" class=\"absolute block p-4 mb-2 rounded-md bg-popover text-popover-foreground outline-none shadow-md z-50 left-1/2 bottom-full w-72 -translate-x-1/2 animate-in border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:hidden fade-in-0 slide-in-from-left-1/2 zoom-in-95\">Popover Content</div>"
    end

    test "It renders popover_content bottom correctly" do
      assigns = %{}

      html =
        ~H"""
        <.popover_content side="bottom">Popover Content</.popover_content>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<div data-side=\"bottom\" data-state=\"closed\" phx-click-away=\"[[&quot;set_attr&quot;,{&quot;attr&quot;:[&quot;data-state&quot;,&quot;closed&quot;]}]]\" class=\"absolute block p-4 mt-2 rounded-md bg-popover text-popover-foreground outline-none shadow-md z-50 left-1/2 top-full w-72 -translate-x-1/2 animate-in border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:hidden fade-in-0 slide-in-from-left-1/2 zoom-in-95\">Popover Content</div>"
    end

    test "It renders popover_content right correctly" do
      assigns = %{}

      html =
        ~H"""
        <.popover_content side="right">Popover Content</.popover_content>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<div data-side=\"right\" data-state=\"closed\" phx-click-away=\"[[&quot;set_attr&quot;,{&quot;attr&quot;:[&quot;data-state&quot;,&quot;closed&quot;]}]]\" class=\"absolute block p-4 ml-2 rounded-md bg-popover text-popover-foreground outline-none shadow-md z-50 left-full top-1/2 w-72 -translate-y-1/2 animate-in border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:hidden fade-in-0 slide-in-from-top-1/2 zoom-in-95\">Popover Content</div>"
    end

    test "It renders popover correctly" do
      assigns = %{}

      html =
        ~H"""
        <.popover>
          <.popover_trigger target="content-id">
            <.button variant="link">
              @salad_ui
            </.button>
          </.popover_trigger>

          <.popover_content id="content-id">
            Hover card content
          </.popover_content>
        </.popover>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "div class=\"relative inline-block\"><div class=\"\" phx-click=\"[[&quot;toggle_attr&quot;,{&quot;attr&quot;:[&quot;data-state&quot;,&quot;open&quot;,&quot;closed&quot;],&quot;to&quot;:&quot;#content-id&quot;}]]\"><button class=\"inline-flex px-4 py-2 rounded-md text-primary transition-colors whitespace-nowrap items-center justify-center font-medium underline-offset-4 text-sm h-9 hover:underline focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50\">@salad_ui</button></div><div data-side=\"top\" data-state=\"closed\" phx-click-away=\"[[&quot;set_attr&quot;,{&quot;attr&quot;:[&quot;data-state&quot;,&quot;closed&quot;]}]]\" class=\"absolute block p-4 mb-2 rounded-md bg-popover text-popover-foreground outline-none shadow-md z-50 left-1/2 bottom-full w-72 -translate-x-1/2 animate-in border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:hidden fade-in-0 slide-in-from-left-1/2 zoom-in-95\" id=\"content-id\">Hover card content</div></div>"
    end
  end
end
