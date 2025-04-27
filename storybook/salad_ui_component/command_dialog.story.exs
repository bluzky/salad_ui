defmodule Storybook.SaladUIComponents.CommandDialog do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladUI.Command
  alias SaladUI.Separator

  def function, do: &Command.command_dialog/1
  def layout, do: :one_column

  def imports,
    do: [
      {Command,
       [command_input: 1, command_list: 1, command_empty: 1, command_group: 1, command_item: 1, command_shortcut: 1]},
      {Lucideicons, [earth: 1, calendar: 1, calculator: 1, user: 1, credit_card: 1, settings: 1]},
      {Separator, [separator: 1]}
    ]

  def variations do
    [
      %Variation{
        id: :command,
        template: """
        <.command_dialog id="command-2" open={true}>
          <.command_input placeholder="Type a command or search..." />
          <.command_empty>
            <span>No results found</span>
          </.command_empty>
          <.command_list>
            <.command_group heading="Suggestions">
              <.command_item phx-value-name="calendar" phx-click="select_command">
                <.calendar/>
                <span>Calendar</span>
              </.command_item>
              <.command_item phx-value-name="global-map" phx-click="select_command">
                <.earth/>
                <span>Global map</span>
              </.command_item>
              <.command_item disabled={true}>
                <.calculator/>
                <span>Calculator</span>
              </.command_item>
            </.command_group>
            <.separator />
            <.command_group heading="Settings">
              <.command_item phx-value-name="profile" phx-click="select_command">
                <.user/>
                <span>Profile</span>
                <.command_shortcut>⌘P</.command_shortcut>
              </.command_item>
              <.command_item phx-value-name="billing" phx-click="select_command">
                <.credit_card/>
                <span>Billing</span>
                <.command_shortcut>⌘B</.command_shortcut>
              </.command_item>
              <.command_item value="settings" phx-click="select_command">
                <.settings/>
                <span>Settings</span>
                <.command_shortcut>⌘,</.command_shortcut>
              </.command_item>
            </.command_group>
          </.command_list>
        </.command_dialog>
        """,
        attributes: %{}
      }
    ]
  end
end
