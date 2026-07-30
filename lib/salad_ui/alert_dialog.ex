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

  ## Component events

  Alert dialog emits these client events through `on-*` attributes:

  * `:on-open` - Maps the `opened` event. Fired when dialog enters open state.
  * `:on-close` - Maps the `closed` event. Fired when dialog enters closed state.

  Event handlers can be a server event name string or a `%Phoenix.LiveView.JS{}` command:

      <.alert_dialog
        id="delete-confirmation"
        on-open="delete_dialog_opened"
        on-close={JS.push("delete_dialog_closed")}
      >
        ...
      </.alert_dialog>

  ## Server commands

  Alert dialog supports these commands through `SaladUI.LiveView.send_command/4`:

  * `"open"` - Opens the dialog.
  * `"close"` - Closes the dialog.

      def handle_event("confirm_delete", _params, socket) do
        socket = SaladUI.LiveView.send_command(socket, "delete-confirmation", "open")
        {:noreply, socket}
      end
  """
  use SaladUI, :component

  @doc """
  The main alert dialog component.

  ## Options

  * `:id` - Required unique identifier for the alert dialog.
  * `:open` - Whether the alert dialog is initially open. Defaults to `false`.
  * `:on-open` - Handler for `opened` event. Accepts a server event name or `%Phoenix.LiveView.JS{}`.
  * `:on-close` - Handler for `closed` event. Accepts a server event name or `%Phoenix.LiveView.JS{}`.
  * `:class` - Additional CSS classes.

  ## Component events

  * `opened` - Emitted when the dialog opens. Mapped by `:on-open`.
  * `closed` - Emitted when the dialog closes. Mapped by `:on-close`.

  ## Server commands

  Use `SaladUI.LiveView.send_command(socket, id, command)` with:

  * `"open"` - Opens the dialog.
  * `"close"` - Closes the dialog.
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
          animations: get_animation_config(),
          role: "alertdialog"
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
  attr :as, :any, default: "div"
  slot :inner_block, required: true
  attr :rest, :global

  def alert_dialog_trigger(assigns) do
    ~H"""
    <.dynamic data-part="trigger" data-action="open" tag={@as} class={classes(["", @class])} {@rest}>
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
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
            @class
          ])
        }
        {@rest}
      >
        {render_slot(@inner_block)}
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
      data-action="close"
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
