defmodule SaladUI.CollapsibleTest do
  use ComponentCase

  import SaladUI.Collapsible

  describe "collapsible/1" do
    test "renders collapsible component with required attributes" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible id="test-collapsible" open={false}>
          Test Content
        </.collapsible>
        """)

      assert html =~ ~s(id="test-collapsible")
      assert html =~ ~s(phx-toggle-collapsible)
      assert html =~ "Test Content"
    end

    test "applies custom class" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible id="test-collapsible" class="custom-class">
          Test Content
        </.collapsible>
        """)

      for class <- ~w(inline-block relative custom-class) do
        assert html =~ class
      end
    end
  end

  describe "collapsible_trigger/1" do
    test "renders trigger with click handler" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible id="test-collapsible">
          <.collapsible_trigger>
            Click me
          </.collapsible_trigger>
        </.collapsible>
        """)

      assert html =~ "test-collapsible"
      assert html =~ "Click me"
    end

    test "applies custom class to trigger" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible_trigger
          class="custom-trigger-class"
        >
          Click me
        </.collapsible_trigger>
        """)

      assert html =~ ~s(class="custom-trigger-class")
    end
  end

  describe "collapsible_content/1" do
    test "renders content with default classes" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible_content>
          Hidden content
        </.collapsible_content>
        """)

      for class <- ~w(collapsible-content hidden transition-all duration-200 ease-in-out) do
        assert html =~ class
      end

      assert html =~ "Hidden content"
    end

    test "applies custom class to content" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible_content class="custom-content-class">
          Hidden content
        </.collapsible_content>
        """)

      assert html =~ "custom-content-class"
      assert html =~ "Hidden content"
    end

    test "accepts and renders additional HTML attributes" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible_content data-test="test-content">
          Content
        </.collapsible_content>
        """)

      assert html =~ ~s(data-test="test-content")
    end
  end

  describe "toggle_collapsible/2" do
    test "returns JavaScript commands for toggling content" do
      js = toggle_collapsible(%Phoenix.LiveView.JS{}, "test-collapsible")

      assert js.ops == [
               [
                 "toggle",
                 %{
                   to: "#test-collapsible .collapsible-content",
                   ins: [["ease-out", "duration-200"], ["opacity-0"], ["opacity-100"]],
                   outs: [["ease-out"], ["opacity-100"], ["opacity-70"]],
                   time: 200
                 }
               ],
               ["toggle_attr", %{attr: ["data-state", "open", "closed"], to: "#test-collapsible"}]
             ]
    end
  end

  test "integration: renders complete collapsible with trigger and content" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.collapsible :let={builder} id="test-collapsible" open={false}>
        <.collapsible_trigger builder={builder}>
          <button>Toggle</button>
        </.collapsible_trigger>
        <.collapsible_content>
          <p>Hidden Content</p>
        </.collapsible_content>
      </.collapsible>
      """)

    assert html =~ "Toggle"
    assert html =~ "Hidden Content"
    assert html =~ "collapsible-content"
    assert html =~ ~s(phx-toggle-collapsible)
  end
end
