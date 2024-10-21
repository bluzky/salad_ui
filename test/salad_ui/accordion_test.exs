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
      <.accordion>
        <.accordion_item>
          <.accordion_trigger group="exclusive">
            Is it accessible?
          </.accordion_trigger>
          <.accordion_content>
            Yes. It adheres to the WAI-ARIA design pattern.
          </.accordion_content>
        </.accordion_item>
        <.accordion_item>
          <.accordion_trigger group="exclusive">
            Is it styled?
          </.accordion_trigger>
          <.accordion_content>
            Yes. It comes with default styles that matches the other components' aesthetic.
          </.accordion_content>
        </.accordion_item>
        <.accordion_item>
          <.accordion_trigger group="exclusive">
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

    assert html =~
             "<div class=\"\">"

    assert html =~
             "<div class=\"border-b\">"

    assert html =~
             "Is it accessible?"

    assert html =~
             "Yes. It adheres to the WAI-ARIA design pattern."

    assert html =~
             "Is it styled?"

    assert html =~
             "Yes. It comes with default styles that matches the other components' aesthetic."

    assert html =~
             "Is it animated?"

    assert html =~
             "Yes. It's animated by default, but you can disable it if you prefer."
  end

  describe "accordion/1" do
    test "renders the accordion container with the provided name" do
      html =
        render_component(&accordion/1, %{
          class: "custom-class",
          inner_block: []
        })

      assert html =~ ~s(<div class="custom-class">)
    end
  end

  describe "accordion_item/1" do
    test "renders the accordion item with the provided class" do
      html =
        render_component(&accordion_item/1, %{
          class: "custom-class",
          inner_block: []
        })

      assert html =~ ~s(<div class="border-b custom-class">)
    end
  end

  describe "accordion_trigger/1" do
    test "renders the accordion trigger with the provided group" do
      html =
        render_component(&accordion_trigger/1, %{
          group: "my-group",
          class: "custom-class",
          inner_block: []
        })

      assert html =~ ~s(name="my-group")

      assert html =~
               ~s(class="flex py-4 transition-all items-center justify-between flex-1 font-medium hover:underline custom-class")
    end
  end

  describe "accordion_content/1" do
    test "renders the accordion content with the provided class" do
      html =
        render_component(&accordion_content/1, %{
          class: "custom-class",
          inner_block: []
        })

      assert html =~
               ~s(<div class="text-sm overflow-hidden grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 peer-open/accordion:grid-rows-[1fr]">)

      assert html =~ ~s(<div class="pt-0 pb-4 custom-class">)
    end
  end
end
