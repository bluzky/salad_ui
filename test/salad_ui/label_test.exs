defmodule SaladUI.LabelTest do
  use ComponentCase

  import SaladUI.Label

  describe "Test Label" do
    test "It should render label correctly" do
      assigns = %{}

      html =
        ~H"""
        <.label class="text-green-500">Send!</.label>
        """
        |> rendered_to_string()
        |> clean_string()

      for class <-
            ~w(text-green-500 font-medium leading-none text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70) do
        assert html =~ class
      end

      assert html =~ "Send!"
    end
  end
end
