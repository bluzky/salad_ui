# SaladUI

This library is my attemp to port [shadcn ui](https://ui.shadcn.com/) to Phoenix Liveview Component.

## [Demo at https://salad-storybook.fly.dev](https://salad-storybook.fly.dev/)

## Installation

1. Adding `salad_ui` to your list of dependencies in `mix.exs`:

```elixir
def deps do
  [
    {:salad_ui, github: "bluzky/salad_ui"}
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
- [ ] Hover Card
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
- ✅ Tooltip
