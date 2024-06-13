defmodule SaladUI.CheckboxTest do
  use ComponentCase

  import SaladUI.Checkbox

  describe "Test Checkbox" do
    test "It renders checkbox correctly" do
      assigns = %{form: [:remember_me]}

      html =
        rendered_to_string(~H"""
        <.checkbox class="!border-destructive" name="remember_me" value={true} />
        """)

      assert html =~ "id=\"remember_me\""
      assert html =~ "name=\"remember_me\""
      assert html =~ "value=\"true\" checked>"
      assert html =~ "<input type=\"hidden\" name=\"remember_me\" value=\"false\">"

      for css_class <-
            ~w(peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:text-primary-foreground) do
        assert html =~ css_class
      end
    end
  end
end
