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
          "chart-type": "bar",
          "chart-config": seed_chart_config("chart-1"),
          "chart-data": seed_chart_data("chart-1")
        }
      },
      %Variation{
        id: :chart_2,
        attributes: %{
          id: "chart-2",
          "chart-type": "line",
          "chart-config": seed_chart_config("chart-2"),
          "chart-data": seed_chart_data("chart-2")
        }
      }
    ]
  end

  defp seed_chart_config("chart-1") do
    %{
      responsive: true
    }
  end

  defp seed_chart_config("chart-2") do
    %{
      responsive: true
    }
  end

  defp seed_chart_data("chart-1") do
    %{
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        %{
          label: "Temperature",
          data: [10, 20, 30, 40, 50, 60, 70, 80],
          backgroundColor: "rgba(0,0,0)"
        },
        %{
          label: "Humidity",
          data: [20, 10, 10, 80, 20, 90, 30, 30],
          backgroundColor: "rgba(128,128,128)"
        }
      ]
    }
  end

  defp seed_chart_data("chart-2") do
    %{
      labels: ["Q1", "Q2", "Q3", "Q4"],
      datasets: [
        %{
          label: "Sales",
          data: [10, 70, 30, 50],
          borderColor: "rgb(0,0,0)",
          tension: 0.4
        },
        %{
          label: "Revenue",
          data: [20, 50, 40, 90],
          borderColor: "rgb(128, 128, 128)",
          tension: 0.4
        }
      ]
    }
  end
end
