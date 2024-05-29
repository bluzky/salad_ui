defmodule SaladUI.Select do
  @moduledoc """
  Implement of select components from https://ui.shadcn.com/docs/components/select

  ## Examples:

      <form>
         <.select default="banana" id="fruit-select">
            <.select_trigger class="w-[180px]">
              <.select_value placeholder=".select a fruit"/>
            </.select_trigger>
            <.select_content>
              <.select_group>
                <.select_label>Fruits</.select_label>
                <.select_item name="fruit" value="apple">Apple</.select_item>
                <.select_item name="fruit" value="banana">Banana</.select_item>
                <.select_item name="fruit" value="blueberry">Blueberry</.select_item>
                <.select_separator />
                <.select_item  name="fruit" disabled value="grapes">Grapes</.select_item>
                <.select_item  name="fruit" value="pineapple">Pineapple</.select_item>
              </.select_group>
        </.select_content>
          </.select>

        <.button type="submit">Submit</.button>
      </form>
  """
  use SaladUI, :component

  @doc """
  Ready to use select component with all required parts.
  """

  attr(:id, :string, default: nil)
  attr(:name, :any, default: nil)
  attr(:value, :any, default: nil)
  attr(:class, :string, default: nil)
  slot(:inner_block, required: true)
  attr(:rest, :global)

  def select(assigns) do
    ~H"""
    <div id={@id} class={classes(["relative group select-root", @class])} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr(:target, :string, required: true)
  attr(:class, :string, default: nil)
  slot(:inner_block, required: true)
  attr(:rest, :global)

  def select_trigger(assigns) do
    ~H"""
    <button
      type="button"
      class={
        classes([
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          @class
        ])
      }
      phx-click={show_select(@target)}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
      <span class="h-4 w-4 opacity-50" />
    </button>
    """
  end

  attr(:value, :string, default: nil)
  attr(:placeholder, :string, default: nil)

  def select_value(assigns) do
    ~H"""
    <span
      class="select-value pointer-events-none before:content-[attr(data-content)]"
      data-content={@value || @placeholder}
    >
    </span>
    """
  end

  attr(:id, :string, required: true)
  attr(:class, :string, default: nil)
  attr(:side, :string, values: ~w(top right bottom left), default: "bottom")
  slot(:inner_block, required: true)

  attr(:rest, :global)

  def select_content(assigns) do
    position_class =
      case assigns.side do
        "top" -> "bottom-full mb-2"
        "bottom" -> "top-full mt-2"
      end

    assigns =
      assign(assigns, :position_class, position_class)

    ~H"""
    <.focus_wrap
      data-side={@side}
      data-state="closed"
      id={@id}
      phx-click-away={hide_select(@id)}
      class={
        classes([
          "select-content absolute hidden",
          "z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md group-data-[state=open]:animate-in group-data-[state=closed]:animate-out group-data-[state=closed]:fade-out-0 group-data-[state=open]:fade-in-0 group-data-[state=closed]:zoom-out-95 group-data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          @position_class,
          @class
        ])
      }
      {@rest}
    >
      <div class="relative w-full p-1">
        <%= render_slot(@inner_block) %>
      </div>
    </.focus_wrap>
    """
  end

  attr(:class, :string, default: nil)
  slot(:inner_block, required: true)
  attr(:rest, :global)

  def select_group(assigns) do
    ~H"""
    <div role="group" class={classes([@class])} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr(:class, :string, default: nil)
  slot(:inner_block, required: true)
  attr(:rest, :global)

  def select_label(assigns) do
    ~H"""
    <div class={classes(["py-1.5 pl-8 pr-2 text-sm font-semibold", @class])} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr(:value, :any, required: true)
  attr(:name, :string, required: true)
  attr(:selected, :boolean, default: false)
  attr(:disabled, :boolean, default: false)
  attr(:class, :string, default: nil)
  attr(:"phx-click", JS, default: %JS{})
  slot(:inner_block, required: true)

  attr(:rest, :global)

  def select_item(assigns) do
    ~H"""
    <label
      role="option"
      class={
        classes([
          "group",
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent",
          @class
        ])
      }
      {%{"data-disabled": @disabled}}
      phx-click={update_value(@name, @value)}
      {@rest}
    >
      <input
        type="radio"
        class="peer"
        name={@name}
        value={@value}
        checked={@selected}
        disabled={@disabled}
      />
      <span class="hidden peer-checked:block absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <span aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-check h-4 w-4"
          >
            <path d="M20 6 9 17l-5-5"></path>
          </svg>
        </span>
      </span>
      <span>
        <%= render_slot(@inner_block) %>
      </span>
    </label>
    """
  end

  def select_separator(assigns) do
    ~H"""
    <div class={classes(["-mx-1 my-1 h-px bg-muted"])}></div>
    """
  end

  defp hide_select(id) do
    %JS{}
    |> JS.add_class("hidden", to: "##{id}")
    |> JS.pop_focus()
    |> JS.set_attribute({"data-state", "closed"}, to: "##{id}")
  end

  defp show_select(id) do
    %JS{}
    # show if closed
    |> JS.remove_class("hidden", to: "##{id}[data-state=\"closed\"]")
    |> JS.focus_first(to: "##{id}[data-state=\"closed\"]")
    |> JS.set_attribute({"data-state", "open"}, to: "##{id}")
  end

  defp update_value(name, value) do
    JS.set_attribute(%JS{}, {"data-content", value}, to: ".select-root:has(input[name=#{name}]) .select-value")
  end
end
