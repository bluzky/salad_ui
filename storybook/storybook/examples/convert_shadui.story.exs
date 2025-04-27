defmodule Storybook.Examples.ConvertShadui do
  @moduledoc false
  use PhoenixStorybook.Story, :example

  import SaladUI.Label
  import SaladUI.Textarea

  def doc do
    "An example of convert React template for Shadcn ui to heex template using SaladUI."
  end

  @impl true
  def mount(_params, _session, socket) do
    {:ok, socket |> assign(:input, "") |> jsx_to_heex()}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <.form for={%{}}>
      <div class="h-96 grid grid-cols-2 gap-4">
        <div>
          <.label>Input</.label>
          <.textarea
            class="w-full h-full"
            phx-change="convert"
            phx-debounce="2000"
            id="input"
            name="input"
            value={@input}
          />
        </div>
        <div>
          <.label>Output</.label>
          <.textarea class="w-full h-full" value={@output} />
        </div>
      </div>
    </.form>
    """
  end

  @impl true
  def handle_event("convert", %{"input" => params}, socket) do
    {:noreply, jsx_to_heex(socket, params)}
  end

  defp jsx_to_heex(socket, jsx \\ "") do
    case jsx |> SaladStorybook.Helpers.JsxToHeex.convert() |> IO.inspect() do
      {:ok, heex} -> assign(socket, :output, {:safe, heex})
      {:error, message} -> assign(socket, :output, "ERROR: #{message}")
    end
  end
end
