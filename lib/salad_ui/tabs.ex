defmodule SaladUI.Tabs do
  @moduledoc """
  Implementation of tabs components from https://ui.shadcn.com/docs/components/tabs

  ## Example:

      <.tabs default="account" id="settings" :let={builder} class="w-[400px]">
        <.tabs_list class="grid w-full grid-cols-2">
          <.tabs_trigger builder={builder} value="account">account</.tabs_trigger>
          <.tabs_trigger builder={builder} value="password">password</.tabs_trigger>
        </.tabs_list>
        <.tabs_content value="account">
          <.card>
            <.card_content class="p-6">
              Account
            </.card_content>
          </.card>
        </.tabs_content>
        <.tabs_content value="password">
          <.card>
            <.card_content class="p-6">
              Password
            </.card_content>
          </.card>
        </.tabs_content>
      </.tabs>
  """
  use SaladUI, :component

  attr :id, :string, required: true, doc: "id for root tabs tag"
  attr :default, :string, default: nil, doc: "default tab value"

  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def tabs(assigns) do
    ~H"""
    <div
      class={@class}
      id={@id}
      phx-hook="ZagHook"
      data-component="tabs"
      data-parts={Jason.encode!(["list", "trigger", "content"])}
      data-options={Jason.encode!(%{value: @selected})}
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

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

  attr :value, :string, required: true, doc: "target value of tab content"
  attr :disabled, :boolean, default: false
  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def tabs_trigger(assigns) do
    ~H"""
    <button
      data-part="trigger"
      data-options={Jason.encode!(%{value: @value, disabled: @disabled})}
      class={
        classes([
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </button>
    """
  end

  attr :class, :string, default: nil
  attr :value, :string, required: true, doc: "target value of tab content"
  slot :inner_block, required: true
  attr :rest, :global

  def tabs_content(assigns) do
    ~H"""
    <div
      data-part="content"
      data-options={Jason.encode!(%{value: @value})}
      class={
        classes([
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  def show_tab(js \\ %JS{}, root, value) do
    js
    |> JS.set_attribute({"tabindex", "-1"}, to: "##{root} [aria-selected=true]")
    |> JS.remove_attribute("aria-selected", to: "##{root} [aria-selected=true]")
    |> JS.set_attribute({"hidden", "true"},
      to: "##{root} [data-part='content']:not([data-value='#{value}'])"
    )
    |> JS.set_attribute({"tabindex", "0"}, to: "##{root} [data-value='#{value}']")
    |> JS.set_attribute({"aria-selected", "true"}, to: "##{root} [data-value='#{value}']")
    |> JS.remove_attribute("hidden",
      to: "##{root} [aria-labelledby='tabs:#{root}:trigger-#{value}'][data-part='content']"
    )
  end
end
