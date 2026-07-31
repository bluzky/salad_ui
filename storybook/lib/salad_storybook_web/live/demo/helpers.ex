defmodule SaladStorybookWeb.Demo.Helpers do
  @moduledoc false

  @doc """
  Normalize id to be used in HTML id attribute.
  Replaces all non-alphanumeric characters with `-` and downcases the string.
  """
  def id(id) do
    id
    |> String.replace(~r/[^a-zA-Z0-9]/, "-")
    |> String.downcase()
  end
end
