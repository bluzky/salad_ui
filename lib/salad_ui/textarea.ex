defmodule SaladUI.Textarea do
  @moduledoc false
  use SaladUI, :component

  @doc """
  Displays a form textarea

  ## Example

  ```heex
      <.textarea field={f[:description]} placeholder="Type your message here" />
  ```


  """
  attr(:id, :any, default: nil)
  attr(:name, :string)
  attr(:value, :string)

  attr(:field, Phoenix.HTML.FormField, doc: "a form field struct retrieved from the form, for example: @form[:email]")

  attr(:class, :string, default: nil)
  attr(:rest, :global)

  def textarea(assigns) do
    assigns = prepare_assign(assigns)
    rest = Map.merge(assigns.rest, Map.take(assigns, [:id, :name]))
    assigns = assign(assigns, :rest, rest)

    ~H"""
    <textarea
      class={
        classes([
          "min-h-[80px] border-input bg-background ring-offset-background flex w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          @class
        ])
      }
      {@rest}
    ><%= Phoenix.HTML.Form.normalize_value("textarea", assigns[:value]) %></textarea>
    """
  end
end
