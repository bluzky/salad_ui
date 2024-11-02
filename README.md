
<p align="center">
    <a href="https://salad-storybook.fly.dev/" alt="SaladUI Logo">
    <img src="https://github.com/bluzky/salad_ui/blob/main/docs/SaladUI_logo.png?raw=true" height="120"/></a>
</p>
<h4 align="center">
    A collection of Live View components inspired by shadcn
</h4>

<div align="center">
    <a href="https://salad-storybook.fly.dev/">Demo</a> |
    <a href="https://hexdocs.pm/salad_ui/readme.html">Documentation</a> |
    <a href="https://ko-fi.com/bluzky">Sponsor</a>
</div>
<br></br>

![Tests](https://github.com/bluzky/salad_ui/actions/workflows/tests.yml/badge.svg)
[![Module Version](https://img.shields.io/hexpm/v/salad_ui.svg)](https://hex.pm/packages/salad_ui)
[![Hex Docs](https://img.shields.io/badge/hex-docs-lightgreen.svg)](https://hexdocs.pm/salad_ui/)
[![Total Download](https://img.shields.io/hexpm/dt/salad_ui.svg)](https://hex.pm/packages/salad_ui)
[![Last Updated](https://img.shields.io/github/last-commit/bluzky/salad_ui.svg)](https://github.com/bluzky/salad_ui/commits/main)

## [Demo storybook](https://salad-storybook.fly.dev/)

<a href='https://ko-fi.com/F1F1CEZ91' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi2.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

## Installation

1. **Using `salad_ui` as part of your project:**

- Adding `salad_ui` to your list of dependencies in `mix.exs`:

```elixir
def deps do
  [
    {:salad_ui, "~> 0.12.0", only: [:dev]},
    {:tails, "~> 0.1"}
  ]
end
```

- Init Salad UI in your project
```
#> cd your_project
#> mix salad.init

# install some components
#> mix salad.add label button
```

2. **Using `salad_ui` as a library:**

- Adding `salad_ui` to your list of dependencies in `mix.exs`:

```elixir
def deps do
  [
    {:salad_ui, "~> 0.12.0", only: [:dev]}
  ]
end
```

- Init Salad UI in your project with option `--as-lib`
```
#> cd your_project
#> mix salad.init --as-lib
```


## More configuration
1. Custom error translate function

```elixir
config :salad_ui, :error_translator_function, {MyAppWeb.CoreComponents, :translate_error}
```

## 🛠️ Development

Here is how to start develop SaladUI on local machine.

1. Clone this repo
2. Clone `https://github.com/bluzky/salad_storybook` in the same directory with **Salad UI**
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

##  List of components

- ✅ Accordion
- ✅ Alert
- 🚧 Alert Dialog
- ✅ Avatar
- ✅ Badge
- ✅ Breadcrumb
- ✅ Button
- ✅ Card
- [ ] Carousel
- ✅ Chart
- ✅ Checkbox
- 🚧 Collapsible
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
- ✅ Popover
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

## 🌟 Contributors

<p align="center">
    <a href="https://github.com/bluzky/salad_ui/graphs/contributors">
        <img src="https://contrib.rocks/image?repo=bluzky/salad_ui&max=300&columns=14" width="600"/></a>
</p>

## 😘 Credits
This project could not be available without these awesome works:

- `tailwind css` an awesome css utility project
- `tails` for merging tailwind class
- `shadcn/ui` which this project is inspired from
- `Phoenix Framework` of course

