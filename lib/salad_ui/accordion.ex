defmodule SaladUI.Accordion do
  @moduledoc """
  Implementation of the Accordion component.

  Accordions are vertically stacked sections that can be expanded/collapsed
  to reveal their content. They are useful for breaking down complex content
  into digestible sections.

  ## Examples:

      <.accordion
        id="faq-accordion"
        type="single"
        default-value="item-1"
        on-value-changed={JS.push("accordion_changed")}
      >
        <.accordion_item value="item-1">
          <.accordion_trigger>
            Is it accessible?
          </.accordion_trigger>
          <.accordion_content>
            Yes. It adheres to the WAI-ARIA design pattern.
          </.accordion_content>
        </.accordion_item>
        <.accordion_item value="item-2">
          <.accordion_trigger>
            Is it styled?
          </.accordion_trigger>
          <.accordion_content>
            Yes. It comes with default styles that matches the other components' aesthetic.
          </.accordion_content>
        </.accordion_item>
      </.accordion>
  """
  use SaladUI, :component

  @doc """
  The main accordion component that manages the accordion state.

  ## Options

  * `:id` - Required unique identifier for the accordion.
  * `:type` - Type of accordion: "single" or "multiple". Defaults to "single".
  * `:value` - The currently expanded items. String for "single", list for "multiple".
  * `:default-value` - The default expanded items. Used if `:value` is not provided.
  * `:disabled` - Whether the accordion is disabled. Defaults to `false`.
  * `:on-value-changed` - Handler for accordion value change event.
  * `:class` - Additional CSS classes.
  """
  attr :id, :string, required: true, doc: "Unique identifier for the accordion"
  attr :type, :string, values: ~w(single multiple), default: "single", doc: "Whether only one item can be open at a time"
  attr :value, :any, default: nil, doc: "The value(s) of the currently expanded item(s)"
  attr :"default-value", :any, default: nil, doc: "The default value(s) of the expanded item(s)"
  attr :disabled, :boolean, default: false, doc: "Whether the accordion is disabled"
  attr :"on-value-changed", :any, default: nil, doc: "Handler for accordion value change event"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def accordion(assigns) do
    # Collect event mappings
    event_map =
      add_event_mapping(%{}, assigns, "value-changed", :"on-value-changed")

    assigns =
      assigns
      |> assign(:event_map, Jason.encode!(event_map))
      |> assign(
        :options,
        Jason.encode!(%{
          type: assigns.type,
          value: assigns.value,
          defaultValue: assigns[:"default-value"],
          disabled: assigns.disabled
        })
      )

    ~H"""
    <div
      id={@id}
      class={classes(["w-full", @class])}
      data-component="accordion"
      data-state="idle"
      data-options={@options}
      data-event-mappings={@event_map}
      phx-hook="SaladUI"
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  An accordion item that contains a trigger and content.

  ## Options

  * `:value` - Required unique value for this accordion item.
  * `:disabled` - Whether this item is disabled. Defaults to `false`.
  * `:class` - Additional CSS classes.
  """
  attr :value, :string, required: true, doc: "Unique value for this accordion item"
  attr :disabled, :boolean, default: false, doc: "Whether this item is disabled"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def accordion_item(assigns) do
    ~H"""
    <div
      data-part="item"
      data-value={@value}
      data-disabled={to_string(@disabled)}
      data-state="closed"
      class={classes(["border-b border-border", @class])}
      tabindex="-1"
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The trigger element that expands/collapses an accordion item.

  ## Options

  * `:class` - Additional CSS classes.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def accordion_trigger(assigns) do
    ~H"""
    <button
      type="button"
      data-part="trigger"
      class={
        classes([
          "flex w-full justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          "text-sm",
          @class
        ])
      }
      tabindex="-1"
      aria-expanded="false"
      {@rest}
    >
      <span>{render_slot(@inner_block)}</span>
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
        class="h-4 w-4 shrink-0 transition-transform duration-200"
      >
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>
    """
  end

  @doc """
  The content element of an accordion item that shows when expanded.

  ## Options

  * `:class` - Additional CSS classes.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def accordion_content(assigns) do
    ~H"""
    <div
      data-part="content"
      data-state="closed"
      class={
        classes([
          "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
          @class
        ])
      }
      hidden
      {@rest}
    >
      <div class="pb-4 pt-0">
        {render_slot(@inner_block)}
      </div>
    </div>
    """
  end
end
