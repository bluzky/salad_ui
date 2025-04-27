defmodule Storybook.SaladUIComponents.Table do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladUI.Table

  def function, do: &Table.table/1
  def layout, do: :one_column

  def imports,
    do: [{Table, [table_caption: 1, table_header: 1, table_row: 1, table_head: 1, table_body: 1, table_cell: 1]}]

  def variations do
    [
      %Variation{
        id: :tab,
        description: "",
        template: """
        <.table>
        <.table_caption>Your task list.</.table_caption>
        <.table_header>
         <.table_row>
           <.table_head class="w-[100px]">id</.table_head>
           <.table_head>Title</.table_head>
           <.table_head>Status</.table_head>
           <.table_head class="text-right">Action</.table_head>
         </.table_row>
        </.table_header>
        <.table_body>
         <.table_row >
           <.table_cell class="font-medium">1</.table_cell>
           <.table_cell>Buy veg Pizzas</.table_cell>
           <.table_cell>Green meal</.table_cell>
           <.table_cell class="text-right">
             <.link
               navigate={"/content/post"}
               class="btn-action"
             >
                Edit
             </.link>

             <.link
               phx-click={JS.push("delete", value: %{id: 1})}
               data-confirm="Are you sure?"
               class="btn-action"
             >
                Delete
             </.link>
           </.table_cell>
         </.table_row>
         <.table_row >
           <.table_cell class="font-medium">1</.table_cell>
           <.table_cell>Buy 3 apples</.table_cell>
           <.table_cell>Green meal</.table_cell>
           <.table_cell class="text-right">
             <.link
               navigate={"/content/post"}
               class="btn-action"
             >
                Edit
             </.link>

             <.link
               phx-click={JS.push("delete", value: %{id: 2})}
               data-confirm="Are you sure?"
               class="btn-action"
             >
                Delete
             </.link>
           </.table_cell>
         </.table_row>
        </.table_body>
        </.table>
        """,
        attributes: %{}
      }
    ]
  end
end
