# SaladUI


![Tests](https://github.com/bluzky/salad_ui/actions/workflows/tests.yml/badge.svg)
[![Module Version](https://img.shields.io/hexpm/v/salad_ui.svg)](https://hex.pm/packages/salad_ui)
[![Hex Docs](https://img.shields.io/badge/hex-docs-lightgreen.svg)](https://hexdocs.pm/salad_ui/)
[![Total Download](https://img.shields.io/hexpm/dt/salad_ui.svg)](https://hex.pm/packages/salad_ui)
[![Last Updated](https://img.shields.io/github/last-commit/bluzky/salad_ui.svg)](https://github.com/bluzky/salad_ui/commits/main)

This library is my attemp to port [shadcn ui](https://ui.shadcn.com/) to Phoenix Liveview Component.

## [Demo at https://salad-storybook.fly.dev](https://salad-storybook.fly.dev/)

####  In Construction: Salad UI is in its early stages. Expect breaking changes in minor releases until 1.0 is ready! 🚀

## Installation

1. Adding `salad_ui` to your list of dependencies in `mix.exs`:

```elixir
def deps do
  [
    {:salad_ui, "~> 0.5.2"}
  ]
end
```

2. Add custom color
- Goto [https://ui.shadcn.com/themes](https://ui.shadcn.com/themes).
- Choose a color → Copy code → Paste to your `app.css` file
- Create new file `tailwind.colors.json` in your assets directory and paste following content
```
{
  "accent": {
    "DEFAULT": "hsl(var(--accent))",
    "foreground": "hsl(var(--accent-foreground))"
  },
  "background": "hsl(var(--background))",
  "border": "hsl(var(--border))",
  "card": {
    "DEFAULT": "hsl(var(--card))",
    "foreground": "hsl(var(--card-foreground))"
  },
  "destructive": {
    "DEFAULT": "hsl(var(--destructive))",
    "foreground": "hsl(var(--destructive-foreground))"
  },
  "foreground": "hsl(var(--foreground))",
  "input": "hsl(var(--input))",
  "muted": {
    "DEFAULT": "hsl(var(--muted))",
    "foreground": "hsl(var(--muted-foreground))"
  },
  "popover": {
    "DEFAULT": "hsl(var(--popover))",
    "foreground": "hsl(var(--popover-foreground))"
  },
  "primary": {
    "DEFAULT": "hsl(var(--primary))",
    "foreground": "hsl(var(--primary-foreground))"
  },
  "ring": "hsl(var(--ring))",
  "secondary": {
    "DEFAULT": "hsl(var(--secondary))",
    "foreground": "hsl(var(--secondary-foreground))"
  }
}
```

3. Configure tailwind
- Tell tailwind to extract class from `SaladUI`
- Add custom color
- Add tailwind plugin
```
module.exports = {
  content: [
    "../deps/salad_ui/lib/**/*.ex",
    ],
  theme: {
    extend: {
      colors: require("./tailwind.colors.json"),
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
    ...
  ]
}
```

- Install `tailwindcss-animate`
```
cd assets
npm i -D tailwindcss-animate
# or yarn
yarn add -D tailwindcss-animate
```

4. Configure `tails`
SaladUI use `tails` to properly merge Tailwindcss classes

```elixir
# config/config.exs

config :tails, colors_file: Path.join(File.cwd!(), "assets/tailwind.colors.json")
```

## Theme Toggle

The Theme Toggle component provides an easy way to implement theme switching in your Phoenix LiveView application.

### Useage 
1. Add *darkMode: ["class"]* to your module.exports in tailwind.config.js:
```
module.exports = {
  darkMode: ["class"],
  etc...
}
```

2. Add the Theme Toggle component to your layout:

  ```elixir
  <SaladUI.ThemeToggle.theme_toggle />
  ```

  Typically, you'd place this in your root layout (lib/your_app_web/components/layouts/root.html.heex) or app layout (lib/your_app_web/components/layouts/app.html.heex).

3. Implement theme switching functionality: You can either use the provided JavaScript or implement your own theme switching logic.

Using the Provided JavaScript
Add the following code to your app.js (usually located at assets/js/app.js):

```
//! Theme Toggle
document.addEventListener('DOMContentLoaded', (event) => {
  const setTheme = (theme) => {
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(systemTheme);
    } else {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  };

  const savedTheme = localStorage.getItem('theme') || 'system';
  setTheme(savedTheme);

  window.addEventListener("set_theme", (e) => {
    setTheme(e.detail.theme);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem('theme') === 'system') {
      setTheme('system');
    }
  });
});
```

Using Custom Theme Switching Logic
If you prefer to use your own theme switching logic, you must provide the on_theme_change attribute to the component.

### Customization
The theme_toggle component accepts the following attributes:

- id (string, optional): Custom ID for the toggle container. Default: "theme-toggle"
- class (string, optional): Additional CSS classes for the toggle container.
- on_theme_change (any, optional): Custom handler for theme changes. Accepts:
    - nil or omitted: Uses the provided JavaScript (must be set up as described above).
    - String: Name of a custom event or JavaScript function to be called.
    - 1-arity function: Called with the selected theme as an argument.

### Examples

1. Using default behaviour:
```
<SaladUI.ThemeToggle.theme_toggle />
```

2. Using a custom event name:
```
<SaladUI.ThemeToggle.theme_toggle on_theme_change="myCustomThemeEvent" />
```

3. Using a custom function:
```
<SaladUI.ThemeToggle.theme_toggle on_theme_change={fn theme -> JS.push("save_theme", value: %{theme: theme}) end} />
```

4. Customizing ID and class:
```
<SaladUI.ThemeToggle.theme_toggle id="my-theme-toggle" class="absolute top-4 right-4" />
```

## Development

Here is how to start develop SaladUI on local machine.

1. Clone this repo
2. Clone `https://github.com/bluzky/salad_storybook` in the same directory with `SaladUI`
3. Start storybook
```ex
cd salad_storybook
mix phx.server
```

## Unit Testing

In your project folder make sure the dependencies are installed by running `mix deps.get`, then once completed you can run:

- `mix test` to run tests once or,
- `mix test.watch` to watch file and run tests on file changes.

To run the failing tests only, just run `mix test.watch --stale`.

  It's also important to note that you must format your code with `mix format` before sending a pull request, otherwise the build in github will fail.

## List of components

- [ ] Accordion
- ✅ Alert
- [ ] Alert Dialog
- ✅ Avatar
- ✅ Badge
- ✅ Breadcrumb
- ✅ Button
- ✅ Card
- [ ] Carousel
- ✅ Checkbox
- [ ] Collapsible
- [ ] Combobox
- [ ] Command
- [ ] Context Menu
- ✅ Dialog
- [ ] Drawer
- ✅ Dropdown Menu
- ✅ Form
- ✅ Hover Card
- ✅ Input
- [ ] Input OTP
- ✅ Label
- ✅ Pagination
- [ ] Popover
- ✅ Progress
- [ ] Radio Group
- ✅ Scroll Area
- ✅ Select
- ✅ Separator
- ✅ Sheet
- ✅ Skeleton
- ✅ Slider
- ✅ Switch
- ✅ Table
- ✅ Tabs
- ✅ Textarea
- ✅ Theme Toggle
- ✅ Tooltip
