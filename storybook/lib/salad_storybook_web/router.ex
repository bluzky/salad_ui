defmodule SaladStorybookWeb.Router do
  use SaladStorybookWeb, :router

  import PhoenixStorybook.Router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {SaladStorybookWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/" do
    storybook_assets()
  end

  scope "/demo", SaladStorybookWeb do
    pipe_through :browser

    live "/dashboard-one", Demo.DashboardOne
    live "/dashboard-two", Demo.DashboardTwo
    live "/dashboard-three", Demo.DashboardThree
    live "/sidebar-one", Demo.SidebarOne
    live "/sidebar-two", Demo.SidebarTwo
    live "/sidebar-three", Demo.SidebarThree
    live "/sidebar-four", Demo.SidebarFour
    live "/sidebar-five", Demo.SidebarFive
    live "/sidebar-six", Demo.SidebarSix
    live "/demo", Demo.Demo
  end

  scope "/", SaladStorybookWeb do
    pipe_through :browser

    live_storybook("/", backend_module: SaladStorybookWeb.Storybook)
  end

  # Other scopes may use custom stacks.
  # scope "/api", SaladStorybookWeb do
  #   pipe_through :api
  # end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:salad_storybook, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    #   import Phoenix.LiveDashboard.Router

    #   scope "/dev" do
    #     pipe_through :browser

    #     live_dashboard "/dashboard", metrics: SaladStorybookWeb.Telemetry
    #     forward "/mailbox", Plug.Swoosh.MailboxPreview
    #   end
  end
end
