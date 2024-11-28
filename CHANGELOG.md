# 0.14.0

**Changes**
- Implement Sidebar component
- Introduce `as_child` tag to merge multiple `SaladUI` tag
- Introduce `dynamic` tag which allow dynamic rendering a tag.

**Breaking changes**
- Replace `tails` by `tw_merge` which extracted from `turboprop`. You have to add `TwMerge.Cache` to children list in your `application.ex`
- `Collapsible` component doesn't use builder anymore.

# 0.9.0

- ashkan117: fix: Explicitly include the <a> attributes to avoid lsp warning
- selenil: feature: Add mix task for init & install salad_ui components

- forest: fix input warning
- bluzky: fix overriding input name/value not working
- bluzky: feature: Add support for custom error translation function

# 0.8.0

- Add support Form.Field for all input components

**Breaking changes**
This version introduce some change to unify interface and term for some components:
- `Toggle.toggle` change `pressed` attribute -> `value`
- `Select` change `instance` -> `builder`
- `Tab.tab_trigger` change `root` attribute -> `builder` and required exposing builder from the `tabs`
