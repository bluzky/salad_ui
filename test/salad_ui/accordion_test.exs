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
      <.accordion id="faq-accordion">
        <.accordion_item value="accessible">
          <.accordion_trigger>
            Is it accessible?
          </.accordion_trigger>
          <.accordion_content>
            Yes. It adheres to the WAI-ARIA design pattern.
          </.accordion_content>
        </.accordion_item>
        <.accordion_item value="styled">
          <.accordion_trigger>
            Is it styled?
          </.accordion_trigger>
          <.accordion_content>
            Yes. It comes with default styles that matches the other components' aesthetic.
          </.accordion_content>
        </.accordion_item>
        <.accordion_item value="animated">
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

    assert html =~ ~s(id="faq-accordion")
    assert html =~ ~s(data-component="accordion")
    assert html =~ ~s(data-part="root")
    assert html =~ ~s(data-value="accessible")
    assert html =~ ~s(data-value="styled")
    assert html =~ ~s(data-value="animated")
    assert html =~ "Is it accessible?"
    assert html =~ "Yes. It adheres to the WAI-ARIA design pattern."
    assert html =~ "Is it styled?"
    assert html =~ "Yes. It comes with default styles that matches the other components' aesthetic."
    assert html =~ "Is it animated?"
    assert html =~ "Yes. It's animated by default, but you can disable it if you prefer."
  end

  describe "accordion/1" do
    test "renders the accordion container with the provided id and class" do
      html =
        render_component(&accordion/1, %{
          id: "my-accordion",
          class: "custom-class",
          inner_block: []
        })

      assert html =~ ~s(id="my-accordion")
      assert html =~ ~s(data-component="accordion")

      for class <- ~w(w-full custom-class) do
        assert html =~ class
      end
    end
  end

  describe "accordion_item/1" do
    test "renders the accordion item with the provided value and class" do
      html =
        render_component(&accordion_item/1, %{
          value: "item-1",
          class: "custom-class",
          inner_block: []
        })

      assert html =~ ~s(data-part="item")
      assert html =~ ~s(data-value="item-1")

      for class <- ~w(border-b border-border custom-class) do
        assert html =~ class
      end
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
      assert html =~ ~s(aria-expanded="false")

      for class <- ~w(flex w-full justify-between py-4 font-medium transition-all hover:underline text-sm custom-class) do
        assert html =~ class
      end
    end
  end

  describe "accordion_content/1" do
    test "renders the accordion content with the provided class" do
      html =
        render_component(&accordion_content/1, %{
          class: "custom-class",
          inner_block: []
        })

      for class <-
            ~w(text-sm overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down custom-class) do
        assert html =~ class
      end
    end
  end
end
