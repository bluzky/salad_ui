defmodule Storybook.CoreComponents.Modal do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladStorybookWeb.CoreComponents
  alias SaladUI.Dialog

  def function, do: &CoreComponents.modal/1

  def imports,
    do: [
      {CoreComponents, [button: 1, hide_modal: 1, show_modal: 1]},
      {Dialog, [dialog_header: 1, dialog_title: 1, dialog_description: 1, dialog_footer: 1]}
    ]

  def template do
    """
    <.button phx-click={show_modal(":variation_id")} psb-code-hidden>
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
              <.button type="submit">Cancel</.button>
          </.dialog_footer>

          """
        ]
      }
    ]
  end
end
