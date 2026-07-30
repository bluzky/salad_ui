defmodule SaladUI.SheetTest do
  use ComponentCase

  import SaladUI.Sheet

  defp assign_builder(assigns \\ %{}), do: assigns

  describe "sheet/1" do
    test "renders with required attributes" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.sheet id="test-sheet">
          <div>Content</div>
        </.sheet>
        """)

      assert html =~ ~s(id="test-sheet")
      assert html =~ "Content"
      assert html =~ ~s(data-component="dialog")
      assert html =~ ~s(data-state="closed")
    end

    test "renders with open state" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.sheet id="test-sheet" open={true}>
          <div>Content</div>
        </.sheet>
        """)

      assert html =~ ~s(data-state="open")
    end

    test "configures dialog-compatible close animation and options" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.sheet id="test-sheet" close-on-outside-click={false}>
          <div>Content</div>
        </.sheet>
        """)

      assert html =~ ~s(data-component="dialog")
      assert html =~ "open_to_closed"
      assert html =~ "duration&quot;:300"
      assert html =~ "closeOnOutsideClick&quot;:false"
    end
  end

  describe "sheet_trigger/1" do
    test "renders trigger without unused target attribute" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.sheet_trigger>
          <button>Open Sheet</button>
        </.sheet_trigger>
        """)

      assert html =~ "Open Sheet"
      assert html =~ ~s(data-part="trigger")
      assert html =~ ~s(data-action="open")
      refute html =~ "data-target"
    end
  end

  describe "sheet_content/1" do
    test "renders content structure" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.sheet_content>
          <div>Sheet Content</div>
        </.sheet_content>
        """)

      assert html =~ ~s(data-part="content")
      assert html =~ ~s(data-part="overlay")
      assert html =~ ~s(data-part="content-panel")
      assert html =~ ~s(data-side="right")
      assert html =~ "data-[state=closed]:fill-mode-forwards"
      assert html =~ "Sheet Content"
    end

    test "renders side variants" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.sheet_content side="left">
          <div>Left Sheet</div>
        </.sheet_content>
        """)

      assert html =~ ~s(data-side="left")
      assert html =~ "slide-in-from-left"
      assert html =~ "slide-out-to-left"
    end
  end

  describe "sheet_title/1 and sheet_description/1" do
    test "render ARIA data parts" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.sheet_title>Title</.sheet_title>
        <.sheet_description>Description</.sheet_description>
        """)

      assert html =~ ~s(data-part="title")
      assert html =~ ~s(data-part="description")
      assert html =~ "Title"
      assert html =~ "Description"
    end
  end

  describe "sheet_close/1" do
    test "renders close trigger" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.sheet_close>
          Close
        </.sheet_close>
        """)

      assert html =~ "Close"
      assert html =~ ~s(data-part="close-trigger")
      assert html =~ ~s(data-action="close")
    end
  end

  describe "complete sheet" do
    test "renders full sheet structure" do
      assigns = assign_builder()

      html =
        rendered_to_string(~H"""
        <.sheet id="test-sheet">
          <.sheet_trigger>
            <button>Open Sheet</button>
          </.sheet_trigger>
          <.sheet_content side="right">
            <.sheet_header>
              <.sheet_title>Edit profile</.sheet_title>
              <.sheet_description>Make changes here.</.sheet_description>
            </.sheet_header>
            <.sheet_footer>
              <.sheet_close>Close</.sheet_close>
            </.sheet_footer>
          </.sheet_content>
        </.sheet>
        """)

      assert html =~ "test-sheet"
      assert html =~ "Open Sheet"
      assert html =~ "Edit profile"
      assert html =~ "Make changes here."
      assert html =~ "Close"
    end
  end
end
