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
      assert html =~ ~s(data-component="collapsible")
      assert html =~ ~s(data-part="root")
      assert html =~ ~s(data-state="closed")
      assert html =~ ~s(phx-hook="SaladUI")
      assert html =~ "Test Content"
    end

    test "sets initial data-state to open when open is true" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible id="test-collapsible" open>
          Test Content
        </.collapsible>
        """)

      assert html =~ ~s(data-state="open")
    end

    test "encodes open state and animation config into data-options" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible id="test-collapsible" open>
          Test Content
        </.collapsible>
        """)

      assert html =~ ~s(&quot;open&quot;:true)
      assert html =~ ~s(&quot;animations&quot;)
      assert html =~ ~s(&quot;closed_to_open&quot;)
      assert html =~ ~s(&quot;open_to_closed&quot;)
    end

    test "encodes on-open/on-close handlers into data-event-mappings" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible id="test-collapsible" on-open="opened" on-close="closed">
          Test Content
        </.collapsible>
        """)

      assert html =~ ~s(&quot;open&quot;:&quot;opened&quot;)
      assert html =~ ~s(&quot;close&quot;:&quot;closed&quot;)
    end

    test "applies custom class" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible id="test-collapsible" class="custom-class">
          Test Content
        </.collapsible>
        """)

      for class <- ~w(relative custom-class) do
        assert html =~ class
      end
    end
  end

  describe "collapsible_trigger/1" do
    test "renders trigger with data-action and accessibility attributes" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible id="test-collapsible">
          <.collapsible_trigger>
            Click me
          </.collapsible_trigger>
        </.collapsible>
        """)

      assert html =~ ~s(data-part="trigger")
      assert html =~ ~s(data-action="toggle")
      assert html =~ ~s(role="button")
      assert html =~ ~s(tabindex="0")
      assert html =~ "Click me"
    end

    test "renders as a different tag when :as is provided" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible_trigger as="button">
          Click me
        </.collapsible_trigger>
        """)

      assert html =~ ~s(<button)
    end

    test "applies custom class to trigger" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible_trigger class="custom-trigger-class">
          Click me
        </.collapsible_trigger>
        """)

      assert html =~ "cursor-pointer custom-trigger-class"
    end
  end

  describe "collapsible_content/1" do
    test "renders content hidden by default with transition classes" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.collapsible_content>
          Hidden content
        </.collapsible_content>
        """)

      assert html =~ ~s(data-part="content")
      assert html =~ "hidden"

      for class <- ~w(transition-all duration-200 ease-in-out) do
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

  test "integration: renders complete collapsible with trigger and content" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.collapsible id="test-collapsible" open={false}>
        <.collapsible_trigger>
          <button>Toggle</button>
        </.collapsible_trigger>
        <.collapsible_content>
          <p>Hidden Content</p>
        </.collapsible_content>
      </.collapsible>
      """)

    assert html =~ "Toggle"
    assert html =~ "Hidden Content"
    assert html =~ ~s(data-part="trigger")
    assert html =~ ~s(data-part="content")
    assert html =~ ~s(data-action="toggle")
  end
end
