defmodule SaladUI.Collapsible do
  @moduledoc """
  Implementation of Collapsible components.

    ## Examples:

        <.collapsible id="collapsible-1" open let={builder}>
          <.collapsible_trigger builder={builder}>
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
    doc: "Id to identify collapsible component, collapsible_trigger uses this id to toggle content visibility"

  attr :open, :boolean, default: true, doc: "Initial state of collapsible content"
  attr :class, :string, default: nil
  slot(:inner_block, required: true)

  def collapsible(assigns) do
    assigns =
      assigns
      |> assign(:open, normalize_boolean(assigns[:open]))

    ~H"""
    <div
      phx-toggle-collapsible={toggle_collapsible(@id)}
      phx-mounted={@open && JS.exec("phx-toggle-collapsible", to: "##{@id}")}
      class={classes(["inline-block relative collapsible-root", @class])}
      id={@id}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Render trigger for collapsible component.
  """
  attr(:class, :string, default: nil)
  attr :as, :string, default: "button"
  slot(:inner_block, required: true)

  def collapsible_trigger(assigns) do
    ~H"""
    <.dynamic_tag name={@as}
      onclick={exec_closest("phx-toggle-collapsible", ".collapsible-root")} class={@class}>
      <%= render_slot(@inner_block) %>
    </.dynamic_tag>
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
      class={
        classes([
          "collapsible-content hidden transition-all duration-200 ease-in-out",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Show collapsible content.
  """
  def toggle_collapsible(js \\ %JS{}, id) do
    JS.toggle(js,
      to: "##{id} .collapsible-content",
      in: {"ease-out duration-200", "opacity-0", "opacity-100"},
      out: {"ease-out", "opacity-100", "opacity-70"},
      time: 200
    )
  end
end
