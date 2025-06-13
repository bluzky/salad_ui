defmodule Mix.Tasks.Salad.Install do
  @moduledoc """
  Install SaladUI components and assets with customizable module prefix and color scheme.

  ## Usage

      mix salad.install
      mix salad.install --prefix MyUI
      mix salad.install --color-scheme slate
      mix salad.install --prefix CustomComponents --color-scheme blue
  """
  use Igniter.Mix.Task

  @impl Igniter.Mix.Task
  def igniter(igniter) do
    # Parse command-line arguments
    {opts, _args} =
      OptionParser.parse!(igniter.args.argv,
        strict: [prefix: :string, color_scheme: :string],
        aliases: [p: :prefix, c: :color_scheme]
      )

    prefix = opts[:prefix] || get_default_prefix(igniter)
    color_scheme = opts[:color_scheme] || "gray"

    igniter
    |> setup_base_config(color_scheme)
    |> copy_javascript_files()
    |> copy_component_files(prefix)
    |> patch_app_js_with_local_imports()
  end

  # Setup base configuration (similar to salad.setup)
  defp setup_base_config(igniter, color_scheme) do
    igniter
    |> patch_tw_merge()
    |> patch_css_color_scheme(color_scheme)
    |> copy_salad_ui_css()
    |> patch_css_import_salad_ui()
    |> patch_tailwind_config()
    |> copy_tailwind_colors()
    |> install_tailwind_animate()
  end

  # Copy all JavaScript files to assets/js/ui/
  defp copy_javascript_files(igniter) do
    source_dir = [Application.app_dir(:salad_ui), "assets/salad_ui"]
    target_dir = "./assets/js/ui"

    # Create target directory if it doesn't exist
    File.mkdir_p!(target_dir)

    # Get all .js files from the source directory
    js_files = Path.wildcard(Path.join(source_dir, "**/*.js"))

    IO.inspect(source_dir)
    IO.inspect(js_files)

    Enum.reduce(js_files, igniter, fn source_file, acc_igniter ->
      # Get relative path from source directory
      relative_path = Path.relative_to(source_file, source_dir)
      target_file = Path.join(target_dir, relative_path)

      # Create subdirectories if needed
      target_file |> Path.dirname() |> File.mkdir_p!()

      # Copy the file
      Igniter.copy_template(acc_igniter, source_file, target_file, [])
    end)
  end

  # Copy all component files to lib/<app>_web/components/ui/
  defp copy_component_files(igniter, prefix) do
    app_name = get_app_name(igniter)
    source_dir = Path.join([Application.app_dir(:salad_ui), "lib"])
    target_dir = "./lib/#{app_name}_web/components/ui"

    # Create target directory if it doesn't exist
    File.mkdir_p!(target_dir)

    # Get all .ex files from the source directory
    component_files = Path.wildcard(Path.join(source_dir, "**/*.ex"))

    Enum.reduce(component_files, igniter, fn source_file, acc_igniter ->
      filename = Path.basename(source_file)
      target_file = Path.join(target_dir, filename)

      # Read source content and transform it
      source_content = File.read!(source_file)
      transformed_content = transform_component_content(source_content, prefix, app_name)

      # Write transformed content to target
      File.write!(target_file, transformed_content)

      acc_igniter
    end)
  end

  # Transform component content to replace module prefix
  defp transform_component_content(content, prefix, app_name) do
    app_web_module = Phoenix.Naming.camelize("#{app_name}_web")

    content
    |> String.replace("defmodule SaladUI.", "defmodule #{app_web_module}.Components.UI.")
    |> String.replace("use SaladUI, :component", "use #{app_web_module}, :html")
    |> String.replace("import SaladUI.", "import #{app_web_module}.Components.UI.")
    |> String.replace("alias SaladUI.", "alias #{app_web_module}.Components.UI.")
    |> replace_component_calls_with_prefix(prefix)
  end

  # Replace component calls with custom prefix
  defp replace_component_calls_with_prefix(content, prefix) when prefix != "SaladUI" do
    # This is a simplified approach - in practice you might want more sophisticated parsing
    String.replace(content, ~r/<\.([a-z_]+)/, fn _match, component_name ->
      "<.#{String.downcase(prefix)}_#{component_name}"
    end)
  end

  defp replace_component_calls_with_prefix(content, _prefix), do: content

  # Patch app.js with local imports instead of external package imports
  defp patch_app_js_with_local_imports(igniter) do
    app_js_path = "./assets/js/app.js"

    js_import = """
    import SaladUI from "./ui/index.js";
    import "./ui/components/dialog.js";
    import "./ui/components/select.js";
    import "./ui/components/tabs.js";
    import "./ui/components/radio_group.js";
    import "./ui/components/popover.js";
    import "./ui/components/hover-card.js";
    import "./ui/components/collapsible.js";
    import "./ui/components/tooltip.js";
    import "./ui/components/accordion.js";
    import "./ui/components/slider.js";
    import "./ui/components/switch.js";
    import "./ui/components/dropdown_menu.js";
    """

    js_hooks = "SaladUI: SaladUI.SaladUIHook"

    js_content =
      app_js_path
      |> File.read!()
      |> SaladUI.Patcher.JSPatcher.patch_js(js_import, js_hooks)

    File.write!(app_js_path, js_content)

    igniter
  end

  # Helper functions (copied from salad.setup)
  defp patch_tw_merge(igniter) do
    Igniter.Project.Application.add_new_child(igniter, TwMerge.Cache)
  end

  defp patch_css_color_scheme(igniter, color_scheme) do
    css_file = "./assets/css/app.css"
    content = File.read!(css_file)

    IO.puts("Patching #{css_file}")

    color_scheme_code = "colors/#{color_scheme}.css" |> assets_path() |> File.read!()

    new_base_layer = """
    @layer base {
      #{color_scheme_code}
      * {
        @apply border-border !important;
      }
    }\n
    """

    File.write!(css_file, content <> "\n\n" <> new_base_layer)
    igniter
  end

  defp copy_salad_ui_css(igniter) do
    source_file = assets_path("salad_ui.css")
    target_file = "./assets/css/salad_ui.css"

    Igniter.copy_template(igniter, source_file, target_file, [])
  end

  defp patch_css_import_salad_ui(igniter) do
    css_file = "./assets/css/app.css"
    content = File.read!(css_file)
    import_snippet = "@import \"./salad_ui.css\";\n"

    IO.puts("Patching #{css_file}")
    IO.puts("Add:  #{import_snippet}")

    unless String.contains?(content, import_snippet) do
      import_regex = ~r/(@import.*?;\n)/
      imports = Regex.scan(import_regex, content)

      updated_content =
        case imports do
          [] ->
            # No imports found, return original content
            import_snippet <> "\n" <> content

          _ ->
            # Get the last import statement
            last_import = imports |> List.last() |> List.first()

            # Replace only the last occurrence
            # First, split the string at the last import
            [before_last_import, after_last_import] = String.split(content, last_import, parts: 2)

            # Reconstruct the string with the inserted content after the last import
            before_last_import <> last_import <> import_snippet <> after_last_import
        end

      File.write(css_file, updated_content)
    end

    igniter
  end

  defp copy_tailwind_colors(igniter) do
    source_file = assets_path("tailwind.colors.json")
    target_file = "./assets/tailwind.colors.json"

    Igniter.copy_template(igniter, source_file, target_file, [])
  end

  defp patch_tailwind_config(igniter) do
    tailwind_config_path = "./assets/tailwind.config.js"
    SaladUI.Patcher.TailwindPatcher.patch(tailwind_config_path)

    igniter
  end

  @default_tailwind_animate_version "1.0.7"

  defp install_tailwind_animate(igniter) do
    tag = @default_tailwind_animate_version

    Mix.shell().info("Downloading tailwindcss-animate.js v#{tag}")

    url = "https://raw.githubusercontent.com/jamiebuilds/tailwindcss-animate/refs/tags/v#{tag}/index.js"
    output_path = "assets/vendor/tailwindcss-animate.js"

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

    igniter
  end

  # Helper functions for paths
  defp assets_path(directory) do
    Path.join([:code.priv_dir(:salad_ui), "static/assets", directory])
  end

  defp get_app_name(igniter) do
    case Igniter.Project.Application.app_name(igniter) do
      {:ok, app_name} -> app_name
      # fallback
      _ -> "my_app"
    end
  end

  defp get_default_prefix(igniter) do
    app_name = get_app_name(igniter)
    Phoenix.Naming.camelize("#{app_name}_ui")
  end
end
