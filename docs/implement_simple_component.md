# Quick Simple Component Guide

Simple components display data with minimal interaction. Follow these 4 steps:

## Step 1: Create Elixir Component

```elixir
defmodule SaladUI.MyComponent do
  use SaladUI, :component

  attr :id, :string, required: true
  attr :data, :any, required: true

  def my_component(assigns) do
    ~H"""
    <div
      id={@id}
      phx-hook="SaladUI"
      data-component="my-component"
      data-part="root"
      data-options={Jason.encode!(%{data: @data})}
    >
      <!-- Your HTML here -->
    </div>
    """
  end
end
```

## Step 2: Create JavaScript Component

```javascript
import Component from "../core/component";
import SaladUI from "../index";

class MyComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });
    this.data = JSON.parse(this.el.dataset.options).data;
    this.initialize();
  }

  getComponentConfig() {
    return {
      stateMachine: {
        idle: { transitions: { update: "idle" } }
      }
    };
  }

  initialize() {
    // Initialize your component
    console.log("Data:", this.data);
  }

  handleCommand(command, params) {
    if (command === "update") {
      this.data = params.data;
      this.initialize();
      return true;
    }
    return super.handleCommand(command, params);
  }

  destroy() {
    // Cleanup here
  }
}

SaladUI.register("my-component", MyComponent);
export default MyComponent;
```

## Step 3: Add Import

In `lib/salad_ui.ex`:
```elixir
import SaladUI.MyComponent
```

In `assets/js/app.js`:
```javascript
import "./salad_ui/components/my-component";
```

## Step 4: Use Component

```heex
<.my_component id="example" data={%{value: 123}} />
```

## Chart Example

### Elixir:
```elixir
defmodule SaladUI.Chart do
  use SaladUI, :component

  attr :id, :string, required: true
  attr :"chart-data", :map, required: true

  def chart(assigns) do
    ~H"""
    <canvas
      id={@id}
      phx-hook="SaladUI"
      data-component="chart"
      data-part="root"
      data-chart-data={Jason.encode!(assigns[:"chart-data"])}
    >
    </canvas>
    """
  end
end
```

### JavaScript:
```javascript
import Component from "../core/component";
import SaladUI from "../index";
import Chart from "chart.js/auto";

class ChartComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });
    this.initChart();
  }

  getComponentConfig() {
    return {
      stateMachine: {
        idle: { transitions: { update: "idle" } }
      }
    };
  }

  initChart() {
    const data = JSON.parse(this.el.dataset.chartData);
    this.chart = new Chart(this.el, {
      type: "line",
      data: data
    });
  }

  handleCommand(command, params) {
    if (command === "update") {
      this.chart.data = params.data;
      this.chart.update();
      return true;
    }
  }

  destroy() {
    this.chart?.destroy();
  }
}

SaladUI.register("chart", ChartComponent);
```

### Usage:
```heex
<.chart
  id="sales-chart"
  chart-data={%{
    labels: ["Jan", "Feb", "Mar"],
    datasets: [%{
      label: "Sales",
      data: [10, 20, 30]
    }]
  }}
/>
```

## Key Requirements

1. **`phx-hook="SaladUI"`** - Required
2. **`data-component="name"`** - Component identifier, match with component name registered with SaladUI
3. **`data-part="root"`** - On main element
4. **`SaladUI.register()`** - Register component
5. **`getComponentConfig()`** - Return state machine config

That's it! Simple components just need these basics.
