defmodule Storybook.SaladUIComponents.Dialog do
  @moduledoc false
  use PhoenixStorybook.Story, :component
  import SaladUI.LiveView

  alias SaladUI.Button
  alias SaladUI.Dialog
  alias SaladUI.Input
  alias SaladUI.Label

  def function, do: &Dialog.dialog/1

  def imports,
    do: [
      {Button, [button: 1]},
      {Input, [input: 1]},
      {Label, [label: 1]},
      {Dialog, [dialog_header: 1, dialog_title: 1, dialog_description: 1, dialog_footer: 1, dialog_content: 1, dialog_trigger: 1]}
    ]

  def variations do
    [
      %Variation{
        id: :dialog,
        slots: ["""

        <.dialog_trigger>
                <.button>
        Open modal
        </.button>
        </.dialog_trigger>
        <.dialog_content class="sm:max-w-[425px]">
            <.dialog_header>
              <.dialog_title>Edit profile</.dialog_title>
              <.dialog_description>
                Make changes to your profile here click save when you're done
              </.dialog_description>
            </.dialog_header>
            <div class="grid gap-4 py-4">
              <div class="grid grid-cols-4 items-center gap-4">
                <.label html-for="name" class="text-right">
                  Name
                </.label>
                <.input id="name" value="Dzung Nguyen" class="col-span-3" />
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <.label html-for="username" class="text-right">
                  Username
                </.label>
                <.input id="username" value="@bluzky" class="col-span-3" />
              </div>
            </div>
            <.dialog_footer>
              <.button type="submit">save changes</.button>
            </.dialog_footer>
        </.dialog_content>
        """],
        attributes: %{}
      }
    ]
  end
end
