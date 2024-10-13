defmodule SaladUI.Patcher.ConfigPatcherTest do
  use ExUnit.Case

  alias SaladUI.Patcher.ConfigPatcher

  @temp_dir "tmp/test"
  @config_file Path.join(@temp_dir, "config.exs")
  @components_path "lib/components"

  setup do
    File.mkdir_p!(@temp_dir)
    on_exit(fn -> File.rm_rf!(@temp_dir) end)
  end

  describe "Test config patcher" do
    test "patch/2 adds salad_ui config when it's missing" do
      initial_content = """
      import Config
      """

      File.write!(@config_file, initial_content)

      configs_to_add = [
        salad_ui: %{
          description: "Path to install SaladUI components",
          values: [components_path: "Path.join(File.cwd!(), \"#{@components_path}\")"]
        }
      ]

      ConfigPatcher.patch(@config_file, configs: configs_to_add)

      assert File.read!(@config_file) =~ "config :salad_ui,"
      assert File.read!(@config_file) =~ "components_path: Path.join(File.cwd!(), \"#{@components_path}\")"
    end

    test "patch/2 adds tails config when it's missing" do
      initial_content = """
      import Config
      """

      File.write!(@config_file, initial_content)

      configs_to_add = [
        tails: %{
          description: "SaladUI use tails to properly merge Tailwind CSS classes",
          values: [colors_file: "Path.join(File.cwd!(), \"assets/tailwind.colors.json\")"]
        }
      ]

      ConfigPatcher.patch(@config_file, configs: configs_to_add)

      assert File.read!(@config_file) =~ "config :tails,"
      assert File.read!(@config_file) =~ "colors_file: Path.join(File.cwd!(), \"assets/tailwind.colors.json\")"
    end

    test "patch/2 adds both salad_ui and tails configs when they're missing" do
      initial_content = """
      import Config
      """

      File.write!(@config_file, initial_content)

      configs_to_add = [
        salad_ui: %{
          description: "Path to install SaladUI components",
          values: [components_path: "Path.join(File.cwd!(), \"#{@components_path}\")"]
        },
        tails: %{
          description: "SaladUI use tails to properly merge Tailwind CSS classes",
          values: [colors_file: "Path.join(File.cwd!(), \"assets/tailwind.colors.json\")"]
        }
      ]

      ConfigPatcher.patch(@config_file, configs: configs_to_add)

      assert File.read!(@config_file) =~ "config :salad_ui,"
      assert File.read!(@config_file) =~ "components_path: Path.join(File.cwd!(), \"#{@components_path}\")"
      assert File.read!(@config_file) =~ "config :tails,"
      assert File.read!(@config_file) =~ "colors_file: Path.join(File.cwd!(), \"assets/tailwind.colors.json\")"
    end

    test "patch/2 doesn't add configs when they already exist" do
      initial_content = """
      import Config
      config :salad_ui, components_path: "/some/path"
      config :tails, colors_file: "/some/file.json"
      """

      configs_to_add = [
        salad_ui: %{
          description: "Path to install SaladUI components",
          values: [components_path: "Path.join(File.cwd!(), \"#{@components_path}\")"]
        },
        tails: %{
          description: "SaladUI use tails to properly merge Tailwind CSS classes",
          values: [colors_file: "Path.join(File.cwd!(), \"assets/tailwind.colors.json\")"]
        }
      ]

      File.write!(@config_file, initial_content)

      ConfigPatcher.patch(@config_file, configs: configs_to_add)

      assert File.read!(@config_file) == initial_content
    end

    test "patch/2 inserts config before import_config if present" do
      initial_content = """
      import Config
      # Some comment
      import_config "#{Mix.env()}.exs"
      """

      File.write!(@config_file, initial_content)

      configs_to_add = [
        salad_ui: %{
          description: "Path to install SaladUI components",
          values: [components_path: "Path.join(File.cwd!(), \"#{@components_path}\")"]
        },
        tails: %{
          description: "SaladUI use tails to properly merge Tailwind CSS classes",
          values: [colors_file: "Path.join(File.cwd!(), \"assets/tailwind.colors.json\")"]
        }
      ]

      ConfigPatcher.patch(@config_file, configs: configs_to_add)

      content = File.read!(@config_file)
      assert content =~ "config :salad_ui,"
      assert content =~ "config :tails,"
      assert String.ends_with?(content, "import_config \"#{Mix.env()}.exs\"\n")
    end
  end
end
