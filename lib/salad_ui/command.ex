defmodule SaladUI.Command do
  @moduledoc false
  use SaladUI, :component

  import SaladUI.Icon

  attr :id, :string, required: true
  slot :inner_block, required: true

  def command(assigns) do
    ~H"""
    <div
      id={@id}
      tabindex="-1"
      data-component="command"
      phx-hook="SaladUI"
      class="relative bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 min-w-full md:min-w-[340px] lg:min-w-[480px]"
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  def command_input(assigns) do
    ~H"""
    <div
      data-part="command-input-wrapper"
      class="flex items-center px-3 py-1 border-b border-gray-200"
    >
      <.icon name="hero-magnifying-glass" />
      <input
        type="text"
        data-part="command-input"
        placeholder="Type a command or search..."
        autocomplete="off"
        class="flex-1 text-sm bg-transparent outline-none placeholder-gray-400 text-gray-900 border-none focus:ring-transparent"
      />
    </div>
    """
  end

  slot :inner_block, required: true

  def command_list(assigns) do
    ~H"""
    <ul data-part="command-list" tabindex="-1" class="max-h-60 overflow-y-auto">
      {render_slot(@inner_block)}
    </ul>
    """
  end

  attr :heading, :string, required: true
  slot :inner_block, required: true

  def command_group(assigns) do
    ~H"""
    <li>
      <div class="px-4 py-2 text-xs text-gray-500">
        {@heading}
      </div>
      <ul>
        {render_slot(@inner_block)}
      </ul>
    </li>
    """
  end

  attr :disabled, :boolean, default: false
  attr :value, :string, required: true
  attr :rest, :global
  slot :inner_block, required: true

  def command_item(assigns) do
    dbg(assigns)

    ~H"""
    <li class="w-full px-1" data-part="command-item-wrapper">
      <button
        tabindex="-1"
        data-part="command-item"
        class="relative flex cursor-default w-full gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none disabled:pointer-events-none hover:bg-accent/75 focus:bg-accent focus:text-accent-foreground disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
        data-value={@value}
        data-disabled={true}
        disabled={@disabled}
        {@rest}
      >
        {render_slot(@inner_block)}
      </button>
    </li>
    """
  end

  slot :inner_block, required: true

  def command_shortcut(assigns) do
    ~H"""
    <span data-part="command-shortcut" class="text-muted-foreground ml-auto text-xs tracking-widest">
      {render_slot(@inner_block)}
    </span>
    """
  end
end
