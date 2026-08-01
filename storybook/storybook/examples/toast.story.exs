defmodule Storybook.Examples.Toast do
  @moduledoc false
  use PhoenixStorybook.Story, :example

  import SaladUI.Button
  import SaladUI.Toast

  @positions ~w(top-left top-center top-right bottom-left bottom-center bottom-right)

  @impl true
  def mount(_params, _session, socket) do
    socket =
      socket
      |> assign(:position, "bottom-right")
      |> assign(:expand, false)
      |> assign(:visible_toasts, 3)

    {:ok, socket}
  end

  @impl true
  def render(assigns) do
    assigns = assign(assigns, :positions, @positions)

    ~H"""
    <.toaster
      id="toaster"
      position={@position}
      flash={@flash}
      expand={@expand}
      visible-toasts={@visible_toasts}
    >
      <:template name="new-follower">
        <p class="text-sm font-medium leading-none">🎉 Ada Lovelace followed you</p>
      </:template>
    </.toaster>

    <div class="space-y-10">
      <.section
        title="Push toast"
        description="Trigger toasts from handle_event/3, or a regular Phoenix.LiveView.put_flash/3 call."
      >
        <div class="flex flex-wrap gap-2">
          <.button size="sm" variant="outline" phx-click="toast_default">Default</.button>
          <.button size="sm" variant="outline" phx-click="toast_success">Success</.button>
          <.button size="sm" variant="outline" phx-click="toast_error">Error</.button>
          <.button size="sm" variant="outline" phx-click="toast_warning">Warning</.button>
          <.button size="sm" variant="outline" phx-click="toast_info">Info</.button>
          <.button size="sm" variant="outline" phx-click="toast_with_description">
            With description
          </.button>
          <.button size="sm" variant="outline" phx-click="toast_with_action">With action</.button>
          <.button size="sm" variant="outline" phx-click="toast_template">Rich template</.button>
          <.button size="sm" variant="outline" phx-click="toast_dismiss_all">Dismiss all</.button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-muted-foreground">Phoenix flash:</span>
          <.button size="sm" variant="outline" phx-click="flash_info">put_flash(:info, ...)</.button>
          <.button size="sm" variant="outline" phx-click="flash_error">put_flash(:error, ...)</.button>
          <span class="text-xs text-muted-foreground">
            renders via the flash bridge — no toast-specific code in the handler
          </span>
        </div>
      </.section>

      <.section
        title="Custom colorful toast"
        description="SaladUI ships no predefined per-variant colors — each button below sets its own via a per-toast color/class param."
      >
        <div class="flex flex-wrap gap-2">
          <.button size="sm" variant="outline" phx-click="toast_colorful_success">Success</.button>
          <.button size="sm" variant="outline" phx-click="toast_colorful_error">Error</.button>
          <.button size="sm" variant="outline" phx-click="toast_colorful_warning">Warning</.button>
          <.button size="sm" variant="outline" phx-click="toast_colorful_info">Info</.button>
          <.button size="sm" variant="outline" phx-click="toast_custom_card">Custom card class</.button>
        </div>
      </.section>

      <.section title="Positions" description="Move the toaster to any of the 6 supported corners.">
        <div class="flex flex-wrap items-center gap-2">
          <.button
            :for={position <- @positions}
            size="sm"
            variant="outline"
            phx-click="set_position"
            phx-value-position={position}
          >
            {position}
          </.button>
        </div>
      </.section>

      <.section
        title="Stack options"
        description="Toggle between a collapsed peek stack and a fully expanded list, and cap how many cards stay visible before collapsing."
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-muted-foreground">Stack:</span>
          <.button size="sm" variant="outline" phx-click="set_expand" phx-value-expand="false">
            Stacked
          </.button>
          <.button size="sm" variant="outline" phx-click="set_expand" phx-value-expand="true">
            Full
          </.button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-muted-foreground">Visible toasts:</span>
          <.button
            :for={n <- [1, 3, 5]}
            size="sm"
            variant="outline"
            phx-click="set_visible_toasts"
            phx-value-n={n}
          >
            {n}
          </.button>
        </div>

        <.button size="sm" variant="outline" phx-click="spawn_five">Spawn 5 toasts</.button>
      </.section>
    </div>
    """
  end

  attr :title, :string, required: true
  attr :description, :string, default: nil
  slot :inner_block, required: true

  defp section(assigns) do
    ~H"""
    <div class="space-y-3">
      <div>
        <h2 class="text-lg font-semibold">{@title}</h2>
        <p :if={@description} class="text-sm text-muted-foreground">{@description}</p>
      </div>
      <div class="space-y-3">
        {render_slot(@inner_block)}
      </div>
    </div>
    """
  end

  @impl true
  def handle_event("set_position", %{"position" => position}, socket) when position in @positions do
    socket =
      socket
      |> assign(:position, position)
      |> toast("Now showing toasts at #{position}")

    {:noreply, socket}
  end

  def handle_event("set_expand", %{"expand" => expand}, socket) do
    {:noreply, assign(socket, :expand, expand == "true")}
  end

  def handle_event("set_visible_toasts", %{"n" => n}, socket) do
    {:noreply, assign(socket, :visible_toasts, String.to_integer(n))}
  end

  def handle_event("spawn_five", _params, socket) do
    socket = Enum.reduce(1..5, socket, fn i, socket -> toast(socket, "Toast ##{i}") end)
    {:noreply, socket}
  end

  # A plain Phoenix.LiveView.put_flash/3 call — the same one generators
  # scaffold into every LiveView by default — with no toast-specific code at
  # all. It reaches the screen as a toast purely because <.toaster
  # flash={@flash}> is rendered above; see SaladUI.Toast.toast_flash/1.
  def handle_event("flash_info", _params, socket) do
    {:noreply, put_flash(socket, :info, "This is a regular Phoenix flash message.")}
  end

  def handle_event("flash_error", _params, socket) do
    {:noreply, put_flash(socket, :error, "This error came from put_flash/3, not the toast API.")}
  end

  def handle_event("toast_default", _params, socket) do
    {:noreply, toast(socket, "This is a toast notification.")}
  end

  def handle_event("toast_success", _params, socket) do
    {:noreply, toast_success(socket, "Saved!")}
  end

  def handle_event("toast_error", _params, socket) do
    {:noreply, toast_error(socket, "Something went wrong.")}
  end

  def handle_event("toast_warning", _params, socket) do
    {:noreply, toast_warning(socket, "Your plan expires soon.")}
  end

  def handle_event("toast_info", _params, socket) do
    {:noreply, toast_info(socket, "A new version is available.")}
  end

  def handle_event("toast_with_description", _params, socket) do
    socket = toast(socket, "Event created", description: "Monday, January 3rd at 6:00pm")
    {:noreply, socket}
  end

  def handle_event("toast_with_action", _params, socket) do
    socket =
      toast(socket, "File deleted",
        action: %{label: "Undo", event: "undo_delete"},
        cancel: %{label: "Dismiss"}
      )

    {:noreply, socket}
  end

  def handle_event("undo_delete", _params, socket) do
    {:noreply, toast_success(socket, "Delete undone")}
  end

  def handle_event("toast_template", _params, socket) do
    {:noreply, toast(socket, template: "new-follower")}
  end

  def handle_event("toast_dismiss_all", _params, socket) do
    {:noreply, toast_dismiss(socket)}
  end

  # `color` is a per-toast override — no toaster-wide setup needed, just set
  # it on the call site that wants a colorful icon.
  def handle_event("toast_colorful_success", _params, socket) do
    socket =
      toast_success(socket, "Saved!",
        color:
          "border-emerald-500/30 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950 dark:text-emerald-200"
      )

    {:noreply, socket}
  end

  def handle_event("toast_colorful_error", _params, socket) do
    socket =
      toast_error(socket, "Something went wrong.",
        color: "border-rose-500/30 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-950 dark:text-rose-200"
      )

    {:noreply, socket}
  end

  def handle_event("toast_colorful_warning", _params, socket) do
    socket =
      toast_warning(socket, "Your plan expires soon.",
        color:
          "border-amber-500/30 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950 dark:text-amber-200"
      )

    {:noreply, socket}
  end

  def handle_event("toast_colorful_info", _params, socket) do
    socket =
      toast_info(socket, "A new version is available.",
        color: "border-sky-500/30 bg-sky-50 text-sky-900 dark:border-sky-500/40 dark:bg-sky-950 dark:text-sky-200"
      )

    {:noreply, socket}
  end

  # `class` is a per-toast override — this is how you'd rebuild the old
  # built-in rich-colors card tint yourself, entirely on the call site.
  def handle_event("toast_custom_card", _params, socket) do
    socket =
      toast(socket, "Fully custom card",
        description: "The class param overrides the whole card, icon included.",
        class:
          "!border-fuchsia-500/30 !bg-fuchsia-50 !text-fuchsia-900 dark:!border-fuchsia-500/40 dark:!bg-fuchsia-950 dark:!text-fuchsia-200"
      )

    {:noreply, socket}
  end
end
