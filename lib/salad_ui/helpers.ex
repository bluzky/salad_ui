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

  @doc """
  Variant helper for generating classes based on side and align
  """
  @variants %{
    side: %{
      "top" => "bottom-full mb-2",
      "bottom" => "top-full mt-2",
      "left" => "right-full mr-2",
      "right" => "left-full ml-2"
    },
    align: %{
      "start-horizontal" => "left-0",
      "center-horizontal" => "left-1/2 -translate-x-1/2 slide-in-from-left-1/2",
      "end-horizontal" => "right-0",
      "start-vertical" => "top-0",
      "center-vertical" => "top-1/2 -translate-y-1/2 slide-in-from-top-1/2",
      "end-vertical" => "bottom-0"
    }
  }

  @spec side_variant(String.t(), String.t()) :: String.t()
  def side_variant(side, align \\ "center") do
    Enum.map_join(%{side: side, align: align(align, side)}, " ", fn {key, value} -> @variants[key][value] end)
  end

  # decide align class based on side
  defp align(align, side) do
    cond do
      side in ["top", "bottom"] ->
        "#{align}-horizontal"

      side in ["left", "right"] ->
        "#{align}-vertical"
    end
  end
end
