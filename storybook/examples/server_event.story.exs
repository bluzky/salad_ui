defmodule Storybook.Examples.ServerEvent do
  @moduledoc false
  use PhoenixStorybook.Story, :example

  import SaladUI.Button
  import SaladUI.Input
  import SaladUI.Label
  import SaladUI.Sheet

  alias Phoenix.LiveView.JS

  def doc do
    "An example of trigger client event/action from server."
  end

  @impl true
  def mount(_params, _session, socket) do
    {:ok, socket}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <.sheet>
      <.sheet_trigger target="my-sheet">
        <.button variant="outline">Open</.button>
      </.sheet_trigger>
      <.sheet_content id="my-sheet">
        <.sheet_header>
          <.sheet_title>Edit profile</.sheet_title>
          <.sheet_description>
            Make changes to your profile here. Click save when you're done.
          </.sheet_description>
        </.sheet_header>
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <.label for="name" class="text-right">
              Name
            </.label>
            <.input id="name" value="Pedro Duarte" class="col-span-3" />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <.label for="username" class="text-right">
              Username
            </.label>
            <.input id="username" value="@peduarte" class="col-span-3" />
          </div>
        </div>
        <.sheet_footer>
          <.sheet_close target="my-sheet">
            <.button
              type="submit"
              phx-click={JS.exec("phx-hide-sheet", to: "#my-sheet") |> JS.push("save")}
            >
              Save changes
            </.button>
          </.sheet_close>
          <.button phx-click={JS.push("update")}>
            Close from back-end
          </.button>
        </.sheet_footer>
      </.sheet_content>
    </.sheet>
    """
  end

  @impl true
  def handle_event("update", _params, socket) do
    {:noreply, push_event(socket, "js-exec", %{to: "#my-sheet", attr: "phx-hide-sheet"})}
  end
end
