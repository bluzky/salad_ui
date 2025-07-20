defmodule SaladUI.ButtonTest do
  use ComponentCase

  import SaladUI.Button

  describe "Test Button" do
    test "It renders default button correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.button>Send!</.button>
        """)

      assert html =~ "Send!"
      assert html =~ "<button"
      assert html =~ "class="

      # Check for all expected classes including the new phx-submit-loading class
      for class <-
            ~w(phx-submit-loading:opacity-75 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90) do
        assert html =~ class
      end
    end

    test "It renders button with additional css class correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.button phx-click="go" class="ml-2-additional-class">Send!</.button>
        """)

      assert html =~ "Send!"
      assert html =~ "phx-click=\"go\""
      assert html =~ "ml-2-additional-class"
    end

    test "It renders destructive button correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.button phx-click="go" variant="destructive">Destructive act!</.button>
        """)

      assert html =~ "phx-click=\"go\""
      assert html =~ "Destructive act"

      for class <- ~w(bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90) do
        assert html =~ class
      end
    end

    test "It renders outline button correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.button phx-click="go" variant="outline">Outline act!</.button>
        """)

      assert html =~ "phx-click=\"go\""
      assert html =~ "Outline act"

      for class <- ~w(border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground) do
        assert html =~ class
      end
    end

    test "It renders secondary button correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.button phx-click="go" variant="secondary">secondary act!</.button>
        """)

      assert html =~ "phx-click=\"go\""
      assert html =~ "secondary act"

      for class <- ~w(bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80) do
        assert html =~ class
      end
    end

    test "It renders ghost button correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.button phx-click="go" variant="ghost">ghost act!</.button>
        """)

      assert html =~ "phx-click=\"go\""
      assert html =~ "ghost act"

      for class <- ~w(hover:bg-accent hover:text-accent-foreground) do
        assert html =~ class
      end
    end

    test "It renders link button correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.button phx-click="go" variant="link">link act!</.button>
        """)

      assert html =~ "phx-click=\"go\""
      assert html =~ "link act"

      for class <- ~w(text-primary underline-offset-4 hover:underline) do
        assert html =~ class
      end
    end
  end
end
