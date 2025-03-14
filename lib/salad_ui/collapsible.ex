defmodule SaladUI.Collapsible do
  @moduledoc """
  Implementation of Collapsible component for SaladUI framework.

  This component allows content to be shown or hidden with smooth animations,
  accessibility support, and keyboard navigation.

  ## Examples:

      <.collapsible id="collapsible-1" open>
        <.collapsible_trigger>
          <.button variant="outline">Show content</.button>
        </.collapsible_trigger>
        <.collapsible_content>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        </.collapsible_content>
      </.collapsible>

  """
  use SaladUI, :component

  @doc """
  The main collapsible component.

  ## Options

  * `:id` - Required unique identifier for the collapsible.
  * `:open` - Whether the collapsible is initially open. Defaults to `false`.
  * `:on-open` - Handler for collapsible open event.
  * `:on-close` - Handler for collapsible close event.
  * `:class` - Additional CSS classes.
  """
  attr :id, :string, required: true, doc: "Unique identifier for the collapsible"
  attr :open, :boolean, default: false, doc: "Whether the collapsible is initially open"
  attr :"on-open", :any, default: nil, doc: "Handler for collapsible open event"
  attr :"on-close", :any, default: nil, doc: "Handler for collapsible close event"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def collapsible(assigns) do
    # Collect event mappings
    event_map =
      %{}
      |> add_event_mapping(assigns, "opened", :"on-open")
      |> add_event_mapping(assigns, "closed", :"on-close")

    assigns =
      assigns
      |> assign(:event_map, Jason.encode!(event_map))
      |> assign(:initial_state, if(assigns.open, do: "open", else: "closed"))
      |> assign(
        :options,
        Jason.encode!(%{
          open: assigns.open,
          animations: get_animation_config()
        })
      )

    ~H"""
    <div
      id={@id}
      class={classes(["relative", @class])}
      data-component="collapsible"
      data-state={@initial_state}
      data-event-mappings={@event_map}
      data-options={@options}
      phx-hook="SaladUI"
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The trigger element that toggles the collapsible content.
  """
  attr :class, :string, default: nil
  attr :as_tag, :any, default: "div"
  attr :rest, :global
  slot :inner_block, required: true

  def collapsible_trigger(assigns) do
    ~H"""
    <.dynamic
      data-part="trigger"
      data-action="toggle"
      tag={@as_tag}
      class={classes(["cursor-pointer", @class])}
      {@rest}
    >
      {render_slot(@inner_block)}
    </.dynamic>
    """
  end

  @doc """
  The collapsible content that appears when triggered.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def collapsible_content(assigns) do
    ~H"""
    <div
      data-part="content"
      hidden
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

  defp get_animation_config do
    %{
      "closed_to_open" => %{
        animation: ["ease-out duration-200", "opacity-0", "opacity-100"],
        duration: 200,
        target_part: "content"
      },
      "open_to_closed" => %{
        animation: ["ease-out duration-200", "opacity-100", "opacity-70"],
        duration: 200,
        target_part: "content"
      }
    }
  end
end
