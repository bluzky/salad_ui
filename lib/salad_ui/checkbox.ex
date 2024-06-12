defmodule SaladUI.Checkbox do
  @moduledoc false
  use SaladUI, :component

  @doc """
  Implement checkbox input component

  ## Examples:
      <.checkbox class="!border-destructive" name="agree" value={true} />
  """
  attr(:id, :any, default: nil)
  attr(:name, :any, default: nil)
  attr(:value, :any, default: nil)
  attr(:field, Phoenix.HTML.FormField)
  attr(:class, :string, default: nil)
  attr(:rest, :global)

  def checkbox(assigns) do
    assigns =
      assigns
      |> prepare_assign()
      |> assign_new(:checked, fn ->
        Phoenix.HTML.Form.normalize_value("checkbox", assigns.value)
      end)

    ~H"""
    <input type="hidden" name={@name} value="false" />
    <input
      type="checkbox"
      class={
        classes([
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:text-primary-foreground",
          @class
        ])
      }
      id={@id || @name}
      name={@name}
      value="true"
      checked={@checked}
      {@rest}
    />
    """
  end
end
