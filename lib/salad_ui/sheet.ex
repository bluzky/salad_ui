defmodule SaladUI.Sheet do
  @moduledoc """
  Implementation of Sheet component for SaladUI framework.

  Sheets are like dialogs that appear from the edge of the screen. They can be configured
  to slide in from different sides of the viewport.

  ## Examples:

      <.sheet id="user-sheet">
        <.sheet_trigger>
          <.button variant="outline">Open Sheet</.button>
        </.sheet_trigger>
        <.sheet_content side="right">
          <.sheet_header>
            <.sheet_title>Edit profile</.sheet_title>
            <.sheet_description>
              Make changes to your profile here. Click save when you're done.
            </.sheet_description>
          </.sheet_header>
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <.label for="name" class="text-right">Name</.label>
              <.input id="name" value="John Doe" class="col-span-3" />
            </div>
          </div>
          <.sheet_footer>
            <.button type="submit">Save changes</.button>
          </.sheet_footer>
        </.sheet_content>
      </.sheet>
  """
  use SaladUI, :component

  @doc """
  The main sheet component that manages state and positioning.

  ## Options

  * `:id` - Required unique identifier for the sheet.
  * `:open` - Whether the sheet is initially open. Defaults to `false`.
  * `:on-open` - Handler for sheet open event.
  * `:on-close` - Handler for sheet close event.
  * `:class` - Additional CSS classes.
  """
  attr :id, :string, required: true, doc: "Unique identifier for the sheet"
  attr :open, :boolean, default: false, doc: "Whether the sheet is initially open"
  attr :class, :string, default: nil
  attr :"close-on-outside-click", :boolean, default: true

  attr :"on-open", :any, default: nil, doc: "Handler for sheet open event"
  attr :"on-close", :any, default: nil, doc: "Handler for sheet close event"
  attr :rest, :global
  slot :inner_block, required: true

  def sheet(assigns) do
    # Collect event mappings
    event_map =
      %{}
      |> add_event_mapping(assigns, "opened", :"on-open")
      |> add_event_mapping(assigns, "closed", :"on-close")

    assigns =
      assigns
      |> assign(:event_map, json(event_map))
      |> assign(:initial_state, if(assigns.open, do: "open", else: "closed"))
      |> assign(
        :options,
        json(%{
          animations: get_animation_config(),
          closeOnOutsideClick: assigns[:"close-on-outside-click"]
        })
      )

    ~H"""
    <div
      id={@id}
      class={classes(["relative inline-block", @class])}
      data-component="dialog"
      data-state={@initial_state}
      data-event-mappings={@event_map}
      data-options={@options}
      data-part="root"
      phx-hook="SaladUI"
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The trigger element that opens the sheet.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def sheet_trigger(assigns) do
    ~H"""
    <div data-part="trigger" data-action="open" class={classes(["", @class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The sheet content that appears when triggered.

  ## Options

  * `:side` - The side from which the sheet appears (top, right, bottom, left). Defaults to `"right"`.
  * `:class` - Additional CSS classes to customize dimensions and appearance.
  """
  attr :class, :string, default: nil
  attr :side, :string, values: ~w(top right bottom left), default: "right", doc: "The side from which the sheet appears"
  attr :rest, :global
  slot :inner_block, required: true

  def sheet_content(assigns) do
    assigns = assign(assigns, :variant_class, sheet_variants(assigns))

    ~H"""
    <div data-part="content" tabindex="0" hidden>
      <div
        data-part="overlay"
        class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />

      <div
        data-part="content-panel"
        data-side={@side}
        class={
          classes([
            "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            @variant_class,
            @class
          ])
        }
        {@rest}
      >
        <div class="h-full flex flex-col">
          {render_slot(@inner_block)}
        </div>

        <button
          type="button"
          data-part="close-trigger"
          data-action="close"
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
          <span class="sr-only">Close</span>
        </button>
      </div>
    </div>
    """
  end

  @doc """
  Renders a sheet header section for title and description.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def sheet_header(assigns) do
    ~H"""
    <div class={classes(["flex flex-col space-y-1.5 text-center sm:text-left", @class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Renders a sheet title within the header section.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def sheet_title(assigns) do
    ~H"""
    <h3 class={classes(["flex flex-col space-y-2 text-center sm:text-left", @class])} {@rest}>
      {render_slot(@inner_block)}
    </h3>
    """
  end

  @doc """
  Renders a sheet description within the header section.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def sheet_description(assigns) do
    ~H"""
    <p class={classes(["text-sm text-muted-foreground", @class])} {@rest}>
      {render_slot(@inner_block)}
    </p>
    """
  end

  @doc """
  Renders a footer section for the sheet, typically containing actions.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def sheet_footer(assigns) do
    ~H"""
    <div
      class={classes(["flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", @class])}
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The close button for the sheet.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def sheet_close(assigns) do
    ~H"""
    <div data-part="close-trigger" data-action="close" class={classes(["", @class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  defp get_animation_config do
    %{
      "open_to_closed" => %{
        duration: 130,
        target_part: "content"
      }
    }
  end

  @variants %{
    side: %{
      "top" => "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
      "bottom" =>
        "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
      "left" =>
        "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
      "right" =>
        "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
    }
  }

  defp sheet_variants(props) do
    variants =
      Map.take(props, ~w(side)a)

    Enum.map_join(variants, " ", fn {key, value} -> @variants[key][value] end)
  end
end
