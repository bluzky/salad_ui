# v0.8.0

- Add support Form.Field for all input components

**Breaking changes**
This version introduce some change to unify interface and term for some components:
- `Toggle.toggle` change `pressed` attribute -> `value`
- `Select` change `instance` -> `builder`
- `Tab.tab_trigger` change `root` attribute -> `builder` and required exposing builder from the `tabs`
