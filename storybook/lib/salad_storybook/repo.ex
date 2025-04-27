defmodule SaladStorybook.Repo do
  use Ecto.Repo,
    otp_app: :salad_storybook,
    adapter: Ecto.Adapters.Postgres
end
