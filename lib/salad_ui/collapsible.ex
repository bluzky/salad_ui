defmodule SaladUI.Collapsible do
  @moduledoc """
  Implementation of Collapsible components.

    ## Examples:

        <.collapsible id="collapsible-1" open>
          <.collapsible_trigger>
            <.button variant="outline">Show content</.button>
          </.collapsible_trigger>
          <.collapsible_content>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </.collapsible_content>
        </.collapsible>

  """
  use SaladUI, :component

  attr :id, :string,
    required: true,
    doc: "Id to identify collapsible component"

  attr :open, :boolean, default: false, doc: "Initial state of collapsible content"
  attr :listeners, :list, default: []
  attr :class, :string, default: nil
  attr :rest, :global, include: ~w(title)
  slot :inner_block, required: true

  def collapsible(assigns) do
    assigns = assign(assigns, :open, normalize_boolean(assigns[:open]))

    ~H"""
    <div
      data-component="collapsible"
      data-parts={Jason.encode!(["root", "trigger", "content"])}
      data-part="root"
      data-options={Jason.encode!(%{open: @open})}
      data-listeners={Jason.encode!(@listeners)}
      phx-hook="ZagHook"
      class={classes(["inline-block relative", @class])}
      id={@id}
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Render trigger for collapsible component.
  """
  attr(:class, :string, default: nil)
  attr :as_tag, :any, default: "div"
  attr :rest, :global
  slot(:inner_block, required: true)

  def collapsible_trigger(assigns) do
    ~H"""
    <.dynamic tag={@as_tag} data-part="trigger" class={@class} {@rest}>
      {render_slot(@inner_block)}
    </.dynamic>
    """
  end

  @doc """
  Render content for collapsible component.
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def collapsible_content(assigns) do
    ~H"""
    <div
      data-part="content"
      class={
        classes([
          "transition-all duration-200 ease-in-out",
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
