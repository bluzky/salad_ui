defmodule SaladUI.Helpers do
  @moduledoc false
  import Phoenix.Component

  @doc """
  Prepare input assigns for use in a form. Extract required attribute from the Form.Field struct and update current assigns.
  """
  def prepare_assign(%{field: %Phoenix.HTML.FormField{} = field} = assigns) do
    assigns
    |> assign(field: nil, id: assigns.id || field.id)
    # |> assign(:errors, Enum.map(field.errors, &translate_error(&1)))
    |> assign_new(:name, fn -> if assigns[:multiple], do: field.name <> "[]", else: field.name end)
    |> assign_new(:value, fn -> field.value end)
  end

  def prepare_assign(assigns) do
    assigns
  end

  # normalize_integer
  def normalize_integer(value) when is_integer(value), do: value

  def normalize_integer(value) when is_binary(value) do
    case Integer.parse(value) do
      {:ok, integer} -> integer
      _ -> nil
    end
  end

  def normalize_integer(_), do: nil
end
