defmodule SaladUI.Patcher.TailwindPatcherTest do
  use ExUnit.Case

  alias SaladUI.Patcher.TailwindPatcher

  @temp_dir "test/temp"
  @tailwind_css "#{@temp_dir}/app.css"

  setup do
    File.mkdir_p!(@temp_dir)
    on_exit(fn -> File.rm_rf!(@temp_dir) end)
  end

  describe "Test Tailwind CSS entrypoint patcher" do
    test "patch/1 adds v4 import, sources, plugins, and theme when missing" do
      File.write!(@tailwind_css, "")

      TailwindPatcher.patch(@tailwind_css)

      patched_content = File.read!(@tailwind_css)
      assert patched_content =~ ~s(@import "tailwindcss";)
      assert patched_content =~ ~s(@source "../js";)
      assert patched_content =~ ~s(@source "../../lib";)
      assert patched_content =~ ~s(@source "../../deps/salad_ui/lib";)
      assert patched_content =~ ~s(@plugin "@tailwindcss/typography";)
      assert patched_content =~ ~s(@plugin "../vendor/tailwindcss-animate";)
      assert patched_content =~ "@theme {"
      assert patched_content =~ "--color-background: hsl(var(--background));"
    end

    test "patch/1 doesn't duplicate existing directives" do
      initial_content = """
      @import "tailwindcss";
      @source "../js";
      @source "../../lib";
      @source "../../deps/salad_ui/lib";
      @plugin "@tailwindcss/typography";
      @plugin "../vendor/tailwindcss-animate";
      @theme {
        --color-background: hsl(var(--background));
      }
      """

      File.write!(@tailwind_css, initial_content)

      TailwindPatcher.patch(@tailwind_css)

      patched_content = File.read!(@tailwind_css)

      assert count(patched_content, ~s(@import "tailwindcss";)) == 1
      assert count(patched_content, ~s(@source "../js";)) == 1
      assert count(patched_content, ~s(@source "../../lib";)) == 1
      assert count(patched_content, ~s(@source "../../deps/salad_ui/lib";)) == 1
      assert count(patched_content, ~s(@plugin "@tailwindcss/typography";)) == 1
      assert count(patched_content, ~s(@plugin "../vendor/tailwindcss-animate";)) == 1
      assert count(patched_content, "--color-background:") == 1
    end

    test "patch/1 replaces v3 Tailwind imports" do
      initial_content = """
      @import "tailwindcss/base";
      @import "tailwindcss/components";
      @import "tailwindcss/utilities";
      """

      File.write!(@tailwind_css, initial_content)

      TailwindPatcher.patch(@tailwind_css)

      patched_content = File.read!(@tailwind_css)

      assert patched_content =~ ~s(@import "tailwindcss";)
      refute patched_content =~ "tailwindcss/base"
      refute patched_content =~ "tailwindcss/components"
      refute patched_content =~ "tailwindcss/utilities"
    end
  end

  defp count(content, pattern) do
    content |> String.split(pattern) |> length() |> Kernel.-(1)
  end
end
