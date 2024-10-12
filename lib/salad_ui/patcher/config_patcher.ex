defmodule SaladUI.Patcher.ConfigPatcher do
  @moduledoc false

  def patch(config_path, components_path) do
    new_content =
      config_path
      |> File.read!()
      |> update_content(components_path)

    File.write!(config_path, new_content)
  end

  defp update_content(content, components_path) do
    content
    |> add_config_if_missing(
      :salad_ui,
      "Path to install SaladUI components",
      components_path: "Path.join(File.cwd!(), \"#{components_path}\")"
    )
    |> add_config_if_missing(
      :tails,
      "SaladUI use tails to properly merge Tailwind CSS classes",
      colors_file: "Path.join(File.cwd!(), \"assets/tailwind.colors.json\")"
    )
  end

  defp add_config_if_missing(content, config_name, description, values) do
    if config_exists?(content, config_name, values) do
      content
    else
      insert_config(content, build_config(config_name, description, values))
    end
  end

  defp config_exists?(content, config_name, values) do
    Enum.any?(values, fn
      {key, _value} ->
        normalized_contains?(content, "config :#{config_name}, #{key}:")

      key when is_atom(key) ->
        normalized_contains?(content, "config :#{config_name}, #{key}")

      _ ->
        false
    end)
  end

  defp build_config(config_name, description, values) do
    formatted_values = format_values(values)

    """
    # #{description}
    config :#{config_name}, #{formatted_values}
    """
  end

  # If you want to insert Elixir code, suchs as modules
  # or an expression, using a string with the code you want to insert
  defp format_values(values) do
    Enum.map_join(values, ", ", fn
      {key, value} -> "#{key}: #{value}"
      key -> key
    end)
  end

  defp insert_config(content, config) do
    case find_import_config_position(content) do
      {:ok, position} -> insert_before_import(content, config, position)
      :error -> append_config(content, config)
    end
  end

  defp find_import_config_position(content) do
    import_config_regex = ~r/(\n\s*(#[^\n]*\n\s*)*)?import_config.*$/s

    case Regex.run(import_config_regex, content, return: :index) do
      [{start_index, _} | _] -> {:ok, start_index}
      nil -> :error
    end
  end

  defp insert_before_import(content, config, position) do
    {before_import, import_section} = String.split_at(content, position)

    before_import
    |> String.trim_trailing()
    |> Kernel.<>("\n\n#{config}\n#{String.trim_leading(import_section)}")
  end

  defp append_config(content, config) do
    content
    |> String.trim_trailing()
    |> Kernel.<>("\n\n#{config}")
  end

  # Check if a string contains a pattern, ignoring case and spaces
  defp normalized_contains?(content, pattern) do
    normalized_content = normalize(content)
    normalized_pattern = normalize(pattern)

    String.contains?(normalized_content, normalized_pattern)
  end

  defp normalize(input) when is_binary(input) do
    input
    |> String.downcase()
    |> String.replace(~r/[^a-z0-9]/, "")
  end
end
