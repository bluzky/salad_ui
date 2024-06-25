defmodule SaladUI.DialogTest do
  use ComponentCase

  import SaladUI.Button
  import SaladUI.Dialog
  import SaladUI.Input
  import SaladUI.Label

  describe "Test Dialog" do
    test "It renders dialog header correctly" do
      assigns = %{}

      html =
        ~H"""
        <.dialog_header>This is the content of the header</.dialog_header>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<div class=\"flex text-center flex-col space-y-1.5 sm:text-left\">This is the content of the header</div>"

      for css_class <- ~w(flex flex-col space-y-1.5 text-center sm:text-left) do
        assert html =~ css_class
      end
    end

    test "It renders dialog title correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.dialog_title>Edit profile</.dialog_title>
        """)

      assert html =~ "Edit profile\n</h3>"

      for css_class <- ~w(text-lg font-semibold leading-none tracking-tight) do
        assert html =~ css_class
      end
    end

    test "It renders dialog description correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.dialog_description>
          Make changes to your profile here click save when you're done
        </.dialog_description>
        """)

      assert html =~ "Make changes to your profile here click save when you're done\n\n</p>"

      for css_class <- ~w(text-sm text-muted-foreground) do
        assert html =~ css_class
      end
    end

    test "It renders dialog footer correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.dialog_footer>The footer is here</.dialog_footer>
        """)

      assert html =~ "The footer is here"

      for css_class <- ~w(flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2) do
        assert html =~ css_class
      end
    end

    test "It renders dialog correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.button phx-click={show_modal("my-modal")}>
          Open modal
        </.button>

        <.dialog id="my-modal" on_cancel={Phoenix.LiveView.JS.navigate("")} class="w-[700px]">
          <.dialog_header>
            <.dialog_title>Edit profile</.dialog_title>

            <.dialog_description>
              Make changes to your profile here click save when you're done
            </.dialog_description>
          </.dialog_header>

          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <.label html-for="name" class="text-right">
                Name
              </.label>
              <.input id="name" value="Dzung Nguyen" class="col-span-3" />
            </div>

            <div class="grid grid-cols-4 items-center gap-4">
              <.label html-for="username" class="text-right">
                Username
              </.label>
              <.input id="username" value="@bluzky" class="col-span-3" />
            </div>
          </div>

          <.dialog_footer>
            <.button type="submit">save changes</.button>
          </.dialog_footer>
        </.dialog>
        """)

      assert html =~ "Edit profile"
      assert html =~ "save changes\n<\/button>"
      assert html =~ "Make changes to your profile here click save when you're done"
    end
  end
end
