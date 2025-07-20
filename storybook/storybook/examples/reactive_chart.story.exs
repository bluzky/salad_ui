defmodule Storybook.Examples.ReactiveChart do
  @moduledoc false
  use PhoenixStorybook.Story, :example

  import SaladUI.Button
  import SaladUI.Chart

  alias SaladUI.LiveView

  def doc do
    "An example of a chart that auto updates whenever its data changes."
  end

  @chart_options %{
    responsive: true
  }

  @chart_data %{
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      %{
        label: "Desktop",
        data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 90, 80],
        backgroundColor: "var(--color-chart-1)"
      },
      %{
        label: "Mobile",
        data: [20, 10, 10, 80, 20, 90, 30, 30, 40, 50, 60, 70],
        backgroundColor: "var(--color-chart-2)"
      }
    ]
  }

  @impl true
  def mount(_params, _session, socket) do
    socket =
      socket
      |> assign(:chart_options, @chart_options)
      |> assign(:chart_data, @chart_data)

    {:ok, socket}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="container flex flex-col gap-y-4">
      <.chart
        id="reactive-chart"
        chart-options={@chart_options}
        chart-data={@chart_data}
        chart-type="bar"
      />
      <.button phx-click="update-chart">Update Chart</.button>
    </div>
    """
  end

  @impl true
  def handle_event("update-chart", _params, socket) do
    new_chart_data =
      Map.merge(socket.assigns.chart_data, %{
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          %{
            label: "Desktop",
            data: Enum.map(1..12, fn _ -> :rand.uniform(100) end),
            backgroundColor: "var(--color-chart-1)"
          },
          %{
            label: "Mobile",
            data: Enum.map(1..12, fn _ -> :rand.uniform(100) end),
            backgroundColor: "var(--color-chart-2)"
          }
        ]
      })

    socket =
      LiveView.send_command(socket, "reactive-chart", "update", %{
        data: new_chart_data
      })

    {:noreply, socket}
  end
end
