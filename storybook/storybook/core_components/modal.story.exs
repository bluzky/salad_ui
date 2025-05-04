defmodule Storybook.CoreComponents.Modal do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladStorybookWeb.CoreComponents
  alias SaladUI.Dialog

  def function, do: &CoreComponents.modal/1

  def imports,
    do: [
      {CoreComponents, [button: 1]},
      {Dialog, [dialog_header: 1, dialog_title: 1, dialog_description: 1, dialog_footer: 1]},
      {SaladUI.JS, [dispatch_command: 3]}
    ]

  def template do
    """
    <.button phx-click={dispatch_command(%JS{}, "open", to: "#modal-single-default")} psb-code-hidden>
      Open modal
    </.button>
    <.psb-variation/>
    """
  end

  def variations do
    [
      %Variation{
        id: :default,
        slots: [
          """
          Modal body
          <.dialog_footer>
              <.button type="submit" data-action="close">Cancel</.button>
          </.dialog_footer>

          """
        ]
      }
    ]
  end
end
