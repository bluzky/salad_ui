defmodule SaladUI.Command do
  @moduledoc false
  use SaladUI, :component

  import SaladUI.Dialog
  import SaladUI.Icon

  attr :id, :string, required: true
  attr :class, :any, default: ""
  slot :inner_block, required: true

  def command(assigns) do
    ~H"""
    <div
      id={@id}
      tabindex="-1"
      data-component="command"
      phx-hook="SaladUI"
      class={
        classes([
          "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
          @class
        ])
      }
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :id, :string, required: true
  attr :open, :boolean, default: false
  slot :inner_block, required: true

  def command_dialog(assigns) do
    ~H"""
    <.dialog id={@id <> "_dialog"} open={@open}>
      <.dialog_trigger>Click me</.dialog_trigger>
      <.dialog_content class="overflow-hidden p-0">
        <.command
          id={@id}
          class="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          {render_slot(@inner_block)}
        </.command>
      </.dialog_content>
    </.dialog>
    """
  end

  attr :class, :any, default: ""
  attr :rest, :global, default: %{}

  def command_input(assigns) do
    ~H"""
    <div data-part="command-input-wrapper" class="flex items-center border-b px-3">
      <.icon name="hero-magnifying-glass" />
      <input
        type="text"
        data-part="command-input"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        class={
          classes([
            "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-transparent",
            @class
          ])
        }
        {@rest}
      />
    </div>
    """
  end

  attr :class, :any, default: ""
  slot :inner_block, required: true

  def command_list(assigns) do
    ~H"""
    <div
      data-part="command-list"
      tabindex="-1"
      role="listbox"
      class={classes(["max-h-[300px] overflow-y-auto overflow-x-hidden", @class])}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :class, :any, default: ""
  slot :inner_block, required: true

  def command_empty(assigns) do
    ~H"""
    <div class="py-6 text-center text-sm">
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :heading, :string, required: true
  slot :inner_block, required: true

  def command_group(assigns) do
    ~H"""
    <div role="presentation" class="overflow-hidden p-1 text-foreground">
      <div class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        {@heading}
      </div>
      <div role="group" class="list-none">
        {render_slot(@inner_block)}
      </div>
    </div>
    """
  end

  attr :disabled, :boolean, default: false
  attr :value, :string, required: true
  attr :selected, :boolean, default: false
  attr :rest, :global
  slot :inner_block, required: true

  def command_item(assigns) do
    ~H"""
    <button
      tabindex="-1"
      role="option"
      data-part="command-item"
      class="relative flex cursor-default w-full gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none disabled:pointer-events-none hover:bg-accent/75 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      data-disabled={@disabled}
      data-selected={@selected}
      aria-selected={@selected}
      disabled={@disabled}
      {@rest}
    >
      {render_slot(@inner_block)}
    </button>
    """
  end

  attr :class, :any, default: ""
  slot :inner_block, required: true

  def command_shortcut(assigns) do
    ~H"""
    <span
      data-part="command-shortcut"
      class={classes(["ml-auto text-xs tracking-widest text-muted-foreground", @class])}
    >
      {render_slot(@inner_block)}
    </span>
    """
  end
end
