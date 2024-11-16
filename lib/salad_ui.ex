defmodule SaladUI do
  @moduledoc false
  def component do
    quote do
      use Phoenix.Component

      import SaladUI.Helpers

      # alias OrangeCmsWeb.Components.LadUI.LadJS
      alias Phoenix.LiveView.JS

      defp classes(input) do
        SaladUI.Merge.merge(input)
      end
    end
  end

  @doc """
  When used, dispatch to the appropriate macro.
  """
  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end

  defmacro __using__(_) do
    quote do
      import SaladUI.Accordion
      import SaladUI.Alert
      import SaladUI.AlertDialog
      import SaladUI.Avatar
      import SaladUI.Badge
      import SaladUI.Breadcrumb
      import SaladUI.Button
      import SaladUI.Card
      import SaladUI.Chart
      import SaladUI.Checkbox
      import SaladUI.Collapsible
      import SaladUI.Dialog
      import SaladUI.DropdownMenu
      import SaladUI.Form
      import SaladUI.Helpers
      import SaladUI.HoverCard
      import SaladUI.Icon
      import SaladUI.Input
      import SaladUI.Label
      import SaladUI.Menu
      import SaladUI.Pagination
      import SaladUI.Popover
      import SaladUI.Progress
      import SaladUI.RadioGroup
      import SaladUI.ScrollArea
      import SaladUI.Select
      import SaladUI.Separator
      import SaladUI.Sheet
      import SaladUI.Sidebar
      import SaladUI.Skeleton
      import SaladUI.Slider
      import SaladUI.Switch
      import SaladUI.Table
      import SaladUI.Tabs
      import SaladUI.Textarea
      import SaladUI.Toggle
      import SaladUI.ToggleGroup
      import SaladUI.Tooltip
    end
  end
end
