# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

# Configure esbuild (the version is required)
config :esbuild,
  version: "0.17.11",
  salad_ui: [
    args:
      ~w(js/app.js js/storybook.js --bundle --target=es2017 --outdir=../priv/static/assets --external:/fonts/* --external:/images/*),
    cd: Path.expand("../assets", __DIR__),
    env: %{"NODE_PATH" => Path.expand("../deps", __DIR__)}
  ]

# Configures Elixir's Logger
config :logger, :console,
  # Configures the mailer
  #
  # By default it uses the "Local" adapter which stores the emails
  # locally. You can see the emails in your browser, at "/dev/mailbox".
  #
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :phoenix, :json_library, Jason

# Configures the endpoint
config :salad_ui, SaladUIWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [html: SaladUIWeb.ErrorHTML, json: SaladUIWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: SaladUI.PubSub,
  live_view: [signing_salt: "TnXlaYgb"]

config :salad_ui,
  generators: [timestamp_type: :utc_datetime]

# Configure tailwind (the version is required)
config :tailwind,
  version: "3.4.3",
  salad_ui: [
    args: ~w(
      --config=tailwind.config.js
      --input=css/app.css
      --output=../priv/static/assets/app.css
    ),
    cd: Path.expand("../assets", __DIR__)
  ],
  storybook: [
    args: ~w(
            --config=tailwind.config.js
            --input=css/storybook.css
            --output=../priv/static/assets/storybook.css
          ),
    cd: Path.expand("../assets", __DIR__)
  ]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
