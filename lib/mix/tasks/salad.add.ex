defmodule Mix.Tasks.Salad.Add do
  @moduledoc """
  A Mix task for adding Salad UI components to your project.

  Usage:
    mix salad.add [component_name]
    mix salad.add all
    mix salad.add help
  """
  use Mix.Task

  import SaladUi.TasksHelpers

  @non_components_files ~w(patcher helper task_helpers)

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
         modified_content = insert_target_module_name(source_content, file_name),
         :ok <- File.write(target_path, modified_content),
         :ok <- maybe_perform_additional_setup(file_name) do
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

  defp insert_target_module_name(source, file_name) do
    module_name = get_module_name()

    source
    |> String.replace(~r/defmodule SaladUI\.([a-zA-Z0-9_]+)/, "defmodule #{module_name}.Component.\\1")
    |> String.replace(~r/use SaladUI,\s*:component/, "use #{module_name}.Component")
    |> maybe_apply_additional_insertions(module_name, file_name)
  end

  defp maybe_apply_additional_insertions(source, module_name, "chart") do
    source
    |> String.replace("use Phoenix.LiveComponent", "use #{module_name}, :live_component")
    |> String.replace("use Phoenix.LiveView", "use #{module_name}, :live_view")
    |> String.replace("SaladUI.Chart", "#{module_name}.Component.Chart")
  end

  defp maybe_apply_additional_insertions(source, _, _), do: source

  defp maybe_perform_additional_setup("chart") do
    with :ok <- copy_chart_hook(),
         :ok <- install_chart_dependencies() do
      Mix.shell().info("\nChartHook installed successfully")
      Mix.shell().info("Do not forget to import it into your app.js file and pass it to your live socket")
      :ok
    else
      {:error, _} = error -> error
    end
  end

  defp maybe_perform_additional_setup(_), do: :ok

  defp install_chart_dependencies do
    Mix.shell().cmd("npm install chart.js --prefix assets")
    :ok
  end

  defp copy_chart_hook do
    source_path = Path.join(:code.priv_dir(:salad_ui), "static/assets/ChartHook.js")
    target_path = Path.join(File.cwd!(), "assets/js/ChartHook.js")

    unless File.exists?(target_path) do
      File.cp!(source_path, target_path)
    end

    :ok
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

  defp report_invalid_components(invalid) do
    Mix.shell().error("Invalid components:\n#{Enum.join(invalid, "\n")}")
  end

  defp report_valid_components(valid) do
    Mix.shell().info("Valid components:\n#{Enum.join(valid, "\n")}")
  end
end
