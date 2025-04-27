defmodule Storybook.SaladUIComponents.Chart do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  def function, do: &SaladUI.Chart.chart/1
  def container, do: {:div, class: "w-[40%]"}

  def variations do
    [
      %Variation{
        id: :chart_1,
        attributes: %{
          id: "chart-1",
          chart_config: seed_chart_config("chart-1"),
          chart_data: seed_chart_data("chart-1")
        }
      },
      %Variation{
        id: :chart_2,
        attributes: %{
          id: "chart-2",
          chart_config: seed_chart_config("chart-2"),
          chart_data: seed_chart_data("chart-2")
        }
      }
    ]
  end

  defp seed_chart_config("chart-1") do
    %{
      type: "bar",
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      options: %{
        responsive: true
      },
      temperature: %{
        label: "Temperature",
        datakey: "temp",
        backgroundColor: "hsl(var(--chart-4))"
      },
      humidity: %{
        label: "Humidity",
        backgroundColor: "hsl(var(--chart-2))"
      }
    }
  end

  defp seed_chart_config("chart-2") do
    %{
      type: "line",
      labels: ["Q1", "Q2", "Q3", "Q4"],
      options: %{
        responsive: true
      },
      sales: %{
        label: "Sales",
        borderColor: "hsl(var(--chart-3))"
      },
      revenue: %{
        label: "Revenue",
        borderColor: "hsl(var(--chart-4))"
      }
    }
  end

  defp seed_chart_data("chart-1") do
    [
      %{temp: 10, humidity: 20},
      %{temp: 20, humidity: 10},
      %{temp: 30, humidity: 10},
      %{temp: 40, humidity: 80},
      %{temp: 50, humidity: 20},
      %{temp: 60, humidity: 90},
      %{temp: 70, humidity: 30},
      %{temp: 80, humidity: 30}
    ]
  end

  defp seed_chart_data("chart-2") do
    [
      %{sales: 10, revenue: 20},
      %{sales: 70, revenue: 50},
      %{sales: 30, revenue: 40},
      %{sales: 50, revenue: 90}
    ]
  end
end
