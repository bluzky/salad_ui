defmodule Storybook.SaladUIComponents.DropdownMenu do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladUI.DropdownMenu

  def function, do: &DropdownMenu.dropdown_menu/1

  def imports,
    do: [
      {DropdownMenu,
       [
         dropdown_menu_trigger: 1,
         dropdown_menu_content: 1,
         dropdown_menu_label: 1,
         dropdown_menu_separator: 1,
         dropdown_menu_item: 1,
         dropdown_menu_shortcut: 1,
         dropdown_menu_group: 1,
         dropdown_menu_checkbox_item: 1,
         dropdown_menu_radio_group: 1,
         dropdown_menu_radio_item: 1,
         dropdown_menu_sub: 1,
         dropdown_menu_sub_trigger: 1,
         dropdown_menu_sub_content: 1
       ]},
      {SaladUI.Button, [button: 1]},
      {SaladStorybookWeb.CoreComponents, [icon: 1]}
    ]

  def variations do
    [
      %Variation{
        id: :default,
        description: "Default dropdown menu with various options",
        template: """
        <div class="p-24 flex justify-center">
          <.dropdown_menu id="dropdown-default">
            <.dropdown_menu_trigger>
              <.button variant="outline">Open Menu</.button>
            </.dropdown_menu_trigger>
            <.dropdown_menu_content class="w-56">
              <.dropdown_menu_label>Account</.dropdown_menu_label>
              <.dropdown_menu_separator />
              <.dropdown_menu_group>
                <.dropdown_menu_item on-select="on_command" value="profile">
                  <.icon name="hero-user" class="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <.dropdown_menu_shortcut>⌘P</.dropdown_menu_shortcut>
                </.dropdown_menu_item>
                <.dropdown_menu_item on-select="on_command">
                  <.icon name="hero-cog-6-tooth" class="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <.dropdown_menu_shortcut>⌘S</.dropdown_menu_shortcut>
                </.dropdown_menu_item>
                <.dropdown_menu_item on-select="on_command">
                  <.icon name="hero-banknotes" class="mr-2 h-4 w-4" />
                  <span>Billing</span>
                  <.dropdown_menu_shortcut>⌘B</.dropdown_menu_shortcut>
                </.dropdown_menu_item>
              </.dropdown_menu_group>
              <.dropdown_menu_separator />
              <.dropdown_menu_group>
                <.dropdown_menu_item on-select="on_command">
                  <.icon name="hero-users" class="mr-2 h-4 w-4" />
                  <span>Team</span>
                </.dropdown_menu_item>
                <.dropdown_menu_item disabled>
                  <.icon name="hero-plus" class="mr-2 h-4 w-4" />
                  <span>New Team</span>
                  <.dropdown_menu_shortcut>⌘T</.dropdown_menu_shortcut>
                </.dropdown_menu_item>
              </.dropdown_menu_group>
              <.dropdown_menu_separator />
              <.dropdown_menu_item on-select="on_command">
                <.icon name="hero-arrow-left-on-rectangle" class="mr-2 h-4 w-4" />
                <span>Log out</span>
              </.dropdown_menu_item>
            </.dropdown_menu_content>
          </.dropdown_menu>
        </div>
        """
      },
      %Variation{
        id: :checkbox_item,
        description: "Dropdown with checkbox",
        template: """
        <.dropdown_menu id="text-formatting">
        <.dropdown_menu_trigger>
        <.button variant="outline">Format</.button>
        </.dropdown_menu_trigger>
        <.dropdown_menu_content>
        <.dropdown_menu_checkbox_item
        checked
        on-checked-change="toggle_bold"
        >
        <span class="font-bold">Bold</span>
        </.dropdown_menu_checkbox_item>
        <.dropdown_menu_checkbox_item
        on-checked-change={JS.push("toggle_italic")}
        >
        <span class="italic">Italic</span>
        </.dropdown_menu_checkbox_item>
        <.dropdown_menu_checkbox_item
        on-select="format_underline"
        on-checked-change={JS.push("toggle_underline")}
        >
        <span class="underline">Underline</span>
        </.dropdown_menu_checkbox_item>
        </.dropdown_menu_content>
        </.dropdown_menu>
        """
      }
    ]
  end
end
