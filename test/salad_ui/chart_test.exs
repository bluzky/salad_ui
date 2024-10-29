defmodule SaladUI.ChartTest do
  use ComponentCase
  alias SaladUI.LiveChart

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
        chart_config: @sample_config,
        chart_data: @sample_data
      }

      html =
        render_component(LiveChart, assigns)

      assert html =~ ~s(id="test-chart")
      assert html =~ ~s(phx-hook="ChartHook")
      assert html =~ ~s(role="img")
      assert html =~ ~s(aria-label="Test Chart")
    end
  end
end
