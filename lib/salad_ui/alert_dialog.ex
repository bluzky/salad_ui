defmodule SaladUI.AlertDialog do
  @moduledoc """
  Implement of Alert Dialog components
  """
  use SaladUI, :component

  @doc """
  Alert Dialog component

  ## Examples:

      <.alert_dialog>
         <.alert_dialog_trigger aschild>
           <button variant="outline">show dialog</button>
         </.alert_dialog_trigger>
         <.alert_dialog_content>
           <.alert_dialog_header>
             <.alert_dialog_title>are you absolutely sure?</.alert_dialog_title>
             <.alert_dialog_description>
               this action cannot be undone. this will permanently delete your
               account and remove your data from our servers.
             </.alert_dialog_description>
           </.alert_dialog_header>
           <.alert_dialog_footer>
             <.alert_dialog_cancel>cancel</.alert_dialog_cancel>
             <.alert_dialog_action>continue</.alert_dialog_action>
           </.alert_dialog_footer>
         </.alert_dialog_content>
       </.alert_dialog>
  """

  attr :id, :string,
    required: true,
    doc: "Id to identify alert dialog, alert_dialog_trigger use this id to trigger show dialog"

  attr :open, :boolean, default: false
  slot(:inner_block, required: true)

  def alert_dialog(assigns) do
    assigns = assign(assigns, :builder, %{open: assigns[:open], id: assigns[:id]})

    ~H"""
    <div
      phx-show-alert-dialog={show_alert_dialog(@builder)}
      phx-hide-alert-dialog={hide_alert_dialog(@builder)}
      class="inline-block relative"
      id={@id}
    >
      <%= render_slot(@inner_block, @builder) %>
    </div>
    """
  end

  @doc """
  Render
  """
  attr :builder, :map, required: true, doc: "Builder instance for alert dialog"
  attr(:class, :string, default: nil)
  slot(:inner_block, required: true)

  def alert_dialog_trigger(assigns) do
    ~H"""
    <div
      phx-click={JS.exec("phx-show-alert-dialog", to: "#" <> @builder.id)}
      class={
        classes([
          "",
          @class
        ])
      }
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Render
  """
  attr :builder, :map, required: true, doc: "Builder instance for alert dialog"
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def alert_dialog_content(assigns) do
    ~H"""
    <div
      data-state={(@builder.open && "open") || "closed"}
      class="alert-dialog-content group/alert-dialog hidden"
    >
      <div class="fixed inset-0 z-50 bg-black/80  group-data-[state=open]/alert-dialog:animate-in group-data-[state=closed]/alert-dialog:animate-out group-data-[state=closed]/alert-dialog:fade-out-0 group-data-[state=open]/alert-dialog:fade-in-0">
        <div
          class={
            classes([
              "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
              @class
            ])
          }
          {@rest}
        >
          <%= render_slot(@inner_block) %>
        </div>
      </div>
    </div>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

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
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def alert_dialog_title(assigns) do
    ~H"""
    <h2
      class={
        classes([
          "text-lg font-semibold",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </h2>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def alert_dialog_description(assigns) do
    ~H"""
    <p
      class={
        classes([
          "text-sm text-muted-foreground",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </p>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

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
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Render
  """
  attr :builder, :map, required: true, doc: "Builder instance for Alert Dialog"
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def alert_dialog_cancel(assigns) do
    assigns = assign(assigns, :variation_class, button_variant(%{variant: "outline"}))

    ~H"""
    <button
      phx-click={JS.exec("phx-hide-alert-dialog", to: "#" <> @builder.id)}
      class={
        classes([
          @variation_class,
          "mt-2 sm:mt-0",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </button>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def alert_dialog_action(assigns) do
    assigns = assign(assigns, :variation_class, button_variant(%{}))

    ~H"""
    <button
      class={
        classes([
          @variation_class,
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </button>
    """
  end

  defp show_alert_dialog(%{id: id}) do
    {"data-state", "open"}
    |> JS.set_attribute(to: "##{id} .alert-dialog-content")
    |> JS.show(to: "##{id} .alert-dialog-content", transition: {"_", "_", "_"}, time: 150)
    |> JS.add_class("overflow-hidden", to: "body")
    |> JS.focus_first(to: "##{id} .alert-dialog-content")
  end

  defp hide_alert_dialog(%{id: id}) do
    {"data-state", "closed"}
    |> JS.set_attribute(to: "##{id} .alert-dialog-content")
    |> JS.hide(to: "##{id} .alert-dialog-content", transition: {"_", "_", "_"}, time: 130)
    |> JS.remove_class("overflow-hidden", to: "body")
    |> JS.pop_focus()
  end
end
