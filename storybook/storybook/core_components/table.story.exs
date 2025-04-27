defmodule Storybook.CoreComponents.Table do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladStorybookWeb.CoreComponents

  def function, do: &CoreComponents.table/1
  def aliases, do: [Storybook.CoreComponents.Table.User]
  def imports, do: [{CoreComponents, [button: 1]}]

  def variations do
    [
      %Variation{
        id: :table,
        attributes: %{
          rows:
            {:eval,
             ~s"""
             [
               %User{id: 1, username: "jose"},
               %User{id: 2, username: "chris"}
             ]
             """}
        },
        slots: [
          """
          <:col :let={user} label="Id">
            <%= user.id %>
          </:col>
          """,
          """
          <:col :let={user} label="User name">
            <%= user.username %>
          </:col>
          """,
          """
          <:action><.button size="sm" variant="outline" class="mr-1">Edit</.button></:action>
          """
        ]
      }
    ]
  end
end

defmodule Storybook.CoreComponents.Table.User do
  @moduledoc false
  defstruct [:id, :username]
end
