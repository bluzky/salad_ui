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
    {:salad_ui, "~> 0.4.2"}
  ]
end
```

2. Add custom color
- Goto [https://ui.shadcn.com/themes](https://ui.shadcn.com/themes).
- Choose a color → Copy code → Paste to your `app.css` file
- Create new file `tailwind.colors.json` in your assets directory and paste following content
```json
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
```js
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


5. **Add javascript to handle event from server**
This add ability to execute client action from server. It's similar to `JS.exec/2`. Thanks to [this post](https://fly.io/phoenix-files/server-triggered-js/) from fly.io.

Add this code snippet to the end of `app.js`

```js
window.addEventListener("phx:js-exec", ({ detail }) => {
  document.querySelectorAll(detail.to).forEach((el) => {
    liveSocket.execJS(el, el.getAttribute(detail.attr));
  });
});
```

Then from server side, you can close an opening sheet like this.
```elixir
  @impl true
  def handle_event("update", params, socket) do
    # your logic
    {:noreply, push_event(socket, "js-exec", %{to: "#my-sheet", attr: "phx-hide-sheet"})}
  end
```

6. Some tweaks
Thanks to @ahacking

- To make dark and light mode work correctly, add following to your `app.css`
```css
body {
    @apply bg-background text-foreground;
}
```

- In case border color not working correctly, add following to your `app.css`
```css
@layer base {
    * {
        @apply border-border !important;
    }
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
- ✅ Radio Group
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
- ✅ Toggle
- ✅ Toggle Group
