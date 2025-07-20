import Config

config :tailwind,
  version: "4.0.9",
  default: [
    args: ~w(
      --input=css/app.css
      --output=../priv/static/assets/app.css
    ),
    cd: Path.expand("../assets", __DIR__)
  ],
  storybook: [
    args: ~w(
          --input=css/storybook.css
          --output=../priv/static/assets/storybook.css
        ),
    cd: Path.expand("../storybook/assets", __DIR__)
  ]
