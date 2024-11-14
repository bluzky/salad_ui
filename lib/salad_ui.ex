defmodule SaladUI do
  @moduledoc false
  def component do
    quote do
      use Phoenix.Component

      import SaladUI.Helpers
      import Tails, only: [classes: 1]

      # alias OrangeCmsWeb.Components.LadUI.LadJS
      alias Phoenix.LiveView.JS
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
      import SaladUI.Helpers
      import SaladUI.Alert
      import SaladUI.Avatar
      import SaladUI.Badge
      import SaladUI.Breadcrumb
      import SaladUI.Button
      import SaladUI.Card
      import SaladUI.Checkbox
      import SaladUI.Dialog
      import SaladUI.DropdownMenu
      import SaladUI.Form
      import SaladUI.HoverCard
      import SaladUI.Icon
      import SaladUI.Input
      import SaladUI.Label
      import SaladUI.Menu
      import SaladUI.Pagination
      import SaladUI.Progress
      import SaladUI.ScrollArea
      import SaladUI.Select
      import SaladUI.Separator
      import SaladUI.Sheet
      import SaladUI.Skeleton
      import SaladUI.Slider
      import SaladUI.Switch
      import SaladUI.Table
      import SaladUI.Tabs
      import SaladUI.Textarea
      import SaladUI.Tooltip
      import SaladUI.Collapsible
      import SaladUI.Chart
      import SaladUI.AlertDialog
      import SaladUI.Popover
      import SaladUI.Accordion
      import SaladUI.RadioGroup
      import SaladUI.ToggleGroup
      import SaladUI.Toggle
      import SaladUI.Sidebar
    end
  end
end
