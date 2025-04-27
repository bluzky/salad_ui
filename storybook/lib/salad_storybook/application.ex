defmodule SaladStorybook.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      SaladStorybookWeb.Telemetry,
      # SaladStorybook.Repo,
      {DNSCluster, query: Application.get_env(:salad_storybook, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: SaladStorybook.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: SaladStorybook.Finch},
      # Start a worker by calling: SaladStorybook.Worker.start_link(arg)
      # {SaladStorybook.Worker, arg},
      # Start to serve requests, typically the last entry
      TwMerge.Cache,
      SaladStorybookWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: SaladStorybook.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    SaladStorybookWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
