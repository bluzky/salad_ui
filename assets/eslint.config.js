import js from "@eslint/js";

const browserGlobals = {
  AbortController: "readonly",
  CustomEvent: "readonly",
  CSS: "readonly",
  Element: "readonly",
  Event: "readonly",
  HTMLElement: "readonly",
  IntersectionObserver: "readonly",
  KeyboardEvent: "readonly",
  MutationObserver: "readonly",
  Node: "readonly",
  ResizeObserver: "readonly",
  cancelAnimationFrame: "readonly",
  clearTimeout: "readonly",
  console: "readonly",
  document: "readonly",
  getComputedStyle: "readonly",
  queueMicrotask: "readonly",
  requestAnimationFrame: "readonly",
  setTimeout: "readonly",
  window: "readonly",
};

const nodeGlobals = {
  console: "readonly",
  process: "readonly",
  setTimeout: "readonly",
};

export default [
  {
    ignores: ["node_modules/**"],
  },
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["salad_ui/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: browserGlobals,
    },
  },
  {
    files: ["test/**/*.test.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: nodeGlobals,
    },
  },
];
