defmodule SaladUI.Patcher.ConfigPatcher do
  @moduledoc false

  def patch(config_path, opts \\ []) do
    configs_to_add = Keyword.get(opts, :configs, [])

    new_content =
      config_path
      |> File.read!()
      |> update_content(configs_to_add)

    File.write!(config_path, new_content)
  end

  defp update_content(content, configs) do
    Enum.reduce(configs, content, fn {config_name, config_data}, acc ->
      add_config_if_missing(
        acc,
        config_name,
        config_data.description,
        config_data.values
      )
    end)
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
