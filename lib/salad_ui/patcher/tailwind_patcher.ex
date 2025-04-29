defmodule SaladUI.Patcher.TailwindPatcher do
  @moduledoc false

  # TODO: Improve the formatting of the generated code,
  # so the user does not to manually format his `tailwind.config.js`
  # file after patching it.

  @plugins ["@tailwindcss/typography", "./vendor/tailwindcss-animate"]
  @tailwind_colors "./tailwind.colors.json"

  def patch(tailwind_config_path, opts \\ []) do
    new_content =
      tailwind_config_path
      |> File.read!()
      |> update_content(opts)

    File.write!(tailwind_config_path, new_content)
  end

  defp update_content(content, opts) do
    content =
      content
      |> add_plugins()
      |> add_theme()

    if true do
      add_content_watch(content)
    else
      content
    end
  end

  defp add_plugins(content) do
    new_plugins = get_new_plugins(content)

    if Enum.empty?(new_plugins) do
      content
    else
      insert_plugins(content, new_plugins)
    end
  end

  defp get_new_plugins(content) do
    @plugins
    |> Enum.reject(&String.contains?(content, &1))
    |> Enum.map(&format_plugin/1)
  end

  defp format_plugin(plugin), do: "    require(\"#{plugin}\")"

  defp insert_plugins(content, new_plugins) do
    plugins_code = Enum.join(new_plugins, ",\n")

    if has_plugins_section?(content) do
      Regex.replace(~r/plugins:\s*\[/, content, "plugins: [\n#{plugins_code},")
    else
      Regex.replace(
        ~r/module\.exports\s*=\s*{/,
        content,
        "module.exports = {\n  plugins: [\n#{plugins_code}\n  ],"
      )
    end
  end

  defp has_plugins_section?(content), do: Regex.match?(~r/plugins:\s*\[/, content)

  defp add_theme(content) do
    # Matches a full theme config in the Tailwind config file
    # eg. theme: { extend: { colors: require("./tailwind.colors.json") } }
    theme_regex =
      ~r/theme:\s*{\s*extend:\s*{\s*colors:\s*require\(['""]#{Regex.escape(@tailwind_colors)}['"]\s*\)\s*}\s*}/

    if Regex.match?(theme_regex, content) do
      content
    else
      content
      |> ensure_theme_object()
      |> ensure_extend_object()
      |> add_colors_config()
    end
  end

  defp ensure_theme_object(content) do
    if has_theme_object?(content) do
      content
    else
      Regex.replace(~r/module\.exports\s*=\s*{/, content, "module.exports = {\n  theme: {},")
    end
  end

  defp has_theme_object?(content), do: Regex.match?(~r/theme:\s*{/, content)

  defp ensure_extend_object(content) do
    if has_extend_object?(content) do
      content
    else
      Regex.replace(~r/(theme:\s*{)/, content, "\\1\n    extend: {},")
    end
  end

  defp has_extend_object?(content), do: Regex.match?(~r/theme:\s*{[^}]*extend:\s*{/, content)

  defp add_colors_config(content) do
    if has_colors_config?(content) do
      replace_colors_config(content)
    else
      insert_colors_config(content)
    end
  end

  defp has_colors_config?(content), do: Regex.match?(~r/extend:\s*{[^}]*colors:/, content)

  defp replace_colors_config(content) do
    # Matches a full colors config in the Tailwind config file
    # eg. extend: { colors: { brand: "some-color" } }
    regex = ~r/(extend:\s*{[^}]*)(colors:\s*(?:{[^}]*}|[^,}]+))/

    Regex.replace(
      regex,
      content,
      "\\1colors: require(\"#{@tailwind_colors}\")"
    )
  end

  defp insert_colors_config(content) do
    Regex.replace(
      ~r/(extend:\s*{)/,
      content,
      "\\1\n      colors: require(\"#{@tailwind_colors}\"),"
    )
  end

  # add content directory to SaladUI library so Tailwind will extract css from lib too
  defp add_content_watch(content) do
    content_pattern = "\"../deps/salad_ui/lib/**/*.ex\""
    Regex.replace(~r/content:\s*\[/, content, "content: [\n#{content_pattern},")
  end
end
