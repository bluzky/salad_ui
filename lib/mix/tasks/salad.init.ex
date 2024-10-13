defmodule Mix.Tasks.Salad.Init do
  @moduledoc """
  A Mix task for initializing SaladUI in a project and configuring it to use a color theme.

  Usage: mix salad.init
  """
  use Mix.Task

  import SaladUi.TasksHelpers

  alias SaladUI.Patcher

  @default_components_path "lib/%APP_NAME%_web/components/ui"
  @color_schemes ~w(zinc slate stone gray neutral red rose orange green blue yellow violet)
  @default_color_scheme "gray"

  @impl true
  def run(argv) do
    case argv do
      ["help"] -> print_usage()
      _ -> execute_init()
    end
  end

  defp execute_init do
    component_path = prompt_component_path()
    color_scheme = prompt_color_scheme()
    init(component_path, color_scheme)
  end

  defp init(component_path, color_scheme) do
    env = Atom.to_string(Mix.env())
    assets_path = build_assets_path(env)

    node_opts = if env == "test", do: [skip: true], else: []

    File.mkdir_p!(component_path)

    with :ok <- write_config(component_path),
         :ok <- patch_css(color_scheme, assets_path),
         :ok <- patch_js(assets_path),
         :ok <- copy_tailwind_colors(assets_path),
         :ok <- patch_tailwind_config(),
         :ok <- install_node_dependencies(node_opts) do
      Mix.shell().info("Done. Now you can add components by running mix salad.add <component_name>")
    else
      {:error, reason} -> Mix.shell().error("Error during setup: #{reason}")
    end
  end

  defp prompt_component_path do
    default_path = build_default_component_path()

    "Enter the path to the components folder (#{default_path}):"
    |> Mix.shell().prompt()
    |> String.trim()
    |> case do
      "" -> default_path
      path -> parse_path(path)
    end
  end

  defp prompt_color_scheme do
    prompt = "Select the color scheme to use (#{@default_color_scheme}):"
    response = prompt |> Mix.shell().prompt() |> String.trim() |> String.downcase()

    case response do
      "" ->
        Mix.shell().info("Using default color scheme: #{@default_color_scheme}")
        @default_color_scheme

      color_scheme when color_scheme in @color_schemes ->
        Mix.shell().info("Using color scheme: #{color_scheme}")
        color_scheme

      _ ->
        Mix.shell().error("Invalid color scheme")
        prompt_color_scheme()
    end
  end

  defp write_config(component_path) do
    Mix.shell().info("Writing components path to config.exs")
    config_path = Path.join(File.cwd!(), "config/config.exs")

    if File.exists?(config_path) do
      Patcher.patch_config(config_path, component_path)
      :ok
    else
      {:error, "config.exs not found"}
    end
  end

  defp patch_css(color_scheme, assets_path) do
    app_css_path = Path.join(File.cwd!(), "assets/css/app.css")
    css_color_scheme_path = Path.join([assets_path, "colors", "#{color_scheme}.css"])

    if File.exists?(app_css_path) do
      Mix.shell().info("Patching app.css")
      Patcher.patch_css_file(app_css_path, css_color_scheme_path)
      :ok
    else
      {:error, "app.css not found"}
    end
  end

  defp patch_js(assets_path) do
    app_js_path = Path.join(File.cwd!(), "assets/js/app.js")
    js_file_path = Path.join(assets_path, "server-events.js")

    if File.exists?(app_js_path) do
      Mix.shell().info("Patching app.js")
      Patcher.patch_js_file(app_js_path, js_file_path)
      :ok
    else
      {:error, "app.js not found"}
    end
  end

  defp copy_tailwind_colors(assets_path) do
    Mix.shell().info("Copying tailwind.colors.json to assets folder")
    source_path = Path.join(assets_path, "tailwind.colors.json")
    target_path = Path.join(File.cwd!(), "assets/tailwind.colors.json")

    unless File.exists?(target_path) do
      File.cp!(source_path, target_path)
    end

    :ok
  end

  defp patch_tailwind_config do
    Mix.shell().info("Patching tailwind.config.js")
    tailwind_config_path = Path.join(File.cwd!(), "assets/tailwind.config.js")

    if File.exists?(tailwind_config_path) do
      Patcher.patch_tailwind_config(tailwind_config_path)
      :ok
    else
      {:error, "tailwind.config.js not found"}
    end
  end

  defp install_node_dependencies(opts) do
    if Keyword.get(opts, :skip, false) do
      Mix.shell().info("Skipping npm install (running in test environment)")
    else
      Mix.shell().info("Installing tailwindcss-animate")
      Mix.shell().cmd("npm install -D tailwindcss-animate --prefix assets")
    end

    :ok
  end

  defp print_usage, do: Mix.shell().info(@moduledoc)

  defp parse_path(path) do
    path
    # remove trailing slash
    |> String.replace(~r/\/$/, "")
    # remove leading slash
    |> String.replace(~r/^\.*\/?/, "")
  end

  defp build_assets_path(env) do
    ["_build", env, "lib/salad_ui/priv/static/assets"]
    |> Path.join()
    |> Path.expand()
  end

  defp build_default_component_path do
    app_name = Mix.Project.config()[:app] |> Atom.to_string() |> String.downcase()
    String.replace(@default_components_path, "%APP_NAME%", app_name)
  end
end
