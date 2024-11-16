defmodule SaladUi.MenuTest do
  use ComponentCase

  import SaladUI.Menu

  describe "Menu: " do
    test "It renderes menu_item correctly" do
      assigns = %{}

      html =
        ~H"""
        <.menu_item>Profile</.menu_item>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "\">Profile</div>"

      # Confirm that all classes are being rendered correctly

      for css_class <-
            ~w(relative flex px-2 py-1.5 rounded-sm select-none cursor-default transition-colors outline-none items-center text-sm hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none) do
        assert html =~ css_class
      end
    end

    test "IT renders menu_label correclty" do
      assigns = %{}

      html =
        ~H"""
        <.menu_label>Account</.menu_label>
        """
        |> rendered_to_string()
        |> clean_string()

      for css_class <- ~w(px-2 py-1.5 font-semibold text-sm) do
        assert html =~ css_class
      end

      assert html =~ "Account"
    end

    test "It renders menu_separator correclty" do
      assigns = %{}

      html =
        ~H"""
        <.menu_separator />
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "\"></div>"
      assert html =~ "<div role=\"separator\""

      for css_class <- ~w(-mx-1 my-1 bg-muted h-px) do
        assert html =~ css_class
      end
    end

    test "It renders menu_shortcut correclty" do
      assigns = %{}

      html =
        ~H"""
        <.menu_shortcut>⌘B</.menu_shortcut>
        """
        |> rendered_to_string()
        |> clean_string()

      for css_class <- ~w(tracking-widest text-xs ml-auto opacity-60) do
        assert html =~ css_class
      end

      assert html =~ "⌘B"
    end

    test "It renders menu_Group correctly" do
      assigns = %{}

      html =
        ~H"""
        <.menu_group>
          <.menu_item>
            Profile
            <.menu_shortcut>⌘P</.menu_shortcut>
          </.menu_item>
          <.menu_item>
            Billing
            <.menu_shortcut>⌘B</.menu_shortcut>
          </.menu_item>
          <.menu_item>
            Settings
            <.menu_shortcut>⌘S</.menu_shortcut>
          </.menu_item>
        </.menu_group>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "<div class=\"\" role=\"group\""
      assert html =~ "Profile"
      assert html =~ "⌘P"
      assert html =~ "Billing"
      assert html =~ "⌘B"
      assert html =~ "Settings"
      assert html =~ "⌘S"
    end

    test "It renders the entire menu correclty" do
      assigns = %{}

      html =
        ~H"""
        <.menu>
          <.menu_label>Account</.menu_label>
          <.menu_separator />
          <.menu_group>
            <.menu_item>
              Profile
              <.menu_shortcut>⌘P</.menu_shortcut>
            </.menu_item>
            <.menu_item>
              Billing
              <.menu_shortcut>⌘B</.menu_shortcut>
            </.menu_item>
            <.menu_item>
              Settings
              <.menu_shortcut>⌘S</.menu_shortcut>
            </.menu_item>
          </.menu_group>
        </.menu>
        """
        |> rendered_to_string()
        |> clean_string()

      for css_class <-
            ~w(min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md top-0 left-full) do
        assert html =~ css_class
      end

      assert html =~ "<div class=\"\" role=\"group\""
      assert html =~ "Profile"
      assert html =~ "⌘P"
      assert html =~ "Billing"
      assert html =~ "⌘B"
      assert html =~ "Settings"
      assert html =~ "⌘S"
    end
  end
end
