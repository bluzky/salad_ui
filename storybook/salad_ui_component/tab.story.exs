defmodule Storybook.SaladUIComponents.Tab do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladUI.Button
  alias SaladUI.Card
  alias SaladUI.Input
  alias SaladUI.Label
  alias SaladUI.Tabs

  def function, do: &Tabs.tabs/1

  def layout, do: :one_column

  def imports,
    do: [
      {Card, [card: 1, card_header: 1, card_title: 1, card_description: 1, card_content: 1, card_footer: 1]},
      {Button, [button: 1]},
      {Input, [input: 1]},
      {Label, [label: 1]},
      {Tabs, [tabs_list: 1, tabs_trigger: 1, tabs_content: 1]}
    ]

  def variations do
    [
      %Variation{
        id: :tab,
        description: "Tab component with trigger and content panels",
        attributes: %{default: "account", id: "settings", class: "w-[400px]"},
        slots: [
          """
          <.tabs_list class="grid w-full grid-cols-2">
            <.tabs_trigger value="account">Account</.tabs_trigger>
            <.tabs_trigger value="password">Password</.tabs_trigger>
          </.tabs_list>
          <.tabs_content value="account">
            <.card>
              <.card_header>
                <.card_title>Account</.card_title>
                <.card_description>
                  Make changes to your account here. Click save when you're done.
                </.card_description>
              </.card_header>
              <.card_content class="space-y-2">
                <div class="space-y-1">
                  <.label html-for="name">Name</.label>
                  <.input id="name" default-value="Pedro Duarte" />
                </div>
                <div class="space-y-1">
                  <.label html-for="username">Username</.label>
                  <.input id="username" default-value="@peduarte" />
                </div>
              </.card_content>
              <.card_footer>
                <.button>Save changes</.button>
              </.card_footer>
            </.card>
          </.tabs_content>
          <.tabs_content value="password">
            <.card>
              <.card_header>
                <.card_title>Password</.card_title>
                <.card_description>
                  Change your password here. After saving, you'll be logged out.
                </.card_description>
              </.card_header>
              <.card_content class="space-y-2">
                <div class="space-y-1">
                  <.label html-for="current">Current password</.label>
                  <.input id="current" type="password" />
                </div>
                <div class="space-y-1">
                  <.label html-for="new">New password</.label>
                  <.input id="new" type="password" />
                </div>
              </.card_content>
              <.card_footer>
                <.button>Save password</.button>
              </.card_footer>
            </.card>
          </.tabs_content>
          """
        ]
      },
      %Variation{
        id: :tabs_with_event,
        description: "Tabs with event handling",
        attributes: %{
          default: "tab1",
          id: "event-tabs",
          on_tab_changed: JS.push("tab_changed", value: %{tab: "_value_"})
        },
        slots: [
          """
          <.tabs_list>
            <.tabs_trigger value="tab1">First Tab</.tabs_trigger>
            <.tabs_trigger value="tab2">Second Tab</.tabs_trigger>
            <.tabs_trigger value="tab3">Third Tab</.tabs_trigger>
          </.tabs_list>
          <.tabs_content value="tab1">
            <div class="p-4 bg-accent/10 rounded-md mt-2">
              Content for the first tab
            </div>
          </.tabs_content>
          <.tabs_content value="tab2">
            <div class="p-4 bg-accent/10 rounded-md mt-2">
              Content for the second tab
            </div>
          </.tabs_content>
          <.tabs_content value="tab3">
            <div class="p-4 bg-accent/10 rounded-md mt-2">
              Content for the third tab
            </div>
          </.tabs_content>
          """
        ]
      },
      %Variation{
        id: :disabled_tabs,
        description: "Tabs with disabled options",
        attributes: %{default: "enabled1", id: "disabled-tabs"},
        slots: [
          """
          <.tabs_list>
            <.tabs_trigger value="enabled1">Enabled Tab</.tabs_trigger>
            <.tabs_trigger value="disabled1" disabled>Disabled Tab</.tabs_trigger>
            <.tabs_trigger value="enabled2">Another Enabled Tab</.tabs_trigger>
          </.tabs_list>
          <.tabs_content value="enabled1">
            <div class="p-4 bg-muted mt-2 rounded-md">
              This tab is enabled and accessible.
            </div>
          </.tabs_content>
          <.tabs_content value="disabled1">
            <div class="p-4 bg-muted mt-2 rounded-md">
              This content belongs to a disabled tab and shouldn't be visible.
            </div>
          </.tabs_content>
          <.tabs_content value="enabled2">
            <div class="p-4 bg-muted mt-2 rounded-md">
              This is another enabled tab's content.
            </div>
          </.tabs_content>
          """
        ]
      }
    ]
  end
end
