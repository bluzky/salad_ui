defmodule SaladUI.Toast do
  @moduledoc """
  Toast notifications, parity target [Sonner](https://sonner.emilkowal.ski/).

  Unlike every other SaladUI component, `toaster/1` does not manage a single
  open/closed state machine — it mounts once per page and manages an unbounded,
  dynamically created stack of independent toast cards entirely in JavaScript
  (`assets/salad_ui/components/toast.js`).

  ## Mounting

      <.toaster id="toaster" position="bottom-right" />

  ## Triggering toasts

  Use the helpers below from any `handle_event/3`:

      def handle_event("save", _params, socket) do
        {:noreply, SaladUI.Toast.toast_success(socket, "Saved!")}
      end

  ## Rich-content toasts

  Declare a `:template` next to the toaster and reference it by name:

      <.toaster id="toaster">
        <:template name="new-follower">
          <img src={@avatar_url} class="size-8 rounded-full" />
          <p><%= @name %> followed you</p>
        </:template>
      </.toaster>

      SaladUI.Toast.toast(socket, template: "new-follower")

  ## Customization

  SaladUI ships no predefined per-variant palette — every toast renders in the
  card's neutral default (`border-border bg-background text-foreground`)
  unless you opt in, either toaster-wide or per call.

  Toaster-wide, applied to every card of that variant:

      <.toaster
        id="toaster"
        colors={%{success: "border-emerald-500/30 bg-emerald-50 text-emerald-900"}}
      />

  Per-toast, overriding the toaster-wide default for just this call:

      SaladUI.Toast.toast_success(socket, "Saved!",
        color: "border-emerald-500/30 bg-emerald-50 text-emerald-900"
      )

  `color`/`colors` replace the card's default border/background/text as one
  unit — the icon and title inherit the resulting text color, while the
  description keeps its own muted color. The toaster's `class` attr and a
  per-toast `class` opt instead *append* to the default classes, so reach for
  `!`-prefixed utilities there to reliably win the cascade:

      SaladUI.Toast.toast(socket, "Something broke",
        class: "!border-fuchsia-500/30 !bg-fuchsia-50 !text-fuchsia-900"
      )

  `unstyled: true` drops every built-in class, leaving bare `data-part`
  elements for `class` to style from scratch:

      SaladUI.Toast.toast(socket, "Bare toast", unstyled: true, class: "my-toast")

  `action`/`cancel` accept an optional `value` map, merged into the event
  payload pushed back to the LiveView (alongside `id`):

      SaladUI.Toast.toast(socket, "File deleted",
        action: %{label: "Undo", event: "undo_delete", value: %{file_id: file.id}},
        cancel: %{label: "Dismiss"}
      )

      def handle_event("undo_delete", %{"id" => _id, "file_id" => file_id}, socket) do
        # restore file_id
        {:noreply, socket}
      end

  ## Phoenix flash integration

  Pass `flash` to render flash messages as toasts instead of a second
  notification system:

      <.toaster id="toaster" flash={@flash} />
  """
  use SaladUI, :component

  @doc """
  Mounts the toast stack. Render exactly once per page (typically the root layout).

  ## Server commands

  * `"add"` - Creates and mounts a new toast card, arms its timer.
  * `"update"` - Patches an existing card in place, keyed by `id`.
  * `"dismiss"` - Plays the exit animation and removes a card (or every card if `id` is omitted).
  * `"pause-all"` / `"resume-all"` - Pauses/resumes every timer.

  ## Component events

  * `:on-dismiss` - Fired whenever a toast is removed, with `%{id:, reason:}` in the payload.
  """
  attr :id, :string, default: "toaster"

  attr :position, :string,
    values: ~w(top-left top-center top-right bottom-left bottom-center bottom-right),
    default: "bottom-right"

  attr :expand, :boolean, default: false, doc: "Stack fully expanded instead of collapsed"
  attr :"visible-toasts", :integer, default: 3, doc: "Max stacked cards before overflow is collapsed"
  attr :gap, :integer, default: 14, doc: "px gap between stacked toasts when expanded"
  attr :"swipe-direction", :string, values: ~w(up down left right) ++ [nil], default: nil
  attr :width, :integer, default: 356, doc: "Fixed card width in px"
  attr :offset, :any, default: 24, doc: "px gap from the viewport edge, or a %{top:, right:, bottom:, left:} map"
  attr :"mobile-offset", :any, default: 16, doc: "Same as :offset, applied below the 600px breakpoint"
  attr :hotkey, :string, default: "Alt+T", doc: "Keyboard shortcut that moves focus into the front toast"
  attr :icons, :map, default: %{}, doc: ~S(toaster-wide icon overrides, e.g. %{success: "hero-sparkles"})

  attr :colors, :map,
    default: %{},
    doc:
      ~S(per-variant toast color override, e.g. %{success: "border-emerald-500/30 bg-emerald-50 text-emerald-900"} ) <>
        "— replaces the card's default border/background/text (icon + title inherit the text color; " <>
        "description keeps its own muted color) for that variant. No variant ships with a predefined color."

  attr :class, :string,
    default: nil,
    doc:
      "extra classes merged onto every card — use `!`-prefixed utilities, e.g. " <>
        ~S("!bg-secondary", to reliably override a default color class)

  attr :flash, :map, default: nil, doc: "when given, also renders the flash-to-toast bridge (see toast_flash/1)"

  attr :"on-dismiss", :any,
    default: nil,
    doc: "Handler fired when any toast is removed. Payload includes `id` and `reason`."

  slot :template, doc: "named rich-content template, referenced from `toast(socket, template: name)`" do
    attr :name, :string, required: true
  end

  def toaster(assigns) do
    event_map = event_mappings(assigns)
    offset = normalize_offset(assigns.offset)
    mobile_offset = normalize_offset(assigns[:"mobile-offset"])

    options = %{
      position: assigns.position,
      expand: assigns.expand,
      visibleToasts: assigns[:"visible-toasts"],
      gap: assigns.gap,
      swipeDirection: assigns[:"swipe-direction"],
      icons: assigns.icons,
      colors: assigns.colors,
      class: assigns.class,
      hotkey: assigns.hotkey
    }

    assigns =
      assigns
      |> assign(:event_map, json(event_map))
      |> assign(:options, json(options))
      |> assign(:viewport_class, viewport_class(assigns.position))
      |> assign(:viewport_style, viewport_style(assigns.width, offset, mobile_offset, assigns.gap))

    ~H"""
    <div
      id={@id}
      data-component="toast"
      data-options={@options}
      data-event-mappings={@event_map}
      phx-hook="SaladUI"
      phx-update="ignore"
      data-part="root"
    >
      <ol
        data-part="viewport"
        data-position={@position}
        role="region"
        aria-label="Notifications"
        style={@viewport_style}
        class={@viewport_class}
      >
      </ol>

      <template :for={tpl <- @template} data-part="toast-template" data-name={tpl.name}>{render_slot(
        tpl
      )}</template>
    </div>

    <.toast_flash
      :if={@flash}
      id={"#{@id}-flash-bridge"}
      flash={@flash}
      toaster={@id}
    />
    """
  end

  @doc """
  Bridges `@flash` into toasts on the given `toaster` without patching the
  toaster's own DOM subtree (which would tear down its live stack/timers).

  Usually rendered implicitly via `toaster/1`'s `:flash` attribute; call it
  directly when the toaster and the LiveView holding `@flash` are mounted
  separately.
  """
  attr :id, :string, default: "toast-flash-bridge"
  attr :flash, :map, required: true
  attr :toaster, :string, default: "toaster"

  def toast_flash(assigns) do
    entries =
      for {kind, msg} <- assigns.flash,
          msg not in [nil, ""],
          do: %{kind: to_string(kind), message: msg}

    assigns = assign(assigns, :entries, json(entries))

    ~H"""
    <div
      id={@id}
      data-component="toast-flash"
      data-toaster={@toaster}
      data-entries={@entries}
      phx-hook="SaladUI"
      data-part="root"
      hidden
    >
    </div>
    """
  end

  @doc """
  Push a toast to a mounted `<.toaster>` (see `toaster/1`).

  `message` is either a string, used as the toast's `title`, or (for
  template-based toasts, see `toaster/1`'s `:template` slot) a keyword
  list/map of opts with no title:

      socket = SaladUI.Toast.toast(socket, "Saved!")
      socket = SaladUI.Toast.toast(socket, "Saved!", description: "Changes are live")
      socket = SaladUI.Toast.toast(socket, template: "new-follower", variant: "default")

  Call `toast/4` directly to target a `<.toaster>` other than the default `"toaster"` id.
  See `toaster/1`'s moduledoc for the full opts table.
  """
  def toast(socket, message, opts \\ [])

  def toast(socket, message, opts) when is_binary(message) or is_nil(message) do
    toast(socket, "toaster", message, opts)
  end

  def toast(socket, message_opts, _opts) do
    toast(socket, "toaster", nil, message_opts)
  end

  def toast(socket, toaster_id, message, opts) do
    SaladUI.LiveView.send_command(socket, toaster_id, "add", build_toast_params(message, opts))
  end

  @doc """
  Drop-in-shaped alongside `Phoenix.LiveView.put_flash/3` /
  `Phoenix.Controller.put_flash/3` — same arity, same call sites, works on both.

  On a `%Socket{}` this behaves like `toast/3` with `variant: kind`. On a
  `%Plug.Conn{}` (no toaster hook exists to push a command to — the page
  hasn't rendered yet) it falls back to `Phoenix.Controller.put_flash/3`, so a
  controller action followed by a redirect still shows *something* instead of
  silently dropping the message; once the LiveView the redirect lands on
  renders `<.toaster flash={@flash} />`, the flash bridge (`toast_flash/1`)
  picks it up and converts it to a real toast on connect.
  """
  def put_toast(conn_or_socket, kind, message, opts \\ [])

  def put_toast(%Plug.Conn{} = conn, kind, message, _opts) do
    Phoenix.Controller.put_flash(conn, kind, message)
  end

  def put_toast(%Phoenix.LiveView.Socket{} = socket, kind, message, opts) do
    toast(socket, message, Keyword.put(opts, :variant, to_string(kind)))
  end

  @doc "Same as `toast/3`, with `variant: \"success\"`."
  def toast_success(socket, message, opts \\ []), do: toast(socket, message, Keyword.put(opts, :variant, "success"))

  @doc "Same as `toast/3`, with `variant: \"error\"`."
  def toast_error(socket, message, opts \\ []), do: toast(socket, message, Keyword.put(opts, :variant, "error"))

  @doc "Same as `toast/3`, with `variant: \"warning\"`."
  def toast_warning(socket, message, opts \\ []), do: toast(socket, message, Keyword.put(opts, :variant, "warning"))

  @doc "Same as `toast/3`, with `variant: \"info\"`."
  def toast_info(socket, message, opts \\ []), do: toast(socket, message, Keyword.put(opts, :variant, "info"))

  @doc "Transitions an existing toast (by `id`) to a new variant/content, patched in place."
  def toast_update(socket, id, opts) do
    params =
      opts
      |> Keyword.get(:title)
      |> build_toast_params(opts)
      |> Map.put(:id, id)

    SaladUI.LiveView.send_command(socket, "toaster", "update", params)
  end

  @doc "Removes one toast, or every toast on the given toaster if `id` is omitted."
  def toast_dismiss(socket, toaster_id \\ "toaster", id \\ nil) do
    params = if id, do: %{id: id}, else: %{}
    SaladUI.LiveView.send_command(socket, toaster_id, "dismiss", params)
  end

  defp build_toast_params(message, opts) do
    opts
    |> Map.new()
    |> Map.put_new(:id, generate_toast_id())
    |> Map.update(:variant, "default", &to_string/1)
    |> Map.update(:duration, nil, fn
      :infinity -> "infinity"
      other -> other
    end)
    |> drop_if_nil(:duration)
    |> maybe_put_title(message)
  end

  defp drop_if_nil(map, key) do
    if Map.get(map, key) == nil, do: Map.delete(map, key), else: map
  end

  defp maybe_put_title(params, nil), do: params
  defp maybe_put_title(params, message), do: Map.put_new(params, :title, message)

  defp generate_toast_id do
    "toast-" <> Integer.to_string(System.unique_integer([:positive, :monotonic]))
  end

  defp normalize_offset(value) when is_integer(value) or is_binary(value) do
    %{top: value, right: value, bottom: value, left: value}
  end

  defp normalize_offset(%{} = value) do
    %{
      top: Map.get(value, :top, 0),
      right: Map.get(value, :right, 0),
      bottom: Map.get(value, :bottom, 0),
      left: Map.get(value, :left, 0)
    }
  end

  defp viewport_style(width, offset, mobile_offset, gap) do
    style([
      %{
        "--toast-width": px(width),
        "--toast-gap": px(gap),
        "--offset-t": px(offset.top),
        "--offset-r": px(offset.right),
        "--offset-b": px(offset.bottom),
        "--offset-l": px(offset.left),
        "--mobile-offset-t": px(mobile_offset.top),
        "--mobile-offset-r": px(mobile_offset.right),
        "--mobile-offset-b": px(mobile_offset.bottom),
        "--mobile-offset-l": px(mobile_offset.left),
        gap: px(gap)
      }
    ])
  end

  defp px(value) when is_binary(value), do: value
  defp px(value), do: "#{value}px"

  defp viewport_class(position) do
    classes([
      "group/toast-viewport fixed z-[9999] flex flex-col outline-hidden",
      "w-[var(--toast-width)] max-[600px]:w-[calc(100%-var(--mobile-offset-l)-var(--mobile-offset-r))]",
      vertical_class(position),
      horizontal_class(position)
    ])
  end

  defp vertical_class("top-" <> _) do
    "flex-col-reverse top-[var(--offset-t)] max-[600px]:top-[var(--mobile-offset-t)]"
  end

  defp vertical_class(_bottom_position) do
    "bottom-[var(--offset-b)] max-[600px]:bottom-[var(--mobile-offset-b)]"
  end

  defp horizontal_class(position) do
    cond do
      String.ends_with?(position, "left") ->
        "left-[var(--offset-l)] items-start max-[600px]:left-[var(--mobile-offset-l)]"

      String.ends_with?(position, "right") ->
        "right-[var(--offset-r)] items-end max-[600px]:right-[var(--mobile-offset-r)]"

      true ->
        "left-1/2 -translate-x-1/2 items-center"
    end
  end
end
