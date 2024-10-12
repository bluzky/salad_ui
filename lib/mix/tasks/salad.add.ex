defmodule Mix.Tasks.Salad.Add do
  @moduledoc """
  A Mix task for adding Salad UI components to your project.

  Usage:
    mix salad.add [component_name]
    mix salad.add all
    mix salad.add help
  """
  use Mix.Task

  @non_components_files ~w(patcher helper)

  @impl true
  def run(argv) do
    available_components = list_available_components()

    case argv do
      ["help"] ->
        print_usage_and_components(available_components)

      ["all"] ->
        install_components(available_components)

      components when is_list(components) and length(components) > 0 ->
        handle_component_installation(components, available_components)

      _ ->
        print_usage_and_components(available_components)
    end
  end

  defp handle_component_installation(components, available_components) do
    {valid, invalid} = Enum.split_with(components, &(&1 in available_components))

    case {valid, invalid} do
      {_, []} ->
        install_components(valid)

      {[], _} ->
        report_invalid_components(invalid)

      {_, _} ->
        report_invalid_components(invalid)
        prompt_for_valid_component_installation(valid)
    end
  end

  defp prompt_for_valid_component_installation(valid_components) do
    report_valid_components(valid_components)

    if Mix.shell().yes?("Do you want to install the valid component(s)?") do
      install_components(valid_components)
    end
  end

  defp install_components(components) do
    Enum.each(components, &install_component/1)
  end

  defp install_component(file_name) do
    with {:ok, source_file} <- build_source_file_path(file_name),
         {:ok, source_content} <- File.read(source_file),
         target_path = build_target_file_path(file_name),
         :ok <- File.mkdir_p(Path.dirname(target_path)),
         modified_content = insert_target_module_name(source_content),
         :ok <- File.write(target_path, modified_content) do
      Mix.shell().info("#{file_name} component installed successfully ✅")
    else
      {:error, :source_not_found} ->
        Mix.shell().error("Template not found: #{file_name}")

      {:error, reason} ->
        Mix.shell().error("Failed to install #{file_name}: #{inspect(reason)}")
    end
  end

  defp build_source_file_path(file_name) do
    path = Path.join([get_base_path(), "#{file_name}.ex"])
    if File.exists?(path), do: {:ok, path}, else: {:error, :source_not_found}
  end

  defp build_target_file_path(file_name) do
    Path.join([component_dir(), "#{file_name}.ex"])
  end

  defp insert_target_module_name(source) do
    module_name = get_module_name()
    Regex.replace(~r/defmodule SaladUI\.([a-zA-Z0-9_]+)/, source, "defmodule #{module_name}.Components.\\1")
  end

  defp get_module_name do
    Mix.Project.config()[:app]
    |> Atom.to_string()
    |> Macro.camelize()
    |> Kernel.<>("Web")
  end

  defp component_dir do
    Application.get_env(:salad_ui, :components_path)
  end

  defp print_usage_and_components(available_components) do
    Mix.shell().info(@moduledoc)
    Mix.shell().info("\nAvailable components:\n#{Enum.join(available_components, "\n")}")
  end

  defp list_available_components do
    if Mix.env() == :test do
      # In test, mock the list of available components
      ["button", "card", "input"]
    else
      get_base_path()
      |> Path.join("*.ex")
      |> Path.wildcard()
      |> Enum.map(&Path.basename(&1, ".ex"))
      |> Enum.reject(&(&1 in @non_components_files))
    end
  end

  defp get_base_path do
    if Mix.env() == :test do
      # In test, we do not have access to the salad_ui dependency
      # so we need to find the components source files under the `lib/salad_ui` directory
      Path.expand("lib/salad_ui")
    else
      case find_salad_ui_dep() do
        {:ok, path} -> path |> Path.join("lib/salad_ui") |> Path.expand()
        {:error, reason} -> raise "Failed to find SaladUI: #{reason}"
      end
    end
  end

  defp find_salad_ui_dep do
    deps = Mix.Dep.load_and_cache()

    case Enum.find(deps, &(&1.app == :salad_ui)) do
      %Mix.Dep{opts: opts} = dep ->
        if path = Keyword.get(opts, :path) do
          {:ok, path}
        else
          {:ok, Path.join([File.cwd!(), "deps", Atom.to_string(dep.app)])}
        end

      nil ->
        {:error, "SaladUI not found in dependencies"}
    end
  end

  defp report_invalid_components(invalid) do
    Mix.shell().error("Invalid components:\n#{Enum.join(invalid, "\n")}")
  end

  defp report_valid_components(valid) do
    Mix.shell().info("Valid components:\n#{Enum.join(valid, "\n")}")
  end
end
