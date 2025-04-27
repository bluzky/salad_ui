defmodule Mix.Tasks.Salad.InitTest do
  use SaladUI.Test.MixTaskCase, async: true

  alias Mix.Tasks.Salad.Init

  @tmp_dir "test_init"
  @default_components_path Path.join(["lib/test_app_web/components"])
  @application_file_path "lib/salad_ui/application.ex"

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
      File.write!("mix.exs", "defmodule SaladUI.MixProject do use Mix.Project\nend")

      File.mkdir_p!("config")
      File.mkdir_p!(Path.dirname(@application_file_path))
      File.mkdir_p!("assets/css")
      File.mkdir_p!("assets/js")
      File.mkdir_p!("assets/vendor")
      File.mkdir_p!(@default_components_path)

      File.write!("config/config.exs", "import Config\n")
      File.write!("config/dev.exs", "import Config\n")
      File.write!(@application_file_path, "children = []\n")
      File.write!("assets/css/app.css", "/* Original app.css content */\n")
      File.write!("assets/js/app.js", "// Original app.js content\n")

      File.write!(
        "assets/tailwind.config.js",
        "module.exports = {\n  // Original tailwind config\n}\n"
      )

      # Mock the _build directory structure
      priv_dir = "_build/test/lib/salad_ui/priv/static/assets"
      File.mkdir_p!(priv_dir)
      File.write!(Path.join(priv_dir, "tailwind.colors.json"), "{}")
      File.write!(Path.join(priv_dir, "server-events.js"), "// server events")
      File.mkdir_p!(Path.join(priv_dir, "colors"))
      File.write!(Path.join([priv_dir, "colors", "gray.css"]), "/* gray theme */")

      Init.run([])
      # Allow some time for file operations to complete
      :timer.sleep(100)

      assert File.exists?(@default_components_path)
      dev_config_content = File.read!("config/dev.exs")
      assert dev_config_content =~ "config :salad_ui, components_path:"
      assert dev_config_content =~ "Path.join(File.cwd!(), \"#{@default_components_path}\")"

      application_file_content = File.read!(@application_file_path)
      assert application_file_content =~ "TwMerge.Cache"

      assert File.read!("assets/css/app.css") =~ "/* gray theme */"
      assert File.read!("assets/js/app.js") =~ "// server events"
      assert File.exists?("assets/tailwind.colors.json")
      assert File.read!("assets/tailwind.config.js") =~ "require(\"./tailwind.colors.json\")"

      assert File.read!("lib/test_app_web/components/helpers.ex") =~
               "defmodule SaladUIWeb.ComponentHelpers do"

      assert File.read!("lib/test_app_web/components/component.ex") =~
               "defmodule SaladUIWeb.Component do"
    end)
  end

  test "run/1 handles errors gracefully" do
    in_tmp(@tmp_dir, fn ->
      Init.run([])
      assert_mix_output(:error, "Error during setup: dev.exs not found")
    end)
  end
end
