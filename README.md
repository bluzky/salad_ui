<p align="center">
    <a href="https://salad-storybook.fly.dev/" alt="SaladUI Logo">
    <img src="https://github.com/bluzky/salad_ui/blob/main/docs/images/SaladUI_logo.png?raw=true" height="120"/></a>
</p>
<h4 align="center">
    A collection of Live View components inspired by shadcn
</h4>

<div align="center">
    <a href="https://salad-storybook.fly.dev/">Demo</a> |
    <a href="https://hexdocs.pm/salad_ui/readme.html">Documentation</a> |
    <a href="https://ko-fi.com/bluzky">Support project</a>
</div>
<br></br>

<div align="center">
<img src="https://github.com/bluzky/salad_ui/actions/workflows/tests.yml/badge.svg" alt="Tests">
<a href="https://hex.pm/packages/salad_ui"><img src="https://img.shields.io/hexpm/v/salad_ui.svg" alt="Module Version"></a>
<a href="https://hexdocs.pm/salad_ui/"><img src="https://img.shields.io/badge/hex-docs-lightgreen.svg" alt="Hex Docs"></a>
<a href="https://hex.pm/packages/salad_ui"><img src="https://img.shields.io/hexpm/dt/salad_ui.svg" alt="Total Download"></a>
<a href="https://github.com/bluzky/salad_ui/commits/main"><img src="https://img.shields.io/github/last-commit/bluzky/salad_ui.svg" alt="Last Updated"></a>
</div>

## 🚧 V1 is under development, for V0 source code, checkout branch v0

## [Demo storybook v0](https://salad-storybook.fly.dev/)

<a href='https://ko-fi.com/F1F1CEZ91' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi2.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

## Installation

1. Add `salad_ui` to your `mix.exs`

```elixir
def deps do
  [
    {:salad_ui, "~> 0.14"},
  ]
end
```

2. Add `TwMerge.Cache` to `application.ex`

```elixir
children = [
    ...,
    TwMerge.Cache
]
```

3. Setup `salad_ui`

3.1 **Using `salad_ui` as part of your project:**

> This way you can install only components that you want to use or you want to edit SaladUI's component source code to fit your need.
> If you just want to use SaladUI's components, see **Using as library** below.

- Init Salad UI in your project

```
#> cd your_project
#> mix salad.init

# install some components
#> mix salad.add label button
```

3.2 **Using `salad_ui` as a library:**

- Init Salad UI in your project with option `--as-lib`

```
#> cd your_project
#> mix salad.init --as-lib
```

- Using in your project

```elixir
defmodule MyModule do
    # import any component you need
    import SaladUI.Button

    def render(_) do
      ~H"""
      <.button>Click me</.button>
      """
    end
end
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

```
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

| Component      | v0   | v1   |
|----------------|------|------|
| Accordion      | ✅    |      |
| Alert          | ✅    | ✅     |
| Alert Dialog   | ✅    |      |
| Avatar         | ✅    | ✅     |
| Badge          | ✅    | ✅     |
| Breadcrumb     | ✅    | ✅     |
| Button         | ✅    | ✅     |
| Card           | ✅    | ✅     |
| Carousel       | ❌    |      |
| Checkbox       | ✅    |      |
| Collapsible    | ✅    | ✅    |
| Combobox       | ❌    |      |
| Command        | ❌    |      |
| Context Menu   | ❌    |      |
| Dialog         | ✅    | ✅     |
| Drawer         | ❌    |      |
| Dropdown Menu  | ✅    |      |
| Form           | ✅    | ✅     |
| Hover Card     | ✅    | ✅      |
| Input          | ✅    |      |
| Input OTP      | ❌    |      |
| Label          | ✅    | ✅      |
| Pagination     | ✅    | ✅     |
| Popover        | ✅    | ✅     |
| Progress       | ✅    |      |
| Radio Group    | ✅    | ✅     |
| Scroll Area    | ✅    |      |
| Select         | ✅    | ✅     |
| Separator      | ✅    | ✅     |
| Sheet          | ✅    |      |
| Skeleton       | ✅    | ✅     |
| Slider         | ✅    |      |
| Switch         | ✅    |      |
| Table          | ✅    | ✅    |
| Tabs           | ✅    | ✅     |
| Textarea       | ✅    | ✅     |
| Tooltip        | ✅    |      |

## 🌟 Contributors

<p align="center">
    <a href="https://github.com/bluzky/salad_ui/graphs/contributors">
        <img src="https://contrib.rocks/image?repo=bluzky/salad_ui&max=300&columns=14" width="600"/></a>
</p>

## 😘 Credits

This project could not be available without these awesome works:

- `tailwind css` an awesome css utility project
- `turboprop` I borrow code from here for merging tailwinds classes
- `shadcn/ui` which this project is inspired from
- `Phoenix Framework` of course
