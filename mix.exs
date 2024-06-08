defmodule SaladUI.MixProject do
  use Mix.Project

  def project do
    [
      app: :salad_ui,
      version: "0.4.1",
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      name: "SaladUI",
      description: description(),
      source_url: "https://github.com/bluzky/salad_ui",
      docs: docs(),
      package: package()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger]
    ]
  end

  defp package do
    [
      maintainers: ["Dung Nguyen"],
      licenses: ["MIT"],
      links: %{"GitHub" => "https://github.com/bluzky/salad_ui"},
      files: ~w(lib assets .formatter.exs mix.exs README*)
    ]
  end

  defp description do
    "Phoenix UI components library inspired by shadcn ui"
  end

  defp docs do
    [
      main: "readme",
      extras: ["README.md"]
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:phoenix_live_view, "~> 0.20.1"},
      {:tails, "~> 0.1.5"},
      {:styler, "~> 0.7", only: [:dev, :test], runtime: false},
      {:ex_doc, ">= 0.0.0", only: :dev, runtime: false}

      # {:dep_from_hexpm, "~> 0.3.0"},
      # {:dep_from_git, git: "https://github.com/elixir-lang/my_dep.git", tag: "0.1.0"}
    ]
  end
end
