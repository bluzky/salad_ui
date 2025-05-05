defmodule SaladUI.SidebarTest do
  use ComponentCase

  import SaladUI.Sidebar

  describe "sidebar provider" do
    test "renders with default classes and style" do
      assigns = %{}

      html =
        ~H"""
        <.sidebar_provider>Content</.sidebar_provider>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar"
      assert html =~ "--sidebar-width: 16rem"
      assert html =~ "--sidebar-width-icon: 3rem"
      assert html =~ "Content"
    end

    test "accepts custom classes and styles" do
      assigns = %{}

      html =
        ~H"""
        <.sidebar_provider class="custom-class" style={%{"custom-var": "value"}}>
          Content
        </.sidebar_provider>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "custom-class"
      assert html =~ "custom-var: value"
    end
  end

  describe "sidebar" do
    test "renders non-collapsible sidebar correctly" do
      assigns = %{}

      html =
        ~H"""
        <.sidebar id="test-sidebar" collapsible="none">Content</.sidebar>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground"
      assert html =~ "Content"
    end

    test "renders mobile sidebar correctly" do
      assigns = %{}

      html =
        ~H"""
        <.sidebar id="test-sidebar" is_mobile={true}>Content</.sidebar>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "data-sidebar=\"sidebar\""
      assert html =~ "data-mobile=\"true\""
      assert html =~ "w-[--sidebar-width]"
      assert html =~ "bg-sidebar"
      assert html =~ "Content"
    end

    test "renders standard sidebar with correct attributes" do
      assigns = %{}

      html =
        ~H"""
        <.sidebar id="test-sidebar" side="left" variant="sidebar" collapsible="offcanvas" state="expanded">
          Content
        </.sidebar>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "data-state=\"expanded\""
      assert html =~ "data-collapsible=\"none\""
      assert html =~ "data-variant=\"sidebar\""
      assert html =~ "data-side=\"left\""
      assert html =~ "Content"
    end
  end

  describe "sidebar_trigger" do
    test "renders with correct attributes" do
      assigns = %{}

      html =
        ~H"""
        <.sidebar_trigger target="test-sidebar" class="custom-class">
          Toggle
        </.sidebar_trigger>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "data-sidebar=\"trigger\""
      assert html =~ "h-7 w-7"
      assert html =~ "custom-class"
      assert html =~ "Toggle"
      assert html =~ "Toggle Sidebar"
    end
  end

  describe "sidebar_content" do
    test "renders with correct classes" do
      assigns = %{}

      html =
        ~H"""
        <.sidebar_content class="custom-class">Content</.sidebar_content>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "data-sidebar=\"content\""
      assert html =~ "salad-scroll-area"
      assert html =~ "flex min-h-0 flex-1 flex-col gap-2 overflow-auto"
      assert html =~ "custom-class"
      assert html =~ "Content"
    end
  end

  describe "sidebar_group" do
    test "renders group with label and content" do
      assigns = %{}

      html =
        ~H"""
        <.sidebar_group>
          <.sidebar_group_label>Group Label</.sidebar_group_label>
          <.sidebar_group_content>Group Content</.sidebar_group_content>
        </.sidebar_group>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "data-sidebar=\"group\""
      assert html =~ "data-sidebar=\"group-label\""
      assert html =~ "data-sidebar=\"group-content\""
      assert html =~ "Group Label"
      assert html =~ "Group Content"
    end
  end

  describe "sidebar_menu" do
    test "renders menu with items and buttons" do
      assigns = %{}

      html =
        ~H"""
        <.sidebar_menu>
          <.sidebar_menu_item>
            <.sidebar_menu_button tooltip="Item 1">
              <span>Menu Item 1</span>
            </.sidebar_menu_button>
          </.sidebar_menu_item>
        </.sidebar_menu>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "data-sidebar=\"menu\""
      assert html =~ "data-sidebar=\"menu-item\""
      assert html =~ "data-sidebar=\"menu-button\""
      assert html =~ "Menu Item 1"
    end

    test "renders menu button with different variants and sizes" do
      assigns = %{}

      html =
        ~H"""
        <.sidebar_menu_button variant="outline" size="lg" is_active={true}>
          Large Active Button
        </.sidebar_menu_button>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "data-sidebar=\"menu-button\""
      assert html =~ "data-size=\"lg\""
      assert html =~ "data-active"
      assert html =~ "data-[active]:"
      assert html =~ "Large Active Button"
    end
  end

  describe "sidebar_menu_sub" do
    test "renders submenu with items" do
      assigns = %{}

      html =
        ~H"""
        <.sidebar_menu_sub>
          <.sidebar_menu_sub_item>
            <.sidebar_menu_sub_button size="sm" is_active={true}>
              Sub Item
            </.sidebar_menu_sub_button>
          </.sidebar_menu_sub_item>
        </.sidebar_menu_sub>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "data-sidebar=\"menu-sub\""
      assert html =~ "data-sidebar=\"menu-sub-button\""
      assert html =~ "data-size=\"sm\""
      assert html =~ "data-active"
      assert html =~ "data-[active]:"
      assert html =~ "Sub Item"
    end
  end
end
