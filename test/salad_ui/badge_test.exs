defmodule SaladUI.BadgeTest do
  use ComponentCase

  import SaladUI.Badge

  describe "Test Badge" do
    test "It renders a badge default variant" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.badge>Badge</.badge>
        """)

      for class <-
            ~w(inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80) do
        assert html =~ class
      end

      assert html =~ "Badge"
    end

    test "It renders a badge with secondary variant" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.badge variant="secondary">Secondary</.badge>
        """)

      for class <- ~w(border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80) do
        assert html =~ class
      end
    end

    test "It renders a badge with the destructive variant" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.badge variant="destructive">Destructive</.badge>
        """)

      for class <- ~w(border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80) do
        assert html =~ class
      end

      assert html =~ "Destructive"
    end

    test "it renders a badge with the outlined variant" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.badge variant="outline">Outline</.badge>
        """)

      for class <- ~w(text-foreground) do
        assert html =~ class
      end

      assert html =~ "Outline"
    end
  end
end
