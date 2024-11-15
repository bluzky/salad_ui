defmodule SaladUI.Merge.ClassTree do
  @moduledoc false

  alias SaladUI.Cache
  alias SaladUI.Merge.Config

  def get do
    case Cache.retrieve(:class_tree) do
      nil ->
        class_tree = generate()
        Cache.insert(:class_tree, class_tree)
        class_tree

      class_tree ->
        class_tree
    end
  end

  def generate do
    config = Config.config()
    theme = Map.get(config, :theme, %{})
    prefix = Map.get(config, :prefix)
    groups = Map.get(config, :groups, [])

    groups
    |> Enum.reduce(%{}, fn {group, next}, acc ->
      DeepMerge.deep_merge(acc, handle_next(next, theme, group))
    end)
    |> add_prefix(prefix)
  end

  defp handle_next(next, theme, group) do
    Enum.reduce(next, %{"next" => %{}, "validators" => %{}}, fn part, acc ->
      case part do
        {sub_group, sub_next} ->
          add_group(sub_group, sub_next, theme, group, acc)

        part ->
          add_part(part, theme, group, acc)
      end
    end)
  end

  defp add_part(part, _theme, group, acc) when is_binary(part) do
    next =
      part
      |> String.split("-")
      |> case do
        [] -> %{}
        [single] -> %{single => %{"group" => group, "next" => %{}, "validators" => %{}}}
        multiple -> add_part_recursive(multiple, group)
      end

    Map.update(acc, "next", %{}, &DeepMerge.deep_merge(&1, next))
  end

  defp add_part(part, theme, group, acc) when is_map(part) do
    DeepMerge.deep_merge(acc, handle_next(part, theme, group))
  end

  defp add_part(part, theme, group, acc) when is_function(part) do
    if from_theme?(part) do
      flattened_theme = flatten_theme(part, theme, group)

      acc
      |> Map.update("next", %{}, &DeepMerge.deep_merge(&1, flattened_theme["next"]))
      |> Map.update("validators", %{}, &DeepMerge.deep_merge(&1, flattened_theme["validators"]))
    else
      {:name, key} = Function.info(part, :name)

      Map.update(acc, "validators", %{}, fn validators ->
        Map.put(validators, to_string(key), %{"function" => part, "group" => group})
      end)
    end
  end

  defp add_part_recursive([single], group) do
    %{single => %{"group" => group, "next" => %{}, "validators" => %{}}}
  end

  defp add_part_recursive([current | rest], group) do
    %{current => %{"next" => add_part_recursive(rest, group)}}
  end

  defp add_group(sub_group, sub_next, theme, group, acc) do
    sub_group
    |> String.split("-")
    |> add_nested_group(sub_next, theme, group, acc)
  end

  defp add_nested_group([current | rest], sub_next, theme, group, acc) do
    Map.update(acc, "next", %{}, &Map.put(&1, current, add_nested_group(rest, List.flatten(sub_next), theme, group, acc)))
  end

  defp add_nested_group([], sub_next, theme, group, _acc) do
    handle_next(sub_next, theme, group)
  end

  defp from_theme?(function), do: Function.info(function, :module) == {:module, Config}

  defp flatten_theme(function, theme, group, acc \\ %{"next" => %{}, "validators" => %{}}) do
    Enum.reduce(function.(theme), acc, fn
      item, acc when is_binary(item) ->
        Map.update(acc, "next", %{}, &Map.put(&1, item, %{"next" => %{}, "validators" => %{}, "group" => group}))

      item, acc when is_function(item) ->
        if from_theme?(item) do
          flatten_theme(item, theme, group, acc)
        else
          Map.update(acc, "validators", %{}, fn validators ->
            {:name, key} = Function.info(item, :name)
            Map.put(validators, to_string(key), %{"function" => item, "group" => group})
          end)
        end
    end)
  end

  defp add_prefix(groups, nil), do: groups

  defp add_prefix(groups, prefix) do
    %{"next" => %{String.trim_trailing(prefix, "-") => groups}, "validators" => %{}}
  end
end
