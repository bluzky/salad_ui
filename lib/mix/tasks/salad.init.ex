defmodule Mix.Tasks.Salad.Init do
  @moduledoc """
  A Mix task for initializing SaladUI in a project and configuring it to use a color theme.

  Commands:
    mix salad.init         : Add all necessary configuration to be able to install SaladUI components
    mix salad.init --as-lib   : Add all necessary configuration to use SaladUI in a library
    mix salad.init --help    : Print this help message
  """
  use Mix.Task

  import SaladUi.TasksHelpers

  alias SaladUI.Patcher

  @default_components_path "lib/%APP_NAME%_web/components"
  @color_schemes ~w(zinc slate stone gray neutral red rose orange green blue yellow violet)
  @default_color_scheme "gray"

  @impl true
  def run(argv) do
    case argv do
      [] -> execute_init()
      ["--as-lib"] -> execute_init(as_lib: true)
      _ -> print_usage()
    end
  end

  defp execute_init(opts \\ []) do
    component_path = prompt_component_path()
    color_scheme = prompt_color_scheme()
    init(component_path, color_scheme, opts)
  end

  defp init(component_path, color_scheme, opts) do
    env = Atom.to_string(Mix.env())
    app_name = Mix.Project.config()[:app] |> Atom.to_string() |> String.downcase()
    assets_path = build_assets_path(env)
    application_file_path = Path.join(File.cwd!(), "lib/#{app_name}/application.ex")

    node_opts = if env == "test", do: [skip: true], else: []

    File.mkdir_p!(component_path)

    with :ok <- write_config(component_path),
         :ok <- init_tw_merge_cache(application_file_path),
         :ok <- patch_css(color_scheme, assets_path),
         :ok <- patch_js(assets_path),
         :ok <- copy_tailwind_colors(assets_path),
         :ok <- copy_zag_files(assets_path),
         :ok <- patch_tailwind_config(opts),
         :ok <- maybe_write_helpers_module(component_path, app_name, opts),
         :ok <- maybe_write_component_module(component_path, app_name, opts),
         :ok <- install_node_dependencies(node_opts) do
      if opts[:as_lib] do
        Mix.shell().info("Done. Now you can use any component by importSaladUI.<ComponentName> in your project.")
      else
        Mix.shell().info("Done. Now you can add components by running mix salad.add <component_name>")
      end
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
    write_dev_config(component_path)
  end

  defp write_dev_config(component_path) do
    Mix.shell().info("Writing components path to dev.exs")
    dev_config_path = Path.join(File.cwd!(), "config/dev.exs")

    components_config = [
      salad_ui: %{
        description: "Path to install SaladUI components",
        values: [components_path: "Path.join(File.cwd!(), \"#{component_path}\")"]
      }
    ]

    patch_config(dev_config_path, components_config)
  end

  defp patch_config(config_path, config) do
    if File.exists?(config_path) do
      Patcher.patch_config(config_path, config)
      :ok
    else
      {:error, "#{Path.basename(config_path)} not found"}
    end
  end

  defp init_tw_merge_cache(application_file_path) do
    cache_module = "TwMerge.Cache"
    description = "Start TwMerge cache"

    Mix.shell().info("Adding Tailwind merge cache to application supervisor")

    if File.exists?(application_file_path) do
      Patcher.patch_elixir_application(
        application_file_path,
        cache_module,
        description
      )
    else
      {:error, "application.ex not found"}
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

  defp copy_zag_files(assets_path) do
    Mix.shell().info("Copying zag files to assets folder")
    source_path = Path.join(assets_path, "zag")
    target_path = Path.join(File.cwd!(), "assets/js/zag")

    File.mkdir_p!(target_path)

    Enum.each(File.ls!(source_path), fn file ->
      unless File.exists?(Path.join(target_path, file)) do
        File.cp!(Path.join(source_path, file), Path.join(target_path, file))
      end
    end)

    Mix.shell().info("\nZagHook installed successfully")
    Mix.shell().info("Do not forget to import it into your app.js file and pass it to your live socket")

    :ok
  end

  defp patch_tailwind_config(opts) do
    Mix.shell().info("Patching tailwind.config.js")
    tailwind_config_path = Path.join(File.cwd!(), "assets/tailwind.config.js")

    if File.exists?(tailwind_config_path) do
      Patcher.patch_tailwind_config(tailwind_config_path, opts)
      :ok
    else
      {:error, "tailwind.config.js not found"}
    end
  end

  defp maybe_write_helpers_module(_component_path, _app_name, as_lib: true), do: :ok

  defp maybe_write_helpers_module(component_path, app_name, _opts) do
    Mix.shell().info("Writing helpers module")
    source_path = Path.join(get_base_path(), "helpers.ex")
    target_path = Path.join(component_path, "helpers.ex")

    module_name = Macro.camelize(app_name)

    source_code =
      Regex.replace(
        ~r/defmodule SaladUI\.Helpers/,
        File.read!(source_path),
        "defmodule #{module_name}Web.ComponentHelpers"
      )

    File.write!(target_path, source_code)
  end

  defp maybe_write_component_module(_component_path, _app_name, as_lib: true), do: :ok

  defp maybe_write_component_module(component_path, app_name, _opts) do
    Mix.shell().info("Writing component module")
    source_path = Path.join(:code.priv_dir(:salad_ui), "templates/component.eex")

    target_path = Path.join(component_path, "component.ex")
    module_name = Macro.camelize(app_name)
    source_code = EEx.eval_file(source_path, module_name: module_name, assigns: %{module_name: module_name})

    File.write!(target_path, source_code)
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
