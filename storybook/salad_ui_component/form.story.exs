defmodule Storybook.SaladUIComponents.Form do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladUI.Button
  alias SaladUI.Form
  alias SaladUI.Input

  def function, do: &Form.form_item/1

  def imports,
    do: [{Input, [input: 1]}, {Form, [form_label: 1, form_description: 1, form_message: 1]}, {Button, [button: 1]}]

  def variations do
    [
      %Variation{
        id: :form,
        template: """
        <.form :let={f} for={%{}} class="w-2/3 space-y-6">
          <% f = %{f | data: %{name: ""}} %>
          <.form_item>
            <.form_label error={not Enum.empty?(f[:name].errors)}>Username</.form_label>
            <.input field={f[:name]} type="text" placeholder="saladui" phx-debounce="500" required />
            <.form_description>
              This is your public display name.
            </.form_description>
            <.form_message field={f[:name]} />
          </.form_item>
          <.button type="submit">Submit</.button>
        </.form>
        """,
        attributes: %{}
      },
      %Variation{
        id: :form_with_error,
        template: """
        <.form for={%{}} :let={f} class="w-2/3 space-y-6">
            <% f = %{f | data: %{name: ""}, errors: [name: {"This field is required", []}]} %>
            <.form_item>
              <.form_label error={not Enum.empty?(f[:name].errors)}>Username</.form_label>
              <.input field={f[:name]} type="text" placeholder="saladui" phx-debounce="500" required />
              <.form_description>
                This is your public display name.
              </.form_description>
              <.form_message field={f[:name]} />
            </.form_item>
           <.button type="submit">Submit</.button>
        </.form>
        """,
        attributes: %{}
      }
    ]
  end
end
