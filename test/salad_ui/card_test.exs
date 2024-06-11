defmodule SaladUI.CardTest do
  use ComponentCase

  import SaladUI.Button
  import SaladUI.Card

  describe "Test Card" do
    test "It renders card header correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.card_header>The card header</.card_header>
        """)

      assert html =~ "The card header"

      for class <- ~w(flex flex-col space-y-1.5 p-6) do
        assert html =~ class
      end
    end

    test "It renders card title correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.card_title>Card title</.card_title>
        """)

      assert html =~ "Card title"

      for class <- ~w(text-2xl font-semibold leading-none tracking-tight) do
        assert html =~ class
      end
    end

    test "It renders card description correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.card_description>Card Description Body</.card_description>
        """)

      assert html =~ "Card Description Body"

      for class <- ~w(text-sm text-muted-foreground) do
        assert html =~ class
      end
    end

    test "It renders card content correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.card_content>Card Content available</.card_content>
        """)

      assert html =~ "Card Content available"

      for class <- ~w(p-6 pt-0) do
        assert html =~ class
      end
    end

    test "It renders card footer correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.card_footer>Card footer</.card_footer>
        """)

      assert html =~ "Card footer"

      for class <- ~w(flex items-center justify-between p-6 pt-0) do
        assert html =~ class
      end
    end

    test "It renders card correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.card>
          <.card_header>
            <.card_title>Card title</.card_title>
            
            <.card_description>Card subtitle</.card_description>
          </.card_header>
          
          <.card_content>
            Card text
          </.card_content>
          
          <.card_footer>
            <.button>Button</.button>
          </.card_footer>
        </.card>
        """)

      assert html =~ "Card title"
      assert html =~ "Card subtitle"
      assert html =~ "Card text"
      assert html =~ "<button"
      assert html =~ "Button"
    end
  end
end
