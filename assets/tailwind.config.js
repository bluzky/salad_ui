// See the Tailwind configuration guide for advanced usage
// https://tailwindcss.com/docs/configuration

/** @type {import('tailwindcss').Config} */
export default {
  content: ["../../../config/*.*exs", "../lib/**/*.ex"],
  theme: {
    extend: {
      colors: require("./tailwind.colors.json"),
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
};
