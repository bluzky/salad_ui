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
  @default_tailwind_animate_version "1.0.7"

  @impl true
  def run(argv) do
    case argv do
      [] -> execute_init()
      ["--as-lib"] -> execute_init(as_lib: true)
      _ -> print_usage()
    end
  end

  defp execute_init(opts \\ []) do
    {app_name, app_path} = prompt_application()
    component_path = prompt_component_path(app_name, app_path)
    color_scheme = prompt_color_scheme()

    init(app_name, app_path, component_path, color_scheme, opts)
  end

  defp init(app_name, app_path, component_path, color_scheme, opts) do
    env = Atom.to_string(Mix.env())
    assets_path = build_assets_path(env)
    application_file_path = Path.join([File.cwd!(), app_path, "lib/#{app_name}/application.ex"])

    File.mkdir_p!(component_path)

    with :ok <- write_config(component_path, app_name),
         :ok <- init_tw_merge_cache(application_file_path),
         :ok <- patch_css(color_scheme, assets_path, app_path),
         :ok <- patch_js(assets_path, app_path),
         :ok <- copy_tailwind_colors(assets_path, app_path),
         :ok <- patch_tailwind_config(opts, app_path),
         :ok <- maybe_write_helpers_module(component_path, app_name, opts),
         :ok <- maybe_write_component_module(component_path, app_name, opts),
         :ok <- install_tailwind_animate(opts, app_path) do
      if opts[:as_lib] do
        Mix.shell().info("Done. Now you can use any component by `import SaladUI.<ComponentName>` in your project.")
      else
        Mix.shell().info("Done. Now you can add components by running mix salad.add <component_name>")
      end
    else
      {:error, reason} -> Mix.shell().error("Error during setup: #{reason}")
    end
  end

  defp prompt_application do
    if Mix.Project.umbrella?() do
      project_apps = build_project_apps()

      prompt = """
      Enter the umbrella app to integrate SaladUI: (1)
      #{Enum.map(project_apps, fn {i, a} -> "#{i}- #{a.name}\n" end)}
      """

      response =
        prompt
        |> Mix.shell().prompt()
        |> String.trim()
        |> case do
          "" -> "1"
          response -> response
        end

      case Map.fetch(project_apps, response) do
        {:ok, %{name: name, path: path}} ->
          {name, path}

        :error ->
          Mix.shell().error("Invalid application option #{response}")
          prompt_application()
      end
    else
      {:ok, {parse_app_name(Mix.Project.config()[:app]), ""}}
    end
  end

  defp prompt_component_path(app_name, app_path) do
    default_path = build_default_component_path(app_name, app_path)

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

  defp build_project_apps do
    Mix.Project.apps_paths()
    |> Enum.with_index(1)
    |> Map.new(fn {{name, path}, i} -> {Integer.to_string(i), %{name: parse_app_name(name), path: path}} end)
  end

  defp parse_app_name(app_name), do: app_name |> Atom.to_string() |> String.downcase()

  defp write_config(component_path, app_name) do
    write_dev_config(component_path, app_name)
  end

  defp write_dev_config(component_path, app_name) do
    component_module_prefix =
      app_name
      |> Macro.camelize()
      |> Kernel.<>("Web.Components")

    Mix.shell().info("Writing components path to dev.exs")
    dev_config_path = Path.join(File.cwd!(), "config/dev.exs")

    components_config = [
      salad_ui: %{
        description: "Path to install SaladUI components",
        values: [
          components_path: "Path.join(File.cwd!(), \"#{component_path}\")",
          component_module_prefix: "\"#{component_module_prefix}\""
        ]
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

  defp patch_css(color_scheme, assets_path, app_path) do
    app_css_path = Path.join([File.cwd!(), app_path, "assets/css/app.css"])
    css_color_scheme_path = Path.join([assets_path, "colors", "#{color_scheme}.css"])

    if File.exists?(app_css_path) do
      Mix.shell().info("Patching app.css")
      Patcher.patch_css_file(app_css_path, css_color_scheme_path)
      :ok
    else
      {:error, "app.css not found"}
    end
  end

  defp patch_js(assets_path, app_path) do
    app_js_path = Path.join([File.cwd!(), app_path, "assets/js/app.js"])
    js_file_path = Path.join(assets_path, "server-events.js")

    if File.exists?(app_js_path) do
      Mix.shell().info("Patching app.js")
      Patcher.patch_js_file(app_js_path, js_file_path)
      :ok
    else
      {:error, "app.js not found"}
    end
  end

  defp copy_tailwind_colors(assets_path, app_path) do
    Mix.shell().info("Copying tailwind.colors.json to assets folder")
    source_path = Path.join(assets_path, "tailwind.colors.json")
    target_path = Path.join([File.cwd!(), app_path, "assets/tailwind.colors.json"])

    unless File.exists?(target_path) do
      File.cp!(source_path, target_path)
    end

    :ok
  end

  defp patch_tailwind_config(opts, app_path) do
    Mix.shell().info("Patching tailwind.config.js")
    tailwind_config_path = Path.join([File.cwd!(), app_path, "assets/tailwind.config.js"])

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

  defp install_tailwind_animate(opts, app_path) do
    tag = Keyword.get(opts, :tailwind_animate_version, @default_tailwind_animate_version)
    Mix.shell().info("Downloading tailwindcss-animate.js v#{tag}")

    url = "https://raw.githubusercontent.com/jamiebuilds/tailwindcss-animate/refs/tags/v#{tag}/index.js"

    output_path =
      Keyword.get(opts, :output_path, Path.join([File.cwd!(), app_path, "assets/vendor/tailwindcss-animate.js"]))

    :inets.start()
    :ssl.start()

    case :httpc.request(:get, {url, []}, [], body_format: :binary) do
      {:ok, {{_version, 200, _reason_phrase}, _headers, body}} ->
        # Write the body to file
        File.write!(output_path, body)
        :ok

      {:ok, {{_version, status_code, _reason_phrase}, _headers, _body}} ->
        {:error, "Failed to download tailwindcss-animate with status #{status_code}"}

      {:error, reason} ->
        {:error, "Failed to download tailwindcss-animate.js: #{inspect(reason)}"}
    end
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

  defp build_default_component_path(app_name, app_path) do
    Path.join([
      app_path,
      String.replace(@default_components_path, "%APP_NAME%", app_name)
    ])
  end
end
