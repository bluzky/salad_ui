defmodule SaladUi.ProgressTest do
  use ComponentCase

  import SaladUI.Progress

  describe "Test Progress" do
    test "IT renders progress component correctly" do
      assigns = %{}

      html =
        ~H"""
        <.progress class="w-[60%]" value={20} />
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "<div class=\"h-full w-full flex-1 bg-primary transition-all\""
      assert html =~ "<div class=\"relative rounded-full bg-secondary overflow-hidden w-[60%]"
      assert html =~ "style=\"transform: translateX(-80%)\"></div></div>"
    end
  end
end
