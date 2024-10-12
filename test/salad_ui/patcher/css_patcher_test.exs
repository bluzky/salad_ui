defmodule SaladUI.Patcher.CSSPatcherTest do
  use ExUnit.Case

  alias SaladUI.Patcher.CSSPatcher

  @temp_dir "test/temp"
  @css_file "#{@temp_dir}/app.css"
  @color_scheme_file "#{@temp_dir}/color_scheme.css"

  setup do
    File.mkdir_p!(@temp_dir)
    on_exit(fn -> File.rm_rf!(@temp_dir) end)
  end

  describe "Test CSS patcher" do
    test "patch/2 adds color scheme and body tweaks when CSS file is empty" do
      File.write!(@css_file, "")
      File.write!(@color_scheme_file, ":root { --primary: #000; }")

      CSSPatcher.patch(@css_file, @color_scheme_file)

      patched_content = File.read!(@css_file)
      assert patched_content =~ "@layer base {"
      assert patched_content =~ ":root { --primary: #000; }"
      assert patched_content =~ "body {"
      assert patched_content =~ "@apply bg-background text-foreground;"
    end

    test "patch/2 appends to existing body selector" do
      initial_content = """
      body {
        margin: 0;
      }
      """

      File.write!(@css_file, initial_content)
      File.write!(@color_scheme_file, ":root { --primary: #000; }")

      CSSPatcher.patch(@css_file, @color_scheme_file)

      patched_content = File.read!(@css_file)
      assert patched_content =~ "body {"
      assert patched_content =~ "margin: 0;"
      assert patched_content =~ "@apply bg-background text-foreground;"
    end

    test "patch/2 doesn't duplicate body tweaks" do
      initial_content = """
      body {
        @apply bg-background text-foreground;
      }
      """

      File.write!(@css_file, initial_content)
      File.write!(@color_scheme_file, ":root { --primary: #000; }")

      CSSPatcher.patch(@css_file, @color_scheme_file)

      patched_content = File.read!(@css_file)
      assert patched_content =~ "body {"
      assert patched_content =~ "@apply bg-background text-foreground;"

      refute String.contains?(
               patched_content,
               "@apply bg-background text-foreground;\n  @apply bg-background text-foreground;"
             )
    end

    test "patch/2 inserts after @import statements" do
      initial_content = """
      @import 'tailwindcss/base';
      @import 'tailwindcss/components';
      @import 'tailwindcss/utilities';
      """

      File.write!(@css_file, initial_content)
      File.write!(@color_scheme_file, ":root { --primary: #000; }")

      CSSPatcher.patch(@css_file, @color_scheme_file)

      patched_content = File.read!(@css_file)
      [imports, rest] = String.split(patched_content, "@import 'tailwindcss/utilities';")
      assert imports =~ "@import 'tailwindcss/base';"
      assert imports =~ "@import 'tailwindcss/components';"
      assert rest =~ "body {"
      assert rest =~ "@layer base {"
    end
  end
end
