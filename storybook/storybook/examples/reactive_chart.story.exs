defmodule Storybook.Examples.ReactiveChart do
  @moduledoc false
  use PhoenixStorybook.Story, :example

  import SaladUI.Button
  import SaladUI.Chart

  def doc do
    "An example of a chart that auto updates whenever its data changes."
  end

  @chart_config %{
    type: "bar",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    options: %{
      responsive: true
    },
    desktop: %{label: "Desktop", backgroundColor: "hsl(var(--chart-1))"},
    mobile: %{label: "Mobile", backgroundColor: "hsl(var(--chart-2))"}
  }

  @chart_data [
    %{desktop: 10, mobile: 20},
    %{desktop: 20, mobile: 10},
    %{desktop: 30, mobile: 10},
    %{desktop: 40, mobile: 80},
    %{desktop: 50, mobile: 20},
    %{desktop: 60, mobile: 90},
    %{desktop: 70, mobile: 30},
    %{desktop: 80, mobile: 30},
    %{desktop: 90, mobile: 40},
    %{desktop: 100, mobile: 50},
    %{desktop: 90, mobile: 60},
    %{desktop: 80, mobile: 70}
  ]

  @impl true
  def mount(_params, _session, socket) do
    socket =
      socket
      |> assign(:chart_config, @chart_config)
      |> assign(:chart_data, @chart_data)

    {:ok, socket}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="container flex flex-col gap-y-4">
      <.chart id="reactive-chart" chart_config={@chart_config} chart_data={@chart_data} />
      <.button phx-click="update-chart">Update Chart</.button>
    </div>
    """
  end

  @impl true
  def handle_event("update-chart", _params, socket) do
    new_chart_data =
      Enum.map(socket.assigns.chart_data, fn _ ->
        %{desktop: :rand.uniform(100), mobile: :rand.uniform(100)}
      end)

    {:noreply, assign(socket, :chart_data, new_chart_data)}
  end
end
