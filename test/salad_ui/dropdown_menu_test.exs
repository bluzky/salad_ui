defmodule SaladUI.DropdownMenuTest do
  use ComponentCase

  import SaladUI.Button
  import SaladUI.DropdownMenu
  import SaladUI.Icon
  import SaladUI.Menu

  describe "Test Dropdown menu" do
    test "It renders dropdown trigger correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.dropdown_menu_trigger>
          <.button variant="outline">Click me</.button>
        </.dropdown_menu_trigger>
        """)

      assert html =~ "Click me"

      assert html =~ ~s(data-part="trigger")
    end

    test "It renders dropdown menu content correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.dropdown_menu_content>
          <.menu class="w-56">
            <.menu_label>Account</.menu_label>
            <.menu_separator />
            <.menu_group>
              <.menu_item>
                <.icon name="hero-user" class="mr-2 h-4 w-4" />
                <span>Profile</span>
                <.menu_shortcut>⌘P</.menu_shortcut>
              </.menu_item>
              <.menu_item>
                <.icon name="hero-banknotes" class="mr-2 h-4 w-4" />
                <span>Billing</span>
                <.menu_shortcut>⌘B</.menu_shortcut>
              </.menu_item>
              <.menu_item>
                <.icon name="hero-cog-6-tooth" class="mr-2 h-4 w-4" />
                <span>Settings</span>
                <.menu_shortcut>⌘S</.menu_shortcut>
              </.menu_item>
            </.menu_group>
            <.menu_separator />
            <.menu_group>
              <.menu_item>
                <.icon name="hero-users" class="mr-2 h-4 w-4" />
                <span>Team</span>
              </.menu_item>
              <.menu_item disabled>
                <.icon name="hero-plus" class="mr-2 h-4 w-4" />
                <span>New team</span>
                <.menu_shortcut>⌘T</.menu_shortcut>
              </.menu_item>
            </.menu_group>
          </.menu>
        </.dropdown_menu_content>
        """)

      assert html =~ ~s(data-part="content")
      assert html =~ "z-50"
    end

    test "It renderes dropdown menu correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <div class="mt-24">
          <.dropdown_menu id="test-dropdown">
            <.dropdown_menu_trigger>
              <.button variant="outline">Click me</.button>
            </.dropdown_menu_trigger>
            <.dropdown_menu_content>
              <.menu class="w-56">
                <.menu_label>Account</.menu_label>
                <.menu_separator />
                <.menu_group>
                  <.menu_item>
                    <.icon name="hero-user" class="mr-2 h-4 w-4" /> <span>Profile</span>
                    <.menu_shortcut>⌘P</.menu_shortcut>
                  </.menu_item>

                  <.menu_item>
                    <.icon name="hero-banknotes" class="mr-2 h-4 w-4" /> <span>Billing</span>
                    <.menu_shortcut>⌘B</.menu_shortcut>
                  </.menu_item>

                  <.menu_item>
                    <.icon name="hero-cog-6-tooth" class="mr-2 h-4 w-4" /> <span>Settings</span>
                    <.menu_shortcut>⌘S</.menu_shortcut>
                  </.menu_item>
                </.menu_group>
                <.menu_separator />
                <.menu_group>
                  <.menu_item>
                    <.icon name="hero-users" class="mr-2 h-4 w-4" /> <span>Team</span>
                  </.menu_item>

                  <.menu_item disabled>
                    <.icon name="hero-plus" class="mr-2 h-4 w-4" /> <span>New team</span>
                    <.menu_shortcut>⌘T</.menu_shortcut>
                  </.menu_item>
                </.menu_group>
              </.menu>
            </.dropdown_menu_content>
          </.dropdown_menu>
        </div>
        """)

      assert html =~ "<span>Profile</span>"
      assert html =~ "<span>Billing</span>"
      assert html =~ "<span>Settings</span>"
      assert html =~ "<span>New team</span>"
      assert html =~ "⌘T"
      assert html =~ "⌘S"
      assert html =~ "hero-users"

      for css_class <- ~w(relative group inline-block) do
        assert html =~ css_class
      end
    end
  end
end
