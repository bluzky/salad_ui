defmodule SaladStorybookWeb.Storybook do
  @moduledoc false
  use PhoenixStorybook,
    otp_app: :salad_storybook_web,
    content_path: Path.expand("../../storybook", __DIR__),
    # assets path are remote path, not local file-system paths
    css_path: "/assets/storybook.css",
    js_path: "/assets/storybook.js",
    sandbox_class: "salad-storybook-web",
    title: "Salad UI"
end
