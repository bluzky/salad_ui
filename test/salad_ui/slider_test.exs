defmodule SaladUI.SliderTest do
  use ComponentCase

  import SaladUI.Slider

  describe "slider/1" do
    test "renders one slider root with numeric data and hidden input" do
      assigns = %{}

      html =
        ~H"""
        <.slider id="volume" name="volume" min={10} max={50} step={7} value="32" />
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ ~s(id="volume")
      assert html =~ ~s(data-component="slider")
      assert html =~ ~s(data-part="root")
      assert html =~ ~s(data-value="31")
      assert html =~ ~s(<input type="hidden" name="volume" value="31">)
      refute html =~ ~s(data-disabled="false")
      refute html =~ ~s(class="relative flex w-full touch-none select-none items-center" data-part="root")
    end

    test "preserves exact max boundary when step does not divide range" do
      assigns = %{}

      html =
        ~H"""
        <.slider id="boundary" min={0} max={10} step={3} value={10} />
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ ~s(data-value="10")
      assert html =~ ~s(<input type="hidden" value="10">)
    end

    test "renders disabled state without invalid disabled div attribute" do
      assigns = %{}

      html =
        ~H"""
        <.slider id="disabled-volume" disabled value={20} />
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ ~s(tabindex="-1")
      assert html =~ ~s(aria-disabled="true")
      assert html =~ ~s(data-disabled="true")
      assert html =~ "pointer-events-none"
      assert html =~ "opacity-50"
      refute html =~ ~s(<div disabled)
    end
  end
end
