defmodule Storybook.SaladUIComponents.Card do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladUI.Button
  alias SaladUI.Card
  alias SaladUI.Input
  alias SaladUI.Label

  def function, do: &Card.card/1
  def layout, do: :one_column

  def imports,
    do: [
      {Card, [card_header: 1, card_title: 1, card_description: 1, card_content: 1, card_footer: 1]},
      {Button, [button: 1]},
      {Input, [input: 1]},
      {Label, [label: 1]}
    ]

  def variations do
    [
      %Variation{
        id: :card,
        template: """
        <.card class="w-[350px]">
          <.card_header>
            <.card_title>Create your project</.card_title>
            <.card_description>Deploy your new project in one-click.</.card_description>
          </.card_header>
          <.card_content>
            <form>
              <div class="grid w-full items-center gap-4">
                <div class="flex flex-col space-y-1.5">
                  <.label html-for="name">Name</.label>
                  <.input id="name" placeholder="Name of your project" />
                </div>
              </div>
            </form>
          </.card_content>
          <.card_footer class="flex justify-between">
            <.button variant="outline">Cancel</.button>
            <.button>Deploy</.button>
          </.card_footer>
        </.card>
        """,
        attributes: %{}
      }
    ]
  end
end
