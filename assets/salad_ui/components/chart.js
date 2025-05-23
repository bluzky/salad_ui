// saladui/components/chart.js
import Component from "../core/component";
import SaladUI from "../index";
import Chart from "chart.js/auto";

function cssvar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

const RESERVED_CONFIG_KEYS = ["labels", "type", "options"];
const RESERVED_DATASET_KEYS = ["datakey"];
const DEFAULT_CHART_TYPE = "bar";

class ChartComponent extends Component {
  constructor(el, hookContext) {
    super(el, { hookContext });
    this.chartConfig = this.getConfiguration();
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
      this.updateChartData(params.data);
      return true;
    }
  }

  initializeChart() {
    const config = this.chartConfig;
    const datasets = this.extractDatasets(config);

    this.chart = new Chart(this.el, {
      type: config.type || DEFAULT_CHART_TYPE,
      data: {
        labels: config.labels || [],
        datasets,
      },
      options: config.options || {},
    });

    this.updateChartData(JSON.parse(this.el.dataset.chartData));
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

  updateChartData(newData) {
    const datasets = this.processDatasets(newData, this.chartConfig);

    datasets.forEach((dataset, index) => {
      this.chart.data.datasets[index].data = dataset.data;
    });

    this.chart.update();
  }

  processDatasets(data, config) {
    return Object.entries(config)
      .filter(([key]) => !RESERVED_CONFIG_KEYS.includes(key))
      .map(([key, value]) => ({
        data: this.extractDataPoints(data, value.datakey || key),
      }));
  }

  extractDataPoints(data, key) {
    return data.map((item) => item[key] || 0);
  }

  getConfiguration() {
    return JSON.parse(this.el.dataset.chartconfig);
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
