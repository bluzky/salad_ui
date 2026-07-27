# Documentation Site Plan

Plan to restructure SaladUI docs into generated documentation site.

## Goals

- Create clear docs information architecture.
- Generate static documentation site with ExDoc.
- Keep Storybook as interactive demo/playground.
- Link component docs, source files, and Storybook stories.
- Publish docs through HexDocs or static hosting.

## Proposed File Tree

```txt
docs/
├── index.md
├── getting-started/
│   ├── installation.md
│   ├── quick-start.md
│   ├── manual-install.md
│   ├── configuration.md
│   └── theming.md
├── components/
│   ├── index.md
│   ├── accordion.md
│   ├── alert.md
│   ├── alert-dialog.md
│   ├── avatar.md
│   ├── badge.md
│   ├── breadcrumb.md
│   ├── button.md
│   ├── card.md
│   ├── checkbox.md
│   ├── collapsible.md
│   ├── command.md
│   ├── dialog.md
│   ├── dropdown-menu.md
│   ├── form.md
│   ├── hover-card.md
│   ├── input.md
│   ├── label.md
│   ├── pagination.md
│   ├── popover.md
│   ├── progress.md
│   ├── radio-group.md
│   ├── scroll-area.md
│   ├── select.md
│   ├── separator.md
│   ├── sheet.md
│   ├── sidebar.md
│   ├── skeleton.md
│   ├── slider.md
│   ├── switch.md
│   ├── table.md
│   ├── tabs.md
│   ├── textarea.md
│   ├── toggle.md
│   ├── toggle-group.md
│   └── tooltip.md
├── guides/
│   ├── forms.md
│   ├── liveview-events.md
│   ├── server-commands.md
│   ├── js-commands.md
│   └── accessibility.md
├── architecture/
│   ├── overview.md
│   ├── elixir-components.md
│   ├── javascript-runtime.md
│   ├── component-lifecycle.md
│   ├── state-machine.md
│   └── communication.md
├── development/
│   ├── contributing.md
│   ├── local-development.md
│   ├── create-simple-component.md
│   ├── create-interactive-component.md
│   ├── component-config.md
│   ├── js-patterns.md
│   └── testing.md
├── api/
│   ├── elixir-reference.md
│   └── javascript-reference.md
├── changelog.md
└── assets/
    └── images/
        ├── SaladUI_logo.png
        ├── Salad UI icon.png
        └── demo.gif
```

## Phase 1 — Restructure Existing Docs

Create new folders:

```txt
docs/getting-started/
docs/components/
docs/guides/
docs/architecture/
docs/development/
docs/api/
docs/assets/images/
```

Move current docs into new information architecture:

```txt
README.md → docs/index.md
docs/manual_install.md → docs/getting-started/manual-install.md
docs/component_communications_explain.md → docs/architecture/communication.md
docs/js_architecture_overview.md → docs/architecture/javascript-runtime.md
docs/component_lifecycle.md → docs/architecture/component-lifecycle.md
docs/js_state_transition_flow.md → docs/architecture/state-machine.md
docs/implement_simple_component.md → docs/development/create-simple-component.md
docs/complex_component_guide.md → docs/development/create-interactive-component.md
docs/component_config_guide.md → docs/development/component-config.md
docs/js_component_patterns.md → docs/development/js-patterns.md
docs/js_component_reference.md → docs/api/javascript-reference.md
CHANGELOG.md → docs/changelog.md
```

Move image assets:

```txt
docs/images/* → docs/assets/images/*
```

## Phase 2 — Add Missing Guide Pages

Add getting started pages:

```txt
docs/getting-started/installation.md
docs/getting-started/quick-start.md
docs/getting-started/configuration.md
docs/getting-started/theming.md
```

Add usage guide pages:

```txt
docs/guides/forms.md
docs/guides/liveview-events.md
docs/guides/server-commands.md
docs/guides/js-commands.md
docs/guides/accessibility.md
```

Add development pages:

```txt
docs/development/contributing.md
docs/development/local-development.md
docs/development/testing.md
```

## Phase 3 — Add Component Docs

Create one markdown page per public component module.

Component page template:

```md
# Button

Short purpose and when to use.

## Usage

```elixir
<.button>Save</.button>
```

## Examples

- Default
- Variants
- Sizes
- Disabled
- With icon

## API

### Attributes

Attribute table copied or generated from `attr` declarations.

### Slots

Slot table copied or generated from `slot` declarations.

## Accessibility

Keyboard, ARIA, focus, and screen reader notes.

## Storybook

Link to matching Storybook story.

## Source

Link to source file.
```

Source mapping example:

```txt
docs/components/button.md
→ lib/salad_ui/button.ex
→ storybook/storybook/salad_ui_component/button.story.exs
```

## Phase 4 — Wire ExDoc

Update `mix.exs` docs config.

Required changes:

- Add new docs to `extras`.
- Add grouped sidebar via `groups_for_extras`.
- Include `docs` in package files.
- Decide landing page: `README.md` or `docs/index.md`.

Package files change:

```elixir
files:
  ~w(lib assets/salad_ui priv docs .formatter.exs mix.exs README*) ++
    ~w(CHANGELOG.md LICENSE package.json)
```

Docs groups should follow file tree:

```elixir
groups_for_extras: [
  "Getting Started": [
    "docs/index.md",
    "docs/getting-started/installation.md",
    "docs/getting-started/quick-start.md",
    "docs/getting-started/manual-install.md",
    "docs/getting-started/configuration.md",
    "docs/getting-started/theming.md"
  ],
  "Components": [
    "docs/components/index.md",
    "docs/components/button.md",
    "docs/components/dialog.md"
  ],
  "Guides": [
    "docs/guides/forms.md",
    "docs/guides/liveview-events.md",
    "docs/guides/server-commands.md",
    "docs/guides/js-commands.md",
    "docs/guides/accessibility.md"
  ],
  "Architecture": [
    "docs/architecture/overview.md",
    "docs/architecture/elixir-components.md",
    "docs/architecture/javascript-runtime.md",
    "docs/architecture/component-lifecycle.md",
    "docs/architecture/state-machine.md",
    "docs/architecture/communication.md"
  ],
  "Development": [
    "docs/development/contributing.md",
    "docs/development/local-development.md",
    "docs/development/create-simple-component.md",
    "docs/development/create-interactive-component.md",
    "docs/development/component-config.md",
    "docs/development/js-patterns.md",
    "docs/development/testing.md"
  ],
  "API": [
    "docs/api/elixir-reference.md",
    "docs/api/javascript-reference.md"
  ]
]
```

## Phase 5 — Generate Site

Generate documentation locally:

```bash
mix docs
```

Generated output:

```txt
doc/
```

Validate:

```bash
mix docs
mix format
```

## Phase 6 — Publish

Options:

1. HexDocs
   - Publish package to Hex.
   - HexDocs builds ExDoc output.

2. GitHub Pages
   - Generate `doc/` in CI.
   - Publish `doc/` as static site.

3. Static host
   - Build `doc/`.
   - Deploy to Netlify, Fly, or other static host.

## Phase 7 — Keep Storybook Linked

Docs role:

- Written reference.
- Install guides.
- API docs.
- Architecture and development docs.

Storybook role:

- Interactive examples.
- Visual demos.
- Live component states.

Every component doc should link to Storybook story.
Every Storybook story should link back to component docs where possible.

## Implementation Order

1. Add new folders and placeholder pages.
2. Move existing markdown content into new paths.
3. Add component index and component page skeletons.
4. Update `mix.exs` ExDoc config.
5. Run `mix docs` and fix broken links.
6. Add richer component examples from Storybook stories.
7. Add CI deploy step if static hosting needed.
