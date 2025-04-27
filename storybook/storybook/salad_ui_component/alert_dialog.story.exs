defmodule Storybook.SaladUIComponents.AlertDialog do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladUI.AlertDialog

  def function, do: &AlertDialog.alert_dialog/1

  def imports,
    do: [
      {SaladUI.AlertDialog,
       [
         alert_dialog_trigger: 1,
         alert_dialog_content: 1,
         alert_dialog_header: 1,
         alert_dialog_title: 1,
         alert_dialog_description: 1,
         alert_dialog_footer: 1,
         alert_dialog_cancel: 1,
         alert_dialog_action: 1
       ]},
      {SaladUI.Button, [button: 1]}
    ]

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "alert-dialog-example"},
        slots: [
          """
          <.alert_dialog_trigger>
            <.button variant="outline">Show Alert Dialog</.button>
          </.alert_dialog_trigger>
          <.alert_dialog_content>
            <.alert_dialog_header>
              <.alert_dialog_title>Are you absolutely sure?</.alert_dialog_title>
              <.alert_dialog_description>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </.alert_dialog_description>
            </.alert_dialog_header>
            <.alert_dialog_footer>
              <.alert_dialog_cancel>Cancel</.alert_dialog_cancel>
              <.alert_dialog_action>Continue</.alert_dialog_action>
            </.alert_dialog_footer>
          </.alert_dialog_content>
          """
        ]
      },
      %Variation{
        id: :destructive,
        attributes: %{id: "alert-dialog-destructive"},
        slots: [
          """
          <.alert_dialog_trigger>
            <.button variant="destructive">Delete Account</.button>
          </.alert_dialog_trigger>
          <.alert_dialog_content>
            <.alert_dialog_header>
              <.alert_dialog_title>Delete Account</.alert_dialog_title>
              <.alert_dialog_description>
                Are you sure you want to delete your account? All of your data
                will be permanently removed. This action cannot be undone.
              </.alert_dialog_description>
            </.alert_dialog_header>
            <.alert_dialog_footer>
              <.alert_dialog_cancel>Cancel</.alert_dialog_cancel>
              <.alert_dialog_action variant="destructive">Delete</.alert_dialog_action>
            </.alert_dialog_footer>
          </.alert_dialog_content>
          """
        ]
      },
      %Variation{
        id: :with_form,
        attributes: %{
          id: "alert-dialog-with-form",
          class: "max-w-md"
        },
        slots: [
          """
          <.alert_dialog_trigger>
            <.button>Subscribe to Newsletter</.button>
          </.alert_dialog_trigger>
          <.alert_dialog_content>
            <.alert_dialog_header>
              <.alert_dialog_title>Subscribe to Newsletter</.alert_dialog_title>
              <.alert_dialog_description>
                Enter your email below to receive our weekly newsletter with the latest updates.
              </.alert_dialog_description>
            </.alert_dialog_header>
            <div class="grid gap-4 py-4">
              <div class="grid grid-cols-4 items-center gap-4">
                <label for="email" class="text-right text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  class="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <.alert_dialog_footer>
              <.alert_dialog_cancel>Cancel</.alert_dialog_cancel>
              <.alert_dialog_action>Subscribe</.alert_dialog_action>
            </.alert_dialog_footer>
          </.alert_dialog_content>
          """
        ]
      }
    ]
  end
end
