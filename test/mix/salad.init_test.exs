defmodule Mix.Tasks.Salad.InitTest do
  use SaladUI.Test.MixTaskCase, async: true

  alias Mix.Tasks.Salad.Init

  @tmp_dir "test_init"
  @default_components_path Path.join([@tmp_dir, "lib/test_app_web/components/ui"])

  setup do
    # The shell asks for a path to install components.
    # We will use the default path for testing.
    send(self(), {:mix_shell_input, :prompt, @default_components_path})

    # The shell asks for a color scheme to use.
    # We will use the default color scheme for testing
    # by entering an empty string.
    send(self(), {:mix_shell_input, :prompt, ""})

    :ok
  end

  test "run/1 initializes SaladUI" do
    in_tmp(@tmp_dir, fn ->
      # Create a mock mix.exs file
      File.write!("mix.exs", "defmodule TestApp.MixProject do use Mix.Project\nend")

      File.mkdir_p!("config")
      File.mkdir_p!("assets/css")
      File.mkdir_p!("assets/js")
      File.mkdir_p!(@default_components_path)

      File.write!("config/config.exs", "import Config\n")
      File.write!("config/dev.exs", "import Config\n")
      File.write!("assets/css/app.css", "/* Original app.css content */\n")
      File.write!("assets/js/app.js", "// Original app.js content\n")
      File.write!("assets/tailwind.config.js", "module.exports = {\n  // Original tailwind config\n}\n")

      # Both helpers.ex and component.ex are created
      # in a path built using the app name.
      # In test, the app name is "salad_ui", so
      # we need the path `salad_ui_web` and search those file in that path
      File.mkdir_p!("lib/salad_ui_web")

      # Mock the _build directory structure
      priv_dir = "_build/test/lib/salad_ui/priv/static/assets"
      File.mkdir_p!(priv_dir)
      File.write!(Path.join(priv_dir, "tailwind.colors.json"), "{}")
      File.write!(Path.join(priv_dir, "server-events.js"), "// server events")
      File.mkdir_p!(Path.join(priv_dir, "colors"))
      File.write!(Path.join([priv_dir, "colors", "gray.css"]), "/* gray theme */")

      # Mock a helper source file
      File.mkdir_p!("lib/salad_ui")
      File.write!("lib/salad_ui/helpers.ex", "defmodule TestAppWeb.Helpers do")

      Init.run([])

      # Allow some time for file operations to complete
      :timer.sleep(100)

      assert File.exists?(@default_components_path)

      config_content = File.read!("config/config.exs")
      assert config_content =~ "config :tails, colors_file:"
      assert config_content =~ "Path.join(File.cwd!(), \"assets/tailwind.colors.json\")"

      dev_config_content = File.read!("config/dev.exs")
      assert dev_config_content =~ "config :salad_ui, components_path:"
      assert dev_config_content =~ "Path.join(File.cwd!(), \"#{@default_components_path}\")"

      assert File.read!("assets/css/app.css") =~ "/* gray theme */"
      assert File.read!("assets/js/app.js") =~ "// server events"
      assert File.exists?("assets/tailwind.colors.json")
      assert File.read!("assets/tailwind.config.js") =~ "require(\"./tailwind.colors.json\")"
      assert File.read!("lib/salad_ui_web/helpers.ex") =~ "defmodule TestAppWeb.Helpers do"
      assert File.read!("lib/salad_ui_web/component.ex") =~ "defmodule SaladUiWeb.Component do"
    end)
  end

  test "run/1 handles errors gracefully" do
    in_tmp(@tmp_dir, fn ->
      Init.run([])
      assert_mix_output(:error, "Error during setup: dev.exs not found")
    end)
  end
end
