import { JSDOM } from "jsdom";

const GLOBAL_KEYS = [
  "window",
  "document",
  "Node",
  "Element",
  "HTMLElement",
  "Event",
  "CustomEvent",
  "KeyboardEvent",
  "MouseEvent",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "getComputedStyle",
  "ResizeObserver",
];

class StubResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

export function installDom(html = "<!doctype html><body></body>") {
  const dom = new JSDOM(html, { url: "http://localhost/" });
  const { window } = dom;

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.Node = window.Node;
  globalThis.Element = window.Element;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.Event = window.Event;
  globalThis.CustomEvent = window.CustomEvent;
  globalThis.KeyboardEvent = window.KeyboardEvent;
  globalThis.MouseEvent = window.MouseEvent;
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);

  // jsdom does not implement rAF/ResizeObserver; stub them on both the bare
  // global (used by scroll-manager.js) and the window object (used via
  // `window.requestAnimationFrame` in utils.js) so code under test can run
  // without a real browser.
  const requestAnimationFrame = (callback) =>
    setTimeout(() => callback(Date.now()), 0);
  const cancelAnimationFrame = (id) => clearTimeout(id);
  const ResizeObserverImpl = window.ResizeObserver || StubResizeObserver;

  globalThis.requestAnimationFrame = requestAnimationFrame;
  globalThis.cancelAnimationFrame = cancelAnimationFrame;
  globalThis.ResizeObserver = ResizeObserverImpl;

  window.requestAnimationFrame = requestAnimationFrame;
  window.cancelAnimationFrame = cancelAnimationFrame;
  window.ResizeObserver = ResizeObserverImpl;

  return dom;
}

export function uninstallDom() {
  for (const key of GLOBAL_KEYS) {
    delete globalThis[key];
  }
}

export function setRect(element, rect) {
  Object.assign(element, {
    getBoundingClientRect: () => ({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      ...rect,
    }),
  });

  if (rect.width !== undefined) {
    Object.defineProperty(element, "offsetWidth", {
      value: rect.width,
      configurable: true,
    });
  }
  if (rect.height !== undefined) {
    Object.defineProperty(element, "offsetHeight", {
      value: rect.height,
      configurable: true,
    });
  }
}
