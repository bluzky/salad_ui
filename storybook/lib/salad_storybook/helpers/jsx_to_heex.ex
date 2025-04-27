defmodule SaladStorybook.Helpers.JsxToHeex do
  @moduledoc false

  def convert(jsx) do
    case Floki.parse_fragment(jsx) do
      {:ok, ast} ->
        {:ok, ast |> Floki.traverse_and_update(&convert_tag/1) |> Floki.raw_html(pretty: true)}

      {:error, _} ->
        {:error, "Bad JSX syntax"}
    end
  end

  defp convert_tag({"dropdownmenucontent" = tag, attrs, children}) do
    tag = map_tag(tag)
    attrs = map_attr(attrs)
    children = Enum.map(children, &convert_tag/1)

    {tag, attrs, [{".menu", [], children}]}
  end

  defp convert_tag({tag, attrs, children}) do
    tag = map_tag(tag)
    attrs = map_attr(attrs)
    children = Enum.map(children, &convert_tag/1)

    {tag, attrs, children}
  end

  # string content
  defp convert_tag(tag) do
    tag
  end

  @default_mapping [
                     SaladUI.Button,
                     SaladUI.Card,
                     SaladUI.DropdownMenu,
                     SaladUI.Breadcrumb,
                     SaladUI.Table,
                     SaladUI.Tabs,
                     SaladUI.Tooltip,
                     SaladUI.Sheet,
                     SaladUI.Input,
                     SaladUI.Badge,
                     SaladUI.Textarea,
                     SaladUI.Label,
                     SaladUI.Skeleton,
                     SaladUI.Avatar,
                     SaladUI.Slider,
                     SaladUI.Alert,
                     SaladUI.Dialog,
                     SaladUI.Pagination,
                     SaladUI.Checkbox,
                     SaladUI.Form,
                     SaladUI.Menu,
                     SaladUI.Progress,
                     SaladUI.ScrollArea,
                     SaladUI.Select,
                     SaladUI.Switch,
                     SaladUI.Separator,
                     SaladUI.HoverCard,
                     SaladUI.RadioGroup,
                     SaladUI.ToggleGroup,
                     SaladUI.Toggle,
                     SaladUI.Accordion,
                     SaladUI.Popover,
                     SaladUI.Collapsible,
                     SaladUI.AlertDialog,
                     SaladUI.Sidebar,
                     Lucideicons
                   ]
                   |> Enum.map(& &1.__info__(:functions))
                   |> Enum.concat()
                   |> Enum.reject(fn {name, arity} -> arity != 1 or String.starts_with?(to_string(name), "__") end)
                   |> Map.new(fn {name, _} -> {String.replace(to_string(name), "_", ""), ".#{name}"} end)

  @custom_mapping %{
    "link" => ".link",
    "dropdownmenulabel" => ".menu_label",
    "dropdownmenuseparator" => ".menu_separator",
    "dropdownmenuitem" => ".menu_item",
    "dropdownmenucheckboxitem" => ".menu_item"
  }

  @explicit_tag_mapping Map.merge(@default_mapping, @custom_mapping)

  defp map_tag(tag) do
    case @explicit_tag_mapping[tag] do
      nil -> tag
      new_tag -> new_tag
    end
  end

  defp map_attr(attrs) when is_list(attrs) do
    attrs
    |> Enum.map(&map_attr/1)
    |> Enum.reject(&is_nil/1)
  end

  defp map_attr({key, value}) do
    case key do
      "classname" -> {"class", value}
      "htmlfor" -> {"for", value}
      "defaultvalue" -> {"default-value", value}
      "x-chunk" -> nil
      _ -> {key, value}
    end
  end
end
