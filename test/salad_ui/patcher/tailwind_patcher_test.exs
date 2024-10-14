defmodule SaladUI.Patcher.TailwindPatcherTest do
  use ExUnit.Case

  alias SaladUI.Patcher.TailwindPatcher

  @temp_dir "test/temp"
  @tailwind_config "#{@temp_dir}/tailwind.config.js"

  setup do
    File.mkdir_p!(@temp_dir)
    on_exit(fn -> File.rm_rf!(@temp_dir) end)
  end

  describe "Test Tailwind CSS config patcher" do
    test "patch/1 adds plugins when missing" do
      initial_content = "module.exports = {}"
      File.write!(@tailwind_config, initial_content)

      TailwindPatcher.patch(@tailwind_config)

      patched_content = File.read!(@tailwind_config)
      assert patched_content =~ "plugins: ["
      assert patched_content =~ "require(\"@tailwindcss/typography\")"
      assert patched_content =~ "require(\"tailwindcss-animate\")"
    end

    test "patch/1 doesn't duplicate existing plugins" do
      initial_content = """
      module.exports = {
        plugins: [
          require("@tailwindcss/typography"),
          require("tailwindcss-animate")
        ]
      }
      """

      File.write!(@tailwind_config, initial_content)

      TailwindPatcher.patch(@tailwind_config)

      patched_content = File.read!(@tailwind_config)

      assert patched_content =~ "require(\"@tailwindcss/typography\")"
      assert patched_content =~ "require(\"tailwindcss-animate\")"

      # Count occurrences of each plugin
      typography_count = patched_content |> String.split("@tailwindcss/typography") |> length() |> Kernel.-(1)
      animate_count = patched_content |> String.split("tailwindcss-animate") |> length() |> Kernel.-(1)

      assert typography_count == 1
      assert animate_count == 1
    end

    test "patch/1 adds theme and colors config when missing" do
      initial_content = "module.exports = {}"
      File.write!(@tailwind_config, initial_content)

      TailwindPatcher.patch(@tailwind_config)

      patched_content = File.read!(@tailwind_config)
      assert patched_content =~ "theme: {"
      assert patched_content =~ "extend: {"
      assert patched_content =~ "colors: require(\"./tailwind.colors.json\")"
    end

    test "patch/1 updates existing colors config" do
      initial_content = """
      module.exports = {
        theme: {
          extend: {
            colors: {
              primary: '#000000'
            }
          }
        }
      }
      """

      File.write!(@tailwind_config, initial_content)

      TailwindPatcher.patch(@tailwind_config)

      patched_content = File.read!(@tailwind_config)
      assert patched_content =~ "colors: require(\"./tailwind.colors.json\")"
      refute patched_content =~ "primary: '#000000'"
    end

    test "patch/1 doesn't duplicate theme and colors config" do
      initial_content = """
      module.exports = {
        theme: {
          extend: {
            colors: require("./tailwind.colors.json")
          }
        }
      }
      """

      File.write!(@tailwind_config, initial_content)

      TailwindPatcher.patch(@tailwind_config)

      patched_content = File.read!(@tailwind_config)

      assert patched_content =~ """
               theme: {
                 extend: {
                   colors: require("./tailwind.colors.json")
                 }
               }
             """

      # Count ocurrences
      theme_count = patched_content |> String.split("theme: {") |> length() |> Kernel.-(1)
      expand_count = patched_content |> String.split("extend: {") |> length() |> Kernel.-(1)
      colors_count = patched_content |> String.split("colors: require") |> length() |> Kernel.-(1)

      assert theme_count == 1
      assert expand_count == 1
      assert colors_count == 1
    end
  end
end
