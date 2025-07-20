defmodule SaladUI.ChartTest do
  use ComponentCase

  import SaladUI.Chart

  @sample_config %{
    labels: ["Jan", "Feb", "Mar"],
    type: "line",
    desktop: %{label: "Desktop"},
    mobile: %{label: "Mobile"}
  }

  @sample_data [
    %{desktop: 10, mobile: 20},
    %{desktop: 15, mobile: 25},
    %{desktop: 20, mobile: 30}
  ]

  describe "Test Live Chart" do
    test "renders chart with required attributes" do
      assigns = %{
        id: "test-chart",
        name: "Test Chart",
        chart_type: "line",
        chart_options: @sample_config,
        chart_data: @sample_data
      }

      html =
        rendered_to_string(~H"""
        <.chart
          id={@id}
          name={@name}
          chart_type={@chart_type}
          chart_options={@chart_options}
          chart_data={@chart_data}
        />
        """)

      assert html =~ ~s(id="test-chart")
      assert html =~ ~s(phx-hook="SaladUI")
      assert html =~ ~s(role="img")
      assert html =~ ~s(aria-label="Test Chart")
      assert html =~ ~s(data-component="chart")
    end
  end
end
