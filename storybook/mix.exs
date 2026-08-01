defmodule SaladStorybook.MixProject do
  use Mix.Project

  def project do
    [
      app: :salad_storybook,
      version: "0.1.0",
      elixir: "~> 1.14",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      releases: releases(),
      listeners: [Phoenix.CodeReloader]
    ]
  end

  defp releases do
    [
      salad_storybook: [
        include_executables_for: [:unix],
        applications: [
          runtime_tools: :permanent,
          salad_storybook: :permanent
        ],
        strip_beams: [
          keep: ["Docs"]
        ]
      ]
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {SaladStorybook.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.8.1"},
      {:phoenix_ecto, "~> 4.7"},
      {:ecto_sql, "~> 3.14"},
      {:postgrex, "~> 0.22"},
      {:phoenix_html, "~> 4.3"},
      {:phoenix_live_reload, "~> 1.6", only: :dev},
      {:phoenix_live_view, "~> 1.2"},
      {:phoenix_live_dashboard, "~> 0.8.7"},
      {:esbuild, "~> 0.10", runtime: Mix.env() == :dev},
      {:tailwind, "~> 0.5", runtime: Mix.env() == :dev},
      {:swoosh, "~> 1.26"},
      {:finch, "~> 0.23"},
      {:telemetry_metrics, "~> 1.0"},
      {:telemetry_poller, "~> 1.3"},
      {:gettext, "~> 1.0"},
      {:jason, "~> 1.4"},
      {:dns_cluster, "~> 0.2"},
      {:plug_cowboy, "~> 2.9"},
      {:phoenix_storybook, "~> 1.3"},
      {:styler, "~> 1.0", only: [:dev, :test], runtime: false},
      {:floki, "~> 0.38"},
      {:faker, "~> 0.19"},

      # salad ui
      {:lucide_icons, "~> 2.2"},

      # load local salad_ui on dev from local path
      (Mix.env() == :prod &&
         {:salad_ui, github: "bluzky/salad_ui", tag: "v1.0.0-beta.5"}) ||
        {:salad_ui, path: "../"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to install project dependencies and perform other setup tasks, run:
  #
  #     $ mix setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      setup: ["deps.get", "ecto.setup", "assets.setup", "assets.build"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"],
      "assets.setup": ["tailwind.install --if-missing", "esbuild.install --if-missing"],
      "assets.build": ["tailwind default", "esbuild default"],
      "assets.deploy": [
        "tailwind default --minify",
        "tailwind storybook --minify",
        "esbuild default --minify",
        "phx.digest"
      ]
    ]
  end
end
