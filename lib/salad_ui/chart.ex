defmodule SaladUI.LiveChart do
  @moduledoc """
  The entrypoint for creating a chart component.

  A chart is created by defining a module that uses this one:

  ```elixir
  defmodule MyChart do
    use SaladUI.Chart

    def render(assigns) do
      ~H\"\"\"
        <div>
          <.chart id={@id} chart_config={@chart_config} chart_data={@chart_data} />
        </div>
      \"\"\"
    end
  ```

  Then, in your live view, you can use the chart like this:

  ```elixir
  defmodule MyChartLive do
    use Phoenix.LiveView

    @chart_config %{
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      type: "line",
      options: %{
        responsive: true
      },
      desktop: %{
        label: "Desktop",
        boderColor: hsl(var(--chart-1))
      },
      mobile: %{
        label: "Mobile",
        boderColor: hsl(var(--chart-2))
      }
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
      %{desktop: 110, mobile: 60},
      %{desktop: 90, mobile: 80}
    ]

    def mount(params, session, socket) do
      socket =
        socket
        |> assign(chart_config: @chart_config)
        |> assign(chart_data: @chart_data)

      {:ok, socket}
    end

    def render(assigns) do
      ~H\"\"\"
        <.live_component
          module={MyChart}
          id="my-chart"
          chart_config={@chart_config}
          chart_data={@chart_data}
        />
      \"\"\"
    end
  end
  ```

  Any module that uses `SaladUI.Chart` will be converted to a Phoenix's live component and will have an `update/2` callback to automatically update the chart on data changes. Also, a `.chart` component will be available to render the chart.

  This component requires a client hook called `ChartHook` to work. The hook is responsable to initialize and manage the entire life-cycle of a chart and render it, using a chart library for that. `SaladUI` comes with [Chart.js](https://www.chartjs.org/) as default, but you can rewrite `ChartHook` to integrate another chart libary.

  ## Chart config

  The `chart_config` map defines the chart's appearance and behavior:

  - Special keys
    - `labels`: A list of labels for the x-axis
    - `type`: Chart type (e.g., "line", "bar") - must match the chart library's supported types
    - `options`: A map of chart options following the chart library's API

  - Dataset configuration:
    Any additional keys in the config map define datasets. For example:

    ```elixir
    %{
      labels: ["Jan", "Feb"],
      type: "line",
      options: %{responsive: true},
      desktop: %{                    # Dataset configuration
        label: "Desktop Usage",      # Chart.js dataset options
        datakey: "desktop_value"     # Optional: custom key for data mapping
      }
    }
    ```

  ## Chart data

  The `chart_data` must be a list of maps. Each map represents a data point:

  ```elixir
  [
    %{desktop: 10, mobile: 20},  # First data point
    %{desktop: 15, mobile: 25}   # Second data point
  ]
  ```

  The data could be in any shape and you can map a dataset from the chart configuration to a data point in the chart data using the `datakey` key.

  All data points that do not match any datasets will be ignored.
  """
  use SaladUI, :component
  use Phoenix.LiveComponent

  @impl true
  def render(assigns) do
    ~H"""
    <canvas
      id={@id}
      phx-hook="ChartHook"
      data-chartconfig={Jason.encode!(@chart_config)}
      role="img"
      aria-label={@name}
    >
    </canvas>
    """
  end

  @impl true
  def update(%{id: id, chart_data: chart_data} = assigns, socket) do
    socket =
      socket
      |> assign(assigns)
      |> push_event("update-chart-#{id}", %{data: chart_data})

    {:ok, socket}
  end
end

defmodule SaladUI.Chart do
  use SaladUI, :component

  attr :id, :string, default: nil
  attr :name, :string, default: nil
  attr :chart_config, :map, required: true
  attr :chart_data, :map, required: true

  def chart(assigns) do
    ~H"""
    <.live_component
      module={SaladUI.LiveChart}
      id={@id}
      name={@name}
      chart_config={@chart_config}
      chart_data={@chart_data}
    />
    """
  end
end
