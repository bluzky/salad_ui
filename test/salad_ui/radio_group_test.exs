defmodule SaladUI.RadioGroupTest do
  use ComponentCase

  import SaladUI.Label
  import SaladUI.RadioGroup

  describe "radio_group/1" do
    test "renders name in client options and passes aria label" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.radio_group id="plan" name="subscription" value="monthly" aria-label="Subscription">
          <.radio_group_item id="monthly" value="monthly" />
          <.radio_group_item id="yearly" value="yearly" />
        </.radio_group>
        """)

      assert html =~ ~s(aria-label="Subscription")
      assert html =~ ~s(&quot;name&quot;:&quot;subscription&quot;)
      assert html =~ ~s(&quot;initialValue&quot;:&quot;monthly&quot;)
    end
  end

  describe "radio_group_item/1" do
    test "renders native radio for label association" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <div>
          <.radio_group_item id="monthly" value="monthly" />
          <.label for="monthly">Monthly</.label>
        </div>
        """)

      assert html =~ ~s(<input type="radio" id="monthly" value="monthly")
      assert html =~ ~s(<label)
      assert html =~ ~s(for="monthly")
    end
  end
end
