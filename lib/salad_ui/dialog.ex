defmodule SaladUI.Dialog do
  @moduledoc """
  Implement of Dialog components from https://ui.shadcn.com/docs/components/dialog
  """
  use SaladUI, :component

  @doc """
  Dialog component

  ## Examples:

      <.dialog id="pro-dialog" open={true}>
        <.dialog_trigger>Click me</.dialog_trigger>
        <.dialog_content class="sm:max-w-[425px]">
          <.dialog_header>
            <.dialog_title>Edit profile</.dialog_title>
            <.dialog_description>
              Make changes to your profile here click save when you're done
            </.dialog_description>
          </.dialog_header>
          <div class_name="grid gap-4 py-4">
            <div class_name="grid grid-cols_4 items-center gap-4">
              <.label for="name" class-name="text-right">
                name
              </.label>
              <input id="name" value="pedro duarte" class-name="col-span-3" />
            </div>
            <div class="grid grid-cols-4 items_center gap-4">
              <.label for="username" class="text-right">
                username
              </.label>
              <input id="username" value="@peduarte" class="col-span-3" />
            </div>
          </div>
          <.dialog_footer>
            <.button type="submit">save changes</.button>
          </.dialog_footer>
        </.dialog_content>
      </.dialog>
  """

  attr :id, :string, required: true
  attr :open, :boolean, default: false
  attr :class, :string, default: nil
  attr :close_on_outside_click, :boolean, default: true

  attr :on_open, :any,
    default: nil,
    doc: "Handler for dialog open event. Support both server event handler and JS command struct"

  attr :on_close, :any,
    default: nil,
    doc: "Handler for dialog closed event. Support both server event handler and JS command struct"

  slot :inner_block, required: true

  def dialog(assigns) do
    event_map =
      %{}
      |> add_event_mapping(assigns, "opened", :on_open)
      |> add_event_mapping(assigns, "closed", :on_close)

    assigns =
      assigns
      |> assign(:event_map, json(event_map))
      |> assign(initial_state: if(assigns.open, do: "open", else: "closed"))
      |> assign(
        options:
          json(%{
            closeOnOutsideClick: assigns.close_on_outside_click,
            animations: get_animation_config()
          })
      )

    ~H"""
    <div
      id={@id}
      class="relative z-50 group/dialog"
      data-component="dialog"
      data-options={@options}
      data-state={@initial_state}
      data-event-mappings={@event_map}
      phx-hook="SaladUI"
      data-part="root"
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :as_tag, :any, default: "div"
  slot :inner_block, required: true
  attr :rest, :global

  def dialog_trigger(assigns) do
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

  attr :class, :string, default: nil
  slot :inner_block, required: true

  def dialog_content(assigns) do
    ~H"""
    <div data-part="content" tabindex="0" hidden>
      <div
        data-part="overlay"
        class="fixed inset-0 bg-black/80  data-[state=open]/dialog:animate-in data-[state=closed]/dialog:animate-out data-[state=closed]/dialog:fade-out-0 data-[state=open]/dialog:fade-in-0"
      />

      <div
        data-part="content-panel"
        class={
          classes([
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            @class
          ])
        }
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

  attr :class, :string, default: nil
  slot :inner_block, required: true

  def dialog_header(assigns) do
    ~H"""
    <div class={classes(["flex flex-col space-y-1.5 text-center sm:text-left", @class])}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  attr :class, :string, default: nil
  slot :inner_block, required: true

  def dialog_title(assigns) do
    ~H"""
    <h3 class={classes(["text-lg font-semibold leading-none tracking-tight", @class])}>
      {render_slot(@inner_block)}
    </h3>
    """
  end

  attr :class, :string, default: nil
  slot :inner_block, required: true

  def dialog_description(assigns) do
    ~H"""
    <p class={classes(["text-sm text-muted-foreground", @class])}>
      {render_slot(@inner_block)}
    </p>
    """
  end

  attr :class, :string, default: nil
  slot :inner_block, required: true

  def dialog_footer(assigns) do
    ~H"""
    <div class={classes(["flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", @class])}>
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
end
