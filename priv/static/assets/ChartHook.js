// In production, replace with only the chart types you are using
import Chart from "chart.js/auto";

// utility function to fetch CSS variables
function cssvar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

/**
 * Hook for managing Chart.js instances.
 * Handles chart initialization, updates, and cleanup in a lifecycle-aware manner
 */
const ChartHook = {
  // Constants
  RESERVED_CONFIG_KEYS: ["labels", "type", "options"],
  RESERVED_DATASET_KEYS: ["datakey"],
  DEFAULT_CHART_TYPE: "bar",

  mounted() {
    this.initializeChart();

    // Listen for chart updates
    this.handleEvent(`update-chart-${this.el.id}`, (payload) => {
      this.updateChartData(payload.data);
    });
  },

  destroyed() {
    this.cleanupChart();
  },

  initializeChart() {
    const configuration = this.getChartConfiguration();
    this.chart = new Chart(this.el, configuration);
  },

  updateChartData(newData) {
    const datasets = this.processDatasets(newData, this.getConfiguration());

    datasets.forEach((dataset, index) => {
      this.chart.data.datasets[index].data = dataset.data;
    });

    this.chart.update();
  },

  getChartConfiguration() {
    const config = this.getConfiguration();
    const datasets = this.extractDatasets(config);

    return {
      type: config.type || this.DEFAULT_CHART_TYPE,
      data: {
        labels: config.labels || [],
        datasets,
      },
      options: config.options || {},
    };
  },

  processDatasets(data, config) {
    return Object.entries(config)
      .filter(([key]) => !this.RESERVED_CONFIG_KEYS.includes(key))
      .map(([key, value]) => ({
        data: this.extractDataPoints(data, value.datakey || key),
      }));
  },

  extractDataPoints(data, key) {
    return data.map((item) => item[key] || 0);
  },

  extractDatasets(config) {
    return Object.entries(config)
      .filter(([key]) => !this.RESERVED_CONFIG_KEYS.includes(key))
      .map(([, value]) => {
        const dataset = { ...value };

        Object.keys(dataset).forEach((key) => {
          // support css variables for colors
          if (dataset[key].includes("var(--")) {
            const colorName = dataset[key].split("--")[1].split(")")[0].trim();
            dataset[key] = dataset[key].replace(
              `var(--${colorName})`,
              cssvar(`--${colorName}`)
            );
          }
        });

        return Object.fromEntries(
          Object.entries(dataset).filter(
            ([key]) => !this.RESERVED_DATASET_KEYS.includes(key)
          )
        );
      });
  },

  getConfiguration() {
    return JSON.parse(this.el.dataset.chartconfig);
  },

  cleanupChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  },
};

export default ChartHook;
