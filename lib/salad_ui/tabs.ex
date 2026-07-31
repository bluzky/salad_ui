defmodule SaladUI.Tabs do
  @moduledoc """
  Implementation of tabs components from https://ui.shadcn.com/docs/components/tabs

  ## Example:

      <.tabs id="settings" default="account" on-tab-changed={JS.push("tab_changed")}>
        <.tabs_list>
          <.tabs_trigger value="account">Account</.tabs_trigger>
          <.tabs_trigger value="password">Password</.tabs_trigger>
        </.tabs_list>
        <.tabs_content value="account">
          <.card>
            <.card_content class="p-6">
              Account settings go here
            </.card_content>
          </.card>
        </.tabs_content>
        <.tabs_content value="password">
          <.card>
            <.card_content class="p-6">
              Password settings go here
            </.card_content>
          </.card>
        </.tabs_content>
      </.tabs>

  ## Component events

  * `:on-tab-changed` - Maps the `tab-changed` event. Fired when a different tab is selected.

  ## Server commands

  Tabs does not support `SaladUI.LiveView.send_command/4`. To change the active
  tab from the server, update the `value` assign and let LiveView re-render.
  """
  use SaladUI, :component

  @doc """
  Primary tabs component that serves as a container for tab triggers and content.

  ## Component events

  * `:on-tab-changed` - Fired when a different tab is selected.
  """
  attr :id, :string, required: true, doc: "Unique identifier for the tabs component"
  attr :default, :string, default: nil, doc: "Default selected tab value"
  attr :value, :string, default: nil, doc: "Currently selected tab value"
  attr :class, :string, default: nil
  attr :"on-tab-changed", :any, default: nil, doc: "Handler for tab change events"
  attr :rest, :global
  slot :inner_block, required: true

  def tabs(assigns) do
    # Collect event mappings
    event_map = event_mappings(assigns)

    assigns =
      assigns
      |> assign(:event_map, json(event_map))
      |> assign(
        :options,
        json(%{
          defaultValue: assigns.default,
          value: assigns.value
        })
      )

    ~H"""
    <div
      id={@id}
      class={classes(["", @class])}
      data-component="tabs"
      data-state="idle"
      data-options={@options}
      data-event-mappings={@event_map}
      data-part="root"
      phx-hook="SaladUI"
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Container for tab triggers that provides proper styling and ARIA attributes.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tabs_list(assigns) do
    ~H"""
    <div
      data-part="list"
      class={
        classes([
          "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Individual tab button that activates its corresponding content panel.
  """
  attr :value, :string, required: true, doc: "Unique value that identifies this tab"
  attr :class, :string, default: nil
  attr :disabled, :boolean, default: false
  attr :rest, :global
  slot :inner_block, required: true

  def tabs_trigger(assigns) do
    ~H"""
    <button
      type="button"
      data-part="trigger"
      data-value={@value}
      data-state="inactive"
      data-disabled={to_string(@disabled)}
      class={
        classes([
          "inline-flex items-center justify-center whitespace-nowrap rounded-xs px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-hidden focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs",
          @class
        ])
      }
      disabled={@disabled}
      {@rest}
    >
      {render_slot(@inner_block)}
    </button>
    """
  end

  @doc """
  Content panel that corresponds to a tab trigger.
  """
  attr :value, :string, required: true, doc: "Value that matches a tab trigger"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tabs_content(assigns) do
    ~H"""
    <div
      data-part="content"
      data-value={@value}
      data-state="inactive"
      hidden
      class={
        classes([
          "mt-2 focus-visible:outline-hidden focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end
end
