defmodule SaladUI.AlertDialog do
  @moduledoc """
  Implementation of Alert Dialog component for SaladUI framework.

  Alert Dialogs are modal dialogs that require a user action before they can be dismissed,
  used to confirm user decisions or provide critical information.

  ## Examples:

      <.alert_dialog id="delete-confirmation">
        <.alert_dialog_trigger>
          <.button variant="destructive">Delete Account</.button>
        </.alert_dialog_trigger>
        <.alert_dialog_content>
          <.alert_dialog_header>
            <.alert_dialog_title>Are you absolutely sure?</.alert_dialog_title>
            <.alert_dialog_description>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </.alert_dialog_description>
          </.alert_dialog_header>
          <.alert_dialog_footer>
            <.alert_dialog_cancel>Cancel</.alert_dialog_cancel>
            <.alert_dialog_action>Continue</.alert_dialog_action>
          </.alert_dialog_footer>
        </.alert_dialog_content>
      </.alert_dialog>
  """
  use SaladUI, :component

  @doc """
  The main alert dialog component.

  ## Options

  * `:id` - Required unique identifier for the alert dialog.
  * `:open` - Whether the alert dialog is initially open. Defaults to `false`.
  * `:on-open` - Handler for alert dialog open event.
  * `:on-close` - Handler for alert dialog close event.
  * `:class` - Additional CSS classes.
  """
  attr :id, :string, required: true, doc: "Unique identifier for the alert dialog"
  attr :open, :boolean, default: false, doc: "Whether the alert dialog is initially open"
  attr :"on-open", :any, default: nil, doc: "Handler for alert dialog open event"
  attr :"on-close", :any, default: nil, doc: "Handler for alert dialog close event"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def alert_dialog(assigns) do
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
          animations: get_animation_config()
        })
      )

    ~H"""
    <div
      id={@id}
      class={classes(["relative z-50 group/alert-dialog", @class])}
      data-component="dialog"
      data-options={@options}
      data-state={@initial_state}
      data-event-mappings={@event_map}
      phx-hook="SaladUI"
      data-part="root"
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The trigger element that opens the alert dialog.
  """
  attr :class, :string, default: nil
  attr :as_tag, :any, default: "div"
  slot :inner_block, required: true
  attr :rest, :global

  def alert_dialog_trigger(assigns) do
    ~H"""
    <.dynamic
      data-part="trigger"
      data-action="open"
      tag={@as_tag}
      class={classes(["", @class])}
      {@rest}
    >
      {render_slot(@inner_block)}
    </.dynamic>
    """
  end

  @doc """
  The content container of the alert dialog.
  """
  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def alert_dialog_content(assigns) do
    ~H"""
    <div data-part="content" tabindex="0" hidden class="z-50">
      <div
        data-part="overlay"
        class="fixed inset-0 bg-black/80 data-[state=open]/dialog:animate-in data-[state=closed]/dialog:animate-out data-[state=closed]/dialog:fade-out-0 data-[state=open]/dialog:fade-in-0 z-50"
      />
      <div
        data-part="content-panel"
        class={
          classes([
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            @class
          ])
        }
        {@rest}
      >
        {render_slot(@inner_block)}

        <button
          type="button"
          data-part="close-trigger"
          data-action="close"
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]/dialog:bg-accent data-[state=open]/dialog:text-muted-foreground"
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
  The header section of the alert dialog.
  """
  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def alert_dialog_header(assigns) do
    ~H"""
    <div
      class={
        classes([
          "flex flex-col space-y-2 text-center sm:text-left",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The title of the alert dialog.
  """
  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def alert_dialog_title(assigns) do
    ~H"""
    <h2
      data-part="title"
      class={
        classes([
          "text-lg font-semibold",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </h2>
    """
  end

  @doc """
  The description of the alert dialog.
  """
  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def alert_dialog_description(assigns) do
    ~H"""
    <p
      data-part="description"
      class={
        classes([
          "text-sm text-muted-foreground",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </p>
    """
  end

  @doc """
  The footer section of the alert dialog containing action buttons.
  """
  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def alert_dialog_footer(assigns) do
    ~H"""
    <div
      class={
        classes([
          "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  The cancel button for the alert dialog.
  """
  attr :class, :string, default: nil
  attr :variant, :string, values: ~w(default secondary destructive outline ghost link), default: "outline"
  attr :size, :string, values: ~w(default sm lg icon), default: "default"
  attr :rest, :global
  slot :inner_block, required: true

  def alert_dialog_cancel(assigns) do
    assigns = assign(assigns, :variant_class, button_variant(%{variant: assigns.variant, size: assigns.size}))

    ~H"""
    <button
      type="button"
      data-part="cancel"
      data-action="close"
      class={
        classes([
          @variant_class,
          "mt-2 sm:mt-0",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </button>
    """
  end

  @doc """
  The primary action button for the alert dialog.
  """
  attr :class, :string, default: nil
  attr :variant, :string, values: ~w(default secondary destructive outline ghost link), default: "default"
  attr :size, :string, values: ~w(default sm lg icon), default: "default"
  attr :rest, :global
  slot :inner_block, required: true

  def alert_dialog_action(assigns) do
    assigns = assign(assigns, :variant_class, button_variant(%{variant: assigns.variant, size: assigns.size}))

    ~H"""
    <button
      type="button"
      data-part="action"
      class={
        classes([
          @variant_class,
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </button>
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
end
