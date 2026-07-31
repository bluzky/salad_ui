defmodule SaladUI.SwitchTest do
  use ComponentCase

  import SaladUI.Switch

  describe "Test Switch" do
    test "renders switch with value-derived checked state and accessibility attrs" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.switch id="notifications" name="notifications" value="true" />
        """)

      assert html =~ ~s(id="notifications")
      assert html =~ ~s(data-component="switch")
      assert html =~ ~s(data-state="checked")
      assert html =~ ~s(role="switch")
      assert html =~ ~s(aria-checked="true")
      assert html =~ ~s(<input type="hidden" name="notifications" value="false">)
      assert html =~ ~s(id="notifications-input")
      assert html =~ ~s(name="notifications")
      assert html =~ ~s(value="true")
      assert html =~ ~s(checked)

      for css_class <-
            ~w(switch-root inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0) do
        assert html =~ css_class
      end
    end

    test "renders disabled switch without hidden fallback input" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.switch id="disabled-switch" name="enabled" disabled />
        """)

      refute html =~ ~s(type="hidden" name="enabled")
      assert html =~ ~s(data-disabled)
      assert html =~ ~s(aria-checked="false")
      assert html =~ ~s(tabindex="-1")
      assert html =~ ~s(disabled)
    end
  end
end
