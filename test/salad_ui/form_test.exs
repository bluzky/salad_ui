defmodule SaladUI.FormTest do
  use ComponentCase

  import SaladUI.Button
  import SaladUI.Form
  import SaladUI.Input

  describe "Test form components" do
    test "It renders form item correctly" do
      assigns = %{}

      html =
        ~H"""
        <.form_item>We are inside form item</.form_item>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "<div class=\"space-y-2\">We are inside form item</div>"
    end

    test "It renders form label_correctly" do
      assigns = %{}

      html =
        ~H"""
        <.form_label>This is a label</.form_label>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<label class=\"font-medium leading-none text-sm false peer-disabled:cursor-not-allowed peer-disabled:opacity-70\">This is a label</label>"
    end

    test "It renders form_control" do
      assigns = %{}

      html =
        ~H"""
        <.form_control>Form control</.form_control>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "Form control"
    end

    test "It renders form_description correctly" do
      assigns = %{}

      html =
        ~H"""
        <.form_description>This is a form description</.form_description>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html == "<p class=\"text-muted-foreground text-sm\">This is a form description</p>"
    end

    test "It renders form message correctly" do
      assigns = %{}

      html =
        ~H"""
        <.form_message>This is a form message</.form_message>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~ "<p class=\"text-destructive font-medium text-sm\">This is a form message</p>"
    end

    test "It returns the message from a tuple {}" do
      assert translate_error({"Error Message", []}) == "Error Message"
    end

    test "It renders an entire form correctly" do
      assigns = %{form: %{}, myself: "test-string"}

      html =
        ~H"""
        <.form
          class="space-y-6"
          for={@form}
          id="project-form"
          phx-target={@myself}
          phx-change="validate"
          phx-submit="save"
        >
          <.form_item>
            <.form_label>What is your project's name?</.form_label>

            <.form_control>
              <.input field={@form[:name]} type="text" phx-debounce="500" />
            </.form_control>

            <.form_description>This is your public display name.</.form_description>
            <.form_message field={@form[:name]} />
          </.form_item>

          <div class="w-full flex flex-row-reverse">
            <.button class="btn btn-secondary btn-md" icon="inbox_arrow_down" phx-disable-with="Saving...">
              Save project
            </.button>
          </div>
        </.form>
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<form id=\"project-form\" class=\"space-y-6\" phx-submit=\"save\" phx-change=\"validate\" phx-target=\"test-string\">"

      assert html =~
               "<label class=\"font-medium leading-none text-sm false peer-disabled:cursor-not-allowed peer-disabled:opacity-70\">\What is your project's name?</label>"

      assert html =~ "<p class=\"text-muted-foreground text-sm\">This is your public display name.</p>"
      assert html =~ "Save project</button>"
      assert html =~ "</div></form>"
    end
  end
end
