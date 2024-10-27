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

  describe "Test Chart" do
    test "renders chart with required attributes" do
      assigns = %{
        id: "test-chart",
        name: "Test Chart",
        chart_config: @sample_config,
        chart_data: @sample_data
      }

      html =
        rendered_to_string(~H"""
        <.chart id={@id} name={@name} chart_config={@chart_config} chart_data={@chart_data} />
        """)

      assert html =~ ~s(id="test-chart")
      assert html =~ ~s(phx-hook="ChartHook")
      assert html =~ ~s(role="img")
      assert html =~ ~s(aria-label="Test Chart")
    end
  end

  describe "SaladUI.Chart.__using__/1" do
    test "creates a live component with necessary callback" do
      defmodule TestChart do
        @moduledoc false
        use SaladUI.Chart

        def render(assigns) do
          ~H"""
          <div>
            <.chart id={@id} chart_config={@chart_config} chart_data={@chart_data} />
          </div>
          """
        end
      end

      assert {:module, TestChart} = Code.ensure_compiled(TestChart)
      assert function_exported?(TestChart, :__live__, 0)
      assert function_exported?(TestChart, :update, 2)
    end
  end
end
