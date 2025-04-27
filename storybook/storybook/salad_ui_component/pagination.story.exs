defmodule Storybook.SaladUIComponents.Pagination do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladUI.Pagination

  def function, do: &Pagination.pagination/1

  def imports,
    do: [
      {Pagination,
       [
         pagination_content: 1,
         pagination_item: 1,
         pagination_link: 1,
         pagination_ellipsis: 1,
         pagination_next: 1,
         pagination_previous: 1
       ]}
    ]

  def variations do
    [
      %Variation{
        id: :pagination,
        template: """
        <.pagination>
          <.pagination_content>
            <.pagination_item>
              <.pagination_previous href="#" />
            </.pagination_item>
            <.pagination_item>
              <.pagination_link href="">1</.pagination_link>
            </.pagination_item>
            <.pagination_item>
              <.pagination_link href="" is-active="true">2</.pagination_link>
            </.pagination_item>
            <.pagination_item>
              <.pagination_link href="">3</.pagination_link>
            </.pagination_item>
            <.pagination_item>
              <.pagination_ellipsis />
            </.pagination_item>
            <.pagination_item>
              <.pagination_next href="#" />
            </.pagination_item>
          </.pagination_content>
        </.pagination>
        """,
        attributes: %{}
      }
    ]
  end
end
