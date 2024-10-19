defmodule SaladUi.TasksHelpers do
  @moduledoc """
  Helper functions for the SaladUI mix tasks.
  """

  @doc """
  Retrieves the base path for SaladUI library source files.

  Returns the appropriate path based on the current environment:
  - In test: Uses the local `lib/salad_ui` directory.
  - In development: Locates the path within project dependencies.

  Raises an error if SaladUI cannot be found in the dependencies.
  """
  def get_base_path do
    if Mix.env() == :test, do: test_path(), else: development_path()
  end

  defp test_path, do: __DIR__

  defp development_path do
    case find_salad_ui_dep() do
      {:ok, path} -> Path.expand(Path.join(path, "lib/salad_ui"))
      {:error, reason} -> raise "Failed to find SaladUI: #{reason}"
    end
  end

  defp find_salad_ui_dep do
    Mix.Dep.load_and_cache()
    |> Enum.find(&(&1.app == :salad_ui))
    |> case do
      %Mix.Dep{opts: opts} = dep ->
        {:ok, opts[:path] || default_dep_path(dep)}

      nil ->
        {:error, "SaladUI not found in dependencies"}
    end
  end

  defp default_dep_path(dep) do
    Path.join([File.cwd!(), "deps", Atom.to_string(dep.app)])
  end
end
