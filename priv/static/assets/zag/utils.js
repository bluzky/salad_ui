import { createNormalizer } from "@zag-js/types";

const propMap = {
  onFocus: "onFocusin",
  onBlur: "onFocusout",
  onChange: "onInput",
  onDoubleClick: "onDblclick",
  htmlFor: "for",
  className: "class",
  defaultValue: "value",
  defaultChecked: "checked",
};

export const camelize = (str, capitalizeFirst = false) => {
  return str
    .toLowerCase()
    .replace(/[-_](.)/g, (_match, letter) => letter.toUpperCase())
    .replace(/^(.)/, (_match, firstLetter) =>
      capitalizeFirst ? firstLetter.toUpperCase() : firstLetter,
    );
};

export const getOption = (el, name, validOptions) => {
  const kebabName = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  let initial = el.dataset[kebabName];

  if (
    validOptions &&
    initial !== undefined &&
    !validOptions.includes(initial)
  ) {
    console.error(
      `Invalid '${name}' specified: '${initial}'. Expected one of '${validOptions.join(
        "', '",
      )}'.`,
    );
    initial = undefined;
  }

  return initial;
};

export const getBooleanOption = (el, name) => {
  const kebabName = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  return el.dataset[kebabName] === "true" || el.dataset[kebabName] === "";
};

export const getJsonOption = (el, name) => {
  const kebabName = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  return JSON.parse(el.dataset[kebabName] || "{}");
};

export const normalizeProps = createNormalizer((props) => {
  return Object.entries(props).reduce((acc, [key, value]) => {
    if (value === undefined) return acc;
    key = propMap[key] || key;

    if (key === "style" && typeof value === "object") {
      acc.style = toStyleString(value);
    } else {
      acc[key.toLowerCase()] = value;
    }

    return acc;
  }, {});
});

export const toStyleString = (style) => {
  return Object.entries(style).reduce((styleString, [key, value]) => {
    if (value === null || value === undefined) return styleString;
    const formattedKey = key.startsWith("--")
      ? key
      : key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

    return `${styleString}${formattedKey}:${value};`;
  }, "");
};
