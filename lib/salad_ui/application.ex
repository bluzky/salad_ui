defmodule SaladUI.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      SaladUIWeb.Telemetry,
      TwMerge.Cache,
      {DNSCluster, query: Application.get_env(:salad_ui, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: SaladUI.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: SaladUI.Finch},
      # Start a worker by calling: SaladUI.Worker.start_link(arg)
      # {SaladUI.Worker, arg},
      # Start to serve requests, typically the last entry
      SaladUIWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: SaladUI.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    SaladUIWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
