import Config

config :tailwind,
  version: "4.3.0",
  default: [
    args: ~w(
      --input=assets/css/app.css
      --output=priv/static/assets/app.css
    ),
    cd: Path.expand("..", __DIR__)
  ],
  storybook: [
    args: ~w(
          --input=assets/css/storybook.css
          --output=priv/static/assets/storybook.css
        ),
    cd: Path.expand("..", __DIR__)
  ]
