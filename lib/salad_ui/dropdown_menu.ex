defmodule SaladUI.DropdownMenu do
  @moduledoc false
  use SaladUI, :component

  alias Phoenix.LiveView.JS

  @doc """
  Render dropdown menu


  ## Examples:

      <.dropdown_menu>
        <.dropdown_menu_trigger>
          <.button variant="outline">Open</.button>
        </.dropdown_menu_trigger>

        <.dropdown_menu_content>
          <.dropdown_menu_label>Account</.dropdown_menu_label>
          <.dropdown_menu_separator />

          <.dropdown_menu_group>
            <.dropdown_menu_item>
              Profile
              <.dropdown_menu_shortcut>⌘P</.dropdown_menu_shortcut>
            </.dropdown_menu_item>
            <.dropdown_menu_item>
              Billing
              <.dropdown_menu_shortcut>⌘B</.dropdown_menu_shortcut>
            </.dropdown_menu_item>
            <.dropdown_menu_item>
              Settings
              <.dropdown_menu_shortcut>⌘S</.dropdown_menu_shortcut>
            </.dropdown_menu_item>
          </.dropdown_menu_group>
        </.dropdown_menu_content>
      </.dropdown_menu>
  """

  attr :class, :string, default: nil
    attr :on_select, :string, default: nil, doc: "`push_event` event to push to server when select value changed"

  slot :inner_block, required: true
  attr :rest, :global

  def dropdown_menu(assigns) do
    ~H"""
    <div
      id={unique_id()}
      data-parts={Jason.encode!(["trigger", "content", "positioner"])}
      data-component="menu"
            data-listeners={
        Jason.encode!(%{on_select: ["push:#{@on_select}"]})
      }
      data-options={Jason.encode!(%{additional_context: ["positioning"]})}

      phx-hook="ZagHook"
      class={classes(["relative group inline-block", @class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :as_tag, :any, default: "div"
  slot :inner_block, required: true

  attr :rest, :global

  def dropdown_menu_trigger(assigns) do
    ~H"""
    <.dynamic
      data-part="trigger"
      tag={@as_tag}
      class={classes(["dropdown-menu-trigger peer", @class])}
      data-state="closed"
      {@rest}
    >
      {render_slot(@inner_block)}
    </.dynamic>
    """
  end

  attr :class, :string, default: nil
  attr :side, :string, values: ["top", "right", "bottom", "left"], default: "bottom"
  attr :align, :string, values: ["start", "center", "end"], default: "start"
  slot :inner_block, required: true
  attr :rest, :global

  def dropdown_menu_content(assigns) do
    ~H"""
    <div data-part="positioner"
      data-ctx-positioning={Jason.encode!(%{placement: placement(@side, @align), offset: 8, strategy: "fixed"})}
    >
    <div
      data-part="content"
      class={[
        "z-50 animate-in peer-data-[state=closed]:fade-out-0 peer-data-[state=open]:fade-in-0 peer-data-[state=closed]:zoom-out-95 peer-data-[state=open]:zoom-in-95 peer-data-[side=bottom]:slide-in-from-top-2 peer-data-[side=left]:slide-in-from-right-2 peer-data-[side=right]:slide-in-from-left-2 peer-data-[side=top]:slide-in-from-bottom-2",
        "min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        @class
      ]}
      {@rest}
    >
        {render_slot(@inner_block)}
    </div>
      </div>
    """
  end

  attr :class, :string, default: nil
  attr :disabled, :boolean, default: false
  attr :value, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def dropdown_menu_item(assigns) do
    ~H"""
    <div
      data-part="item"
      data-props={Jason.encode!(%{value: @value})}
      phx-value-value={@value}
      class={
        classes([
          "hover:bg-accent data-[highlighted]:bg-accent",
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          @class
        ])
      }
      {%{"data-disabled" => @disabled}}
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :inset, :boolean, default: false
  slot :inner_block, required: true
  attr :rest, :global

  def dropdown_menu_label(assigns) do
    ~H"""
    <div class={classes(["px-2 py-1.5 text-sm font-semibold", @inset && "pl-8", @class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :class, :string, default: nil
  slot :inner_block

  def dropdown_menu_separator(assigns) do
    ~H"""
    <div role="separator" class={classes(["-mx-1 my-1 h-px bg-muted", @class])}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def dropdown_menu_shortcut(assigns) do
    ~H"""
    <span class={classes(["ml-auto text-xs tracking-widest opacity-60", @class])} {@rest}>
      {render_slot(@inner_block)}
    </span>
    """
  end

  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def dropdown_menu_group(assigns) do
    ~H"""
    <div class={classes([@class])} role="group" {@rest}>{render_slot(@inner_block)}</div>
    """
  end

  defp placement(side, align) do
    case {side, align} do
      {side, "center"} -> side
      {side, align} -> "#{side}-#{align}"
    end
  end
end
