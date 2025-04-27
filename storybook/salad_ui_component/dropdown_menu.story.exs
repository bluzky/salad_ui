defmodule Storybook.SaladUIComponents.DropdownMenu do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladUI.DropdownMenu

  def function, do: &DropdownMenu.dropdown_menu/1

  def imports,
    do: [
      {DropdownMenu, [ dropdown_menu_trigger: 1, dropdown_menu_content: 1, dropdown_menu_label: 1, dropdown_menu_separator: 1, dropdown_menu_item: 1, dropdown_menu_shortcut: 1, dropdown_menu_group: 1]},
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
                <.dropdown_menu_item>
                  <.icon name="hero-user" class="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <.dropdown_menu_shortcut>⌘P</.dropdown_menu_shortcut>
                </.dropdown_menu_item>
                <.dropdown_menu_item>
                  <.icon name="hero-cog-6-tooth" class="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <.dropdown_menu_shortcut>⌘S</.dropdown_menu_shortcut>
                </.dropdown_menu_item>
                <.dropdown_menu_item>
                  <.icon name="hero-banknotes" class="mr-2 h-4 w-4" />
                  <span>Billing</span>
                  <.dropdown_menu_shortcut>⌘B</.dropdown_menu_shortcut>
                </.dropdown_menu_item>
              </.dropdown_menu_group>
              <.dropdown_menu_separator />
              <.dropdown_menu_group>
                <.dropdown_menu_item>
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
              <.dropdown_menu_item>
                <.icon name="hero-arrow-left-on-rectangle" class="mr-2 h-4 w-4" />
                <span>Log out</span>
              </.dropdown_menu_item>
            </.dropdown_menu_content>
          </.dropdown_menu>
        </div>
        """
      },
      %Variation{
        id: :simple,
        description: "Simple dropdown menu with minimal options",
        template: """
        <div class="p-24 flex justify-center">
          <.dropdown_menu id="dropdown-simple">
            <.dropdown_menu_trigger>
              <.button variant="outline">Simple Menu</.button>
            </.dropdown_menu_trigger>
            <.dropdown_menu_content>
              <.dropdown_menu_item>
                <span>Option 1</span>
              </.dropdown_menu_item>
              <.dropdown_menu_item>
                <span>Option 2</span>
              </.dropdown_menu_item>
              <.dropdown_menu_item>
                <span>Option 3</span>
              </.dropdown_menu_item>
            </.dropdown_menu_content>
          </.dropdown_menu>
        </div>
        """
      },
      %Variation{
        id: :side_right,
        description: "Dropdown menu displayed from the right",
        template: """
        <div class="p-24 flex justify-center">
          <.dropdown_menu id="dropdown-side-right">
            <.dropdown_menu_trigger>
              <.button variant="outline">Right Menu</.button>
            </.dropdown_menu_trigger>
            <.dropdown_menu_content side="right">
              <.dropdown_menu_label>Side: right</.dropdown_menu_label>
              <.dropdown_menu_separator />
              <.dropdown_menu_item>
                <span>Option 1</span>
              </.dropdown_menu_item>
              <.dropdown_menu_item>
                <span>Option 2</span>
              </.dropdown_menu_item>
            </.dropdown_menu_content>
          </.dropdown_menu>
        </div>
        """
      },
      %Variation{
        id: :align_start,
        description: "Dropdown menu with start alignment (default)",
        template: """
        <div class="p-24 flex justify-center">
          <.dropdown_menu id="dropdown-align-start">
            <.dropdown_menu_trigger>
              <.button variant="outline">Align Start</.button>
            </.dropdown_menu_trigger>
            <.dropdown_menu_content align="start">
              <.dropdown_menu_label>Alignment: start</.dropdown_menu_label>
              <.dropdown_menu_separator />
              <.dropdown_menu_item>
                <span>Option 1</span>
              </.dropdown_menu_item>
              <.dropdown_menu_item>
                <span>Option 2</span>
              </.dropdown_menu_item>
            </.dropdown_menu_content>
          </.dropdown_menu>
        </div>
        """
      },
      %Variation{
        id: :align_center,
        description: "Dropdown menu with center alignment",
        template: """
        <div class="p-24 flex justify-center">
          <.dropdown_menu id="dropdown-align-center">
            <.dropdown_menu_trigger>
              <.button variant="outline">Align Center</.button>
            </.dropdown_menu_trigger>
            <.dropdown_menu_content align="center">
              <.dropdown_menu_label>Alignment: center</.dropdown_menu_label>
              <.dropdown_menu_separator />
              <.dropdown_menu_item>
                <span>Option 1</span>
              </.dropdown_menu_item>
              <.dropdown_menu_item>
                <span>Option 2</span>
              </.dropdown_menu_item>
            </.dropdown_menu_content>
          </.dropdown_menu>
        </div>
        """
      },
      %Variation{
        id: :align_end,
        description: "Dropdown menu with end alignment",
        template: """
        <div class="p-24 flex justify-center">
          <.dropdown_menu id="dropdown-align-end">
            <.dropdown_menu_trigger>
              <.button variant="outline">Align End</.button>
            </.dropdown_menu_trigger>
            <.dropdown_menu_content align="end">
              <.dropdown_menu_label>Alignment: end</.dropdown_menu_label>
              <.dropdown_menu_separator />
              <.dropdown_menu_item>
                <span>Option 1</span>
              </.dropdown_menu_item>
              <.dropdown_menu_item>
                <span>Option 2</span>
              </.dropdown_menu_item>
            </.dropdown_menu_content>
          </.dropdown_menu>
        </div>
        """
      },
      %Variation{
        id: :with_portal,
        description: "Dropdown menu rendered in a portal",
        template: """
        <div class="p-24 flex justify-center">
          <.dropdown_menu id="dropdown-portal" use-portal>
            <.dropdown_menu_trigger>
              <.button variant="outline">Portal Menu</.button>
            </.dropdown_menu_trigger>
            <.dropdown_menu_content>
              <.dropdown_menu_label>Portal Menu</.dropdown_menu_label>
              <.dropdown_menu_separator />
              <.dropdown_menu_item>
                <span>This menu is rendered in a portal</span>
              </.dropdown_menu_item>
              <.dropdown_menu_item>
                <span>Helps with z-index issues</span>
              </.dropdown_menu_item>
            </.dropdown_menu_content>
          </.dropdown_menu>
        </div>
        """
      }
    ]
  end
end
