defmodule SaladUI.Merge do
  @moduledoc """
  SaladUI Merge adds efficient class joining and merging of TailwindCSS classes to Elixir.

  TailwindCSS class names are composable and allow specifying an infinite amount of different styles. Most components allow overriding class
  names, like as passing `class` attribute that then gets merged with the existing styles. This can result in class lists such as
  `text-white bg-red-500 bg-blue-300` where `text-white bg-red-500` is the preset style, and `bg-blue-300` is the override for that one
  specific button that needs to look slightly different.
  Styles based on class are applied according to the order _they are defined at in the stylesheet_. In this example, because TailwindCSS
  orders color definitions alphabetically, the override does not work. `blue` is defined before `red`, so the `bg-red-500` class takes
  precedence since it was defined later.

  In order to still allow overriding styles, SaladUI Merge traverses the entire class list, creates a list of all classes and which
  conflicting groups of styles exist in them and gives precedence to the ones that were defined last _in the class list_, which, unlike the
  stylesheet, is in control of the user.


  ## Example

  ```elixir
  iex> merge("text-white bg-red-500 bg-blue-300")
  "text-white bg-blue-300"

  iex> merge(["px-2 py-1 bg-red hover:bg-dark-red", "p-3 bg-[#B91C1C]"])
  "hover:bg-dark-red p-3 bg-[#B91C1C]"
  ```

  ## Configuration

  SaladUI Merge does not currently support full theme configuration - that's on the roadmap!

  The limited configuration at the moment is adding Tailwind's `prefix` option.

  ```elixir
  config :turboprop,
    prefix: "tw-"
  ```
  """

  alias SaladUI.Cache
  alias SaladUI.Merge.Class
  alias SaladUI.Merge.Config

  @doc """
  Joins and merges a list of classes.

  Passes the input to `join/1` before merging.
  """
  @spec merge(list(), term()) :: binary()
  def merge(input, config \\ Config.config()) do
    input
    |> join()
    |> retrieve_from_cache_or_merge(config)
  end

  @doc """
  Joins a list of classes.
  """
  @spec merge(binary() | list()) :: binary()
  def join(input) when is_binary(input), do: input
  def join(input) when is_list(input), do: do_join(input, "")
  def join(_), do: ""

  defp do_join("", result), do: result
  defp do_join(nil, result), do: result
  defp do_join([], result), do: result

  defp do_join(string, result) when is_binary(string), do: do_join([string], result)

  defp do_join([head | tail], result) do
    case to_value(head) do
      "" -> do_join(tail, result)
      value when result == "" -> do_join(tail, value)
      value -> do_join(tail, result <> " " <> value)
    end
  end

  defp to_value(value) when is_binary(value), do: value

  defp to_value(values) when is_list(values) do
    Enum.reduce(values, "", fn v, acc ->
      case to_value(v) do
        "" -> acc
        resolved_value when acc == "" -> resolved_value
        resolved_value -> acc <> " " <> resolved_value
      end
    end)
  end

  defp to_value(_), do: ""

  defp retrieve_from_cache_or_merge(classes, config) do
    case Cache.retrieve("merge:#{classes}") do
      nil ->
        merged_classes = do_merge(classes, config)
        Cache.insert("merge:#{classes}", merged_classes)
        merged_classes

      merged_classes ->
        merged_classes
    end
  end

  defp do_merge(classes, config) do
    classes
    |> String.trim()
    |> String.split(~r/\s+/)
    |> Enum.map(&Class.parse/1)
    |> Enum.reverse()
    |> Enum.reduce(%{classes: [], groups: []}, fn class, acc ->
      handle_class(class, acc, config)
    end)
    |> Map.get(:classes)
    |> Enum.join(" ")
  end

  defp handle_class(%{raw: raw, tailwind?: false}, acc, _config), do: Map.update!(acc, :classes, fn classes -> [raw | classes] end)

  defp handle_class(%{conflict_id: conflict_id} = class, acc, config) do
    if Enum.member?(acc.groups, conflict_id), do: acc, else: add_class(acc, class, config)
  end

  defp add_class(acc, %{raw: raw, group: group, conflict_id: conflict_id, modifier_id: modifier_id}, config) do
    conflicting_groups =
      group
      |> conflicting_groups(config)
      |> Enum.map(&"#{modifier_id}:#{&1}")
      |> then(&[conflict_id | &1])

    acc
    |> Map.update!(:classes, fn classes -> [raw | classes] end)
    |> Map.update!(:groups, fn groups -> groups ++ conflicting_groups end)
  end

  defp conflicting_groups(group, config) do
    conflicts = Map.get(config.conflicting_groups, group, [])
    modifier_conflicts = Map.get(config.conflicting_group_modifiers, group, [])

    conflicts ++ modifier_conflicts
  end
end
