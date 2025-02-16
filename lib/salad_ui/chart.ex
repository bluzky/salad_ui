defmodule SaladUI.LiveChart do
  @moduledoc false

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
  @moduledoc """
  Chart component.

  This component displays a chart using a live component for real-time updates. Data and configuration are passed as attributes, and the rendering is managed on the client side through a hook called `ChartHook`. This hook initializes, manages the lifecycle, and renders the chart using a chart library. `SaladUI` comes with [Chart.js](https://www.chartjs.org/) as default, but you can rewrite `ChartHook` to integrate another chart library.

  ## Chart config

  The `chart_config` map defines the appearance and behavior of the chart:

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

  attr :id, :string, required: true
  attr :name, :string, default: "", doc: "name of the chart for screen readers"
  attr :chart_config, :map, required: true
  attr :chart_data, :list, required: true

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
