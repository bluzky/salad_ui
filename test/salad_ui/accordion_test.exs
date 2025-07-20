defmodule SaladUI.AccordionTest do
  @moduledoc """
  This is test for each accordion function component
  """
  use ComponentCase

  import SaladUI.Accordion

  test "It renders accordion correctly" do
    assigns = %{}

    html =
      ~H"""
      <.accordion id="test-accordion" type="single">
        <.accordion_item value="item-1">
          <.accordion_trigger>
            Is it accessible?
          </.accordion_trigger>
          <.accordion_content>
            Yes. It adheres to the WAI-ARIA design pattern.
          </.accordion_content>
        </.accordion_item>
        <.accordion_item value="item-2">
          <.accordion_trigger>
            Is it styled?
          </.accordion_trigger>
          <.accordion_content>
            Yes. It comes with default styles that matches the other components' aesthetic.
          </.accordion_content>
        </.accordion_item>
        <.accordion_item value="item-3">
          <.accordion_trigger>
            Is it animated?
          </.accordion_trigger>
          <.accordion_content>
            Yes. It's animated by default, but you can disable it if you prefer.
          </.accordion_content>
        </.accordion_item>
      </.accordion>
      """
      |> rendered_to_string()
      |> clean_string()

    # Check for accordion root element with data attributes
    assert html =~ "id=\"test-accordion\""
    assert html =~ "data-component=\"accordion\""
    assert html =~ "phx-hook=\"SaladUI\""
    assert html =~ "data-part=\"root\""

    # Check for content
    assert html =~ "Is it accessible?"
    assert html =~ "Yes. It adheres to the WAI-ARIA design pattern."
    assert html =~ "Is it styled?"
    assert html =~ "Yes. It comes with default styles that matches the other components' aesthetic."
    assert html =~ "Is it animated?"
    assert html =~ "Yes. It's animated by default, but you can disable it if you prefer."

    # Check for data attributes on items
    assert html =~ "data-part=\"item\""
    assert html =~ "value=\"item-1\""
    assert html =~ "value=\"item-2\""
    assert html =~ "value=\"item-3\""
  end

  describe "accordion/1" do
    test "renders the accordion container with the provided class" do
      html =
        render_component(&accordion/1, %{
          id: "test-accordion",
          class: "custom-class",
          inner_block: []
        })

      assert html =~ ~s(id="test-accordion")
      assert html =~ ~s(class="w-full custom-class")
      assert html =~ ~s(data-component="accordion")
      assert html =~ ~s(phx-hook="SaladUI")
    end
  end

  describe "accordion_item/1" do
    test "renders the accordion item with the provided class" do
      html =
        render_component(&accordion_item/1, %{
          value: "test-item",
          class: "custom-class",
          inner_block: []
        })

      assert html =~ ~s(data-part="item")
      assert html =~ ~s(value="test-item")
      assert html =~ ~s(border-b)
      assert html =~ ~s(border-border)
      assert html =~ ~s(custom-class)
    end
  end

  describe "accordion_trigger/1" do
    test "renders the accordion trigger with the provided class" do
      html =
        render_component(&accordion_trigger/1, %{
          class: "custom-class",
          inner_block: []
        })

      assert html =~ ~s(data-part="item-trigger")
      assert html =~ ~s(type="button")

      # Check for expected classes
      for class <-
            ~w(flex w-full justify-between py-4 font-medium transition-all hover:underline text-sm custom-class) do
        assert html =~ class
      end

      # Check for the icon
      assert html =~ ~s(<svg)
      assert html =~ ~s(class="h-4 w-4 shrink-0 transition-transform duration-200")
    end
  end

  describe "accordion_content/1" do
    test "renders the accordion content with the provided class" do
      html =
        render_component(&accordion_content/1, %{
          class: "custom-class",
          inner_block: []
        })

      assert html =~ ~s(data-part="item-content")
      assert html =~ ~s(hidden)

      # Check for expected classes
      for class <-
            ~w(overflow-hidden text-sm custom-class) do
        assert html =~ class
      end
    end
  end
end
