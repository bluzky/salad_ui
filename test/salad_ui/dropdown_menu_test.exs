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

      for css_class <- ~w(dropdown-menu-trigger peer) do
        assert html =~ css_class
      end
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

      for css_class <-
            ~w(z-50 animate-in peer-data-[state=closed]:fade-out-0 peer-data-[state=open]:fade-in-0 peer-data-[state=closed]:zoom-out-95 peer-data-[state=open]:zoom-in-95 peer-data-[side=bottom]:slide-in-from-top-2 peer-data-[side=left]:slide-in-from-right-2 peer-data-[side=right]:slide-in-from-left-2 peer-data-[side=top]:slide-in-from-bottom-2) do
        assert html =~ css_class
      end
    end

    test "It renderes dropdown menu correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <div class="mt-24">
          <.dropdown_menu>
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
