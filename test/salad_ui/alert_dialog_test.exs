defmodule SaladUI.AlertDialogTest do
  use ComponentCase

  import SaladUI.AlertDialog

  # Helper function to set up assigns
  defp assign_builder(assigns \\ %{}) do
    assigns
    # |> Enum.into(%{
    #   __changed__: nil,
    #   flash: %{},
    #   socket: %Phoenix.LiveView.Socket{}
    # })
  end

  describe "alert_dialog/1" do
    test "renders with required attributes" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog id="test-dialog">
          <div>Content</div>
        </.alert_dialog>
        """)

      assert html =~ ~s(id="test-dialog")
      assert html =~ "Content"
      assert html =~ ~s(class="inline-block relative")
    end

    test "renders with open state" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog id="test-dialog" open={true}>
          <div>Content</div>
        </.alert_dialog>
        """)

      assert html =~ ~s(id="test-dialog")
      assert html =~ "Content"
    end

    test "raises when missing required inner_block" do
      assigns = assign_builder()

      assert_raise KeyError, ~r/key :inner_block not found/, fn ->
        rendered_to_string(~H"""
        <.alert_dialog id="test-dialog" />
        """)
      end
    end
  end

  describe "alert_dialog_trigger/1" do
    test "renders trigger with builder" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_trigger builder={%{id: "test-dialog"}}>
          <button>Open Dialog</button>
        </.alert_dialog_trigger>
        """)

      assert html =~ "Open Dialog"
      assert html =~ ~s(phx-click)
    end

    test "renders with custom class" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_trigger builder={%{id: "test-dialog"}} class="custom-class">
          <button>Open Dialog</button>
        </.alert_dialog_trigger>
        """)

      assert html =~ "custom-class"
    end

    test "raises when missing required builder" do
      assigns = assign_builder()

      assert_raise KeyError, ~r/key :builder not found/, fn ->
        rendered_to_string(~H"""
        <.alert_dialog_trigger>
          <button>Open Dialog</button>
        </.alert_dialog_trigger>
        """)
      end
    end
  end

  describe "alert_dialog_content/1" do
    test "renders content with closed state by default" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_content builder={%{open: false}}>
          <div>Dialog Content</div>
        </.alert_dialog_content>
        """)

      assert html =~ ~s(data-state="closed")
      assert html =~ "Dialog Content"
      assert html =~ "alert-dialog-content"
    end

    test "renders content with open state" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_content builder={%{open: true}}>
          <div>Dialog Content</div>
        </.alert_dialog_content>
        """)

      assert html =~ ~s(data-state="open")
    end

    test "renders with custom class" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_content builder={%{open: false}} class="custom-class">
          <div>Dialog Content</div>
        </.alert_dialog_content>
        """)

      assert html =~ "custom-class"
    end
  end

  describe "alert_dialog_header/1" do
    test "renders header with content" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_header>
          <h2>Header Content</h2>
        </.alert_dialog_header>
        """)

      assert html =~ "Header Content"

      for class <- ~w(flex flex-col space-y-2) do
        assert html =~ class
      end
    end

    test "renders with custom class" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_header class="custom-class">
          <h2>Header Content</h2>
        </.alert_dialog_header>
        """)

      assert html =~ "custom-class"
    end
  end

  describe "alert_dialog_title/1" do
    test "renders title with content" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_title>
          Dialog Title
        </.alert_dialog_title>
        """)

      assert html =~ "Dialog Title"
      assert html =~ "text-lg"
      assert html =~ "font-semibold"
    end

    test "renders with custom class" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_title class="custom-class">
          Dialog Title
        </.alert_dialog_title>
        """)

      assert html =~ "custom-class"
    end
  end

  describe "alert_dialog_description/1" do
    test "renders description with content" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_description>
          Dialog description text
        </.alert_dialog_description>
        """)

      assert html =~ "Dialog description text"

      for class <- ~w(text-sm text-muted-foreground) do
        assert html =~ class
      end
    end

    test "renders with custom class" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_description class="custom-class">
          Dialog description text
        </.alert_dialog_description>
        """)

      assert html =~ "custom-class"
    end
  end

  describe "alert_dialog_footer/1" do
    test "renders footer with content" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_footer>
          <button>Footer Button</button>
        </.alert_dialog_footer>
        """)

      assert html =~ "Footer Button"

      for class <- ~w(flex flex-col-reverse sm:flex-row) do
        assert html =~ class
      end
    end

    test "renders with custom class" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_footer class="custom-class">
          <button>Footer Button</button>
        </.alert_dialog_footer>
        """)

      assert html =~ "custom-class"
    end
  end

  describe "alert_dialog_cancel/1" do
    test "renders cancel button with content" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_cancel builder={%{id: "test-dialog"}}>
          Cancel
        </.alert_dialog_cancel>
        """)

      assert html =~ "Cancel"
      assert html =~ "phx-click"

      for class <- ~w(mt-2 sm:mt-0) do
        assert html =~ class
      end
    end

    test "renders with custom class" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_cancel builder={%{id: "test-dialog"}} class="custom-class">
          Cancel
        </.alert_dialog_cancel>
        """)

      assert html =~ "custom-class"
    end

    test "raises when missing required builder" do
      assigns = assign_builder()

      assert_raise KeyError, ~r/key :builder not found/, fn ->
        rendered_to_string(~H"""
        <.alert_dialog_cancel>
          Cancel
        </.alert_dialog_cancel>
        """)
      end
    end
  end

  describe "alert_dialog_action/1" do
    test "renders action button with content" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_action>
          Continue
        </.alert_dialog_action>
        """)

      assert html =~ "Continue"
    end

    test "renders with custom class" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog_action class="custom-class">
          Continue
        </.alert_dialog_action>
        """)

      assert html =~ "custom-class"
    end
  end

  # Integration test for the complete alert dialog
  describe "complete alert dialog" do
    test "renders full alert dialog structure" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.alert_dialog id="test-dialog">
          <.alert_dialog_trigger builder={%{id: "test-dialog"}}>
            <button>Open Dialog</button>
          </.alert_dialog_trigger>
          <.alert_dialog_content builder={%{open: false}}>
            <.alert_dialog_header>
              <.alert_dialog_title>Confirmation</.alert_dialog_title>
              <.alert_dialog_description>
                Are you sure you want to continue?
              </.alert_dialog_description>
            </.alert_dialog_header>
            <.alert_dialog_footer>
              <.alert_dialog_cancel builder={%{id: "test-dialog"}}>Cancel</.alert_dialog_cancel>
              <.alert_dialog_action>Continue</.alert_dialog_action>
            </.alert_dialog_footer>
          </.alert_dialog_content>
        </.alert_dialog>
        """)

      assert html =~ "test-dialog"
      assert html =~ "Open Dialog"
      assert html =~ "Confirmation"
      assert html =~ "Are you sure you want to continue?"
      assert html =~ "Cancel"
      assert html =~ "Continue"
    end
  end
end
