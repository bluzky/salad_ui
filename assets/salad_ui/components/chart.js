// saladui/components/chart.js
import Component from "../core/component";
import SaladUI from "../index";
import Chart from "chart.js/auto";

function cssvar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

const RESERVED_CONFIG_KEYS = ["labels", "type", "options"];
const RESERVED_DATASET_KEYS = ["datakey"];
const DEFAULT_CHART_TYPE = "line";

class ChartComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });
    this.chartOptions = JSON.parse(this.el.dataset.chartOptions || "{}");
    this.chartType = this.el.dataset.chartType || DEFAULT_CHART_TYPE;
    this.initializeChart();
  }

  getComponentConfig() {
    return {
      stateMachine: {
        idle: {
          transitions: { select: "idle" },
        },
      },
    };
  }

  handleCommand(command, params) {
    if (command === "update") {
      this.updateChart(params);
      return true;
    }
  }

  initializeChart() {
    const data = JSON.parse(this.el.dataset.chartData);

    this.chart = new Chart(this.el, {
      type: this.chartType,
      data: data,
      options: this.chartOptions,
    });
  }

  updateChart(payload) {
    if (payload.data) {
      this.chart.data = { ...this.chart.data, ...payload.data };
    }

    if (payload.options) {
      this.chartOptions = { ...this.chartOptions, ...payload.options };
      this.chart.options = this.chartOptions;
    }

    this.chart.update();
  }

  extractDatasets(config) {
    return Object.entries(config)
      .filter(([key]) => !RESERVED_CONFIG_KEYS.includes(key))
      .map(([, value]) => {
        const dataset = { ...value };

        Object.keys(dataset).forEach((key) => {
          // support css variables for colors
          if (dataset[key].includes("var(--")) {
            const colorName = dataset[key].split("--")[1].split(")")[0].trim();
            dataset[key] = dataset[key].replace(
              `var(--${colorName})`,
              cssvar(`--${colorName}`),
            );
          }
        });

        return Object.fromEntries(
          Object.entries(dataset).filter(
            ([key]) => !RESERVED_DATASET_KEYS.includes(key),
          ),
        );
      });
  }

  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}

// Register the component
SaladUI.register("chart", ChartComponent);

export default ChartComponent;
