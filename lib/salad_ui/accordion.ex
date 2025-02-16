defmodule SaladUI.Accordion do
  @moduledoc """
  Accordion component for displaying collapsible content.

  ## Examples

  <.accordion>
    <.accordion_item group="1">
      <.accordion_trigger>
        Is it accessible?
      </.accordion_trigger>
      <.accordion_content>
        Yes. It adheres to the WAI-ARIA design pattern.
      </.accordion_content>
    </.accordion_item>
    <.accordion_item group="2">
      <.accordion_trigger>
        Is it styled?
      </.accordion_trigger>
      <.accordion_content>
        Yes. It comes with default styles that matches the other components' aesthetic.
      </.accordion_content>
    </.accordion_item>
    <.accordion_item group="3">
      <.accordion_trigger>
        Is it animated?
      </.accordion_trigger>
      <.accordion_content>
        Yes. It's animated by default, but you can disable it if you prefer.
      </.accordion_content>
    </.accordion_item>
  </.accordion>
  """
  use SaladUI, :component

  attr :class, :string, default: nil
  slot :inner_block, required: true

  @doc """
  Renders the root container for the accordion component.
  """
  def accordion(assigns) do
    ~H"""
    <div class={classes(["", @class])}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :group, :string, required: true, doc: "unique identifier to the accordion item"

  attr :class, :string, default: nil
  slot :inner_block, required: true

  @doc """
  Renders an accordion item.
  """
  def accordion_item(assigns) do
    assigns = assign(assigns, :builder, %{group: assigns[:group]})

    ~H"""
    <div class={classes(["border-b", @class])}>
      {render_slot(@inner_block, @builder)}
    </div>
    """
  end

  attr :builder, :map, required: true, doc: "Builder instance for accordion item"
  attr :open, :boolean, default: false
  attr :class, :string, default: nil
  slot :inner_block, required: true

  @doc """
  Renders the trigger for an accordion item.
  """
  def accordion_trigger(assigns) do
    ~H"""
    <details
      name={@builder.group}
      class="group/accordion peer/accordion"
      open={@open}
      aria-expanded={@open}
    >
      <summary
        class={
          classes([
            "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
            @class
          ])
        }
        id={"accordion-trigger-#{@builder.group}"}
        aria-controls={"accordion-content-#{@builder.group}"}
      >
        <p class="font-medium">
          {render_slot(@inner_block)}
        </p>

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
          class="h-4 w-4 shrink-0 transition-transform duration-200 group-open/accordion:rotate-180"
        >
          <path d="m6 9 6 6 6-6"></path>
        </svg>
      </summary>
    </details>
    """
  end

  attr :builder, :map, required: true, doc: "Builder instance for accordion item"
  attr :class, :string, default: nil
  slot :inner_block, required: true

  @doc """
  Renders the content for an accordion item.
  """
  def accordion_content(assigns) do
    ~H"""
    <div
      class="text-sm overflow-hidden grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 peer-open/accordion:grid-rows-[1fr]"
      id={"accordion-content-#{@builder.group}"}
      aria-labelledby={"accordion-trigger-#{@builder.group}"}
    >
      <div class="overflow-hidden">
        <div class={classes(["pb-4 pt-0", @class])}>
          {render_slot(@inner_block)}
        </div>
      </div>
    </div>
    """
  end
end
