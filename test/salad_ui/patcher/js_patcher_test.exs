defmodule SaladUI.Patcher.JSPatcherTest do
  use ExUnit.Case

  alias SaladUI.Patcher.JSPatcher

  @temp_dir "test/temp"
  @js_file "#{@temp_dir}/app.js"
  @code_to_add_file "#{@temp_dir}/code_to_add.js"

  setup do
    File.mkdir_p!(@temp_dir)
    on_exit(fn -> File.rm_rf!(@temp_dir) end)
  end

  describe "Test JS patcher" do
    test "patch/2 adds new code when JS file is empty" do
      File.write!(@js_file, "")
      File.write!(@code_to_add_file, "console.log('Hello, SaladUI!');")

      JSPatcher.patch(@js_file, @code_to_add_file)

      patched_content = File.read!(@js_file)
      assert patched_content =~ "// Allows to execute JS commands from the server"
      assert patched_content =~ "console.log('Hello, SaladUI!');"
    end

    test "patch/2 appends new code to existing content" do
      initial_content = "const app = {};"
      File.write!(@js_file, initial_content)
      File.write!(@code_to_add_file, "console.log('Hello, SaladUI!');")

      JSPatcher.patch(@js_file, @code_to_add_file)

      patched_content = File.read!(@js_file)
      assert patched_content =~ initial_content
      assert patched_content =~ "// Allows to execute JS commands from the server"
      assert patched_content =~ "console.log('Hello, SaladUI!');"
    end

    test "patch/2 doesn't duplicate code if it already exists" do
      initial_content = """
      const app = {};
      // Allows to execute JS commands from the server
      console.log('Hello, SaladUI!');
      """

      File.write!(@js_file, initial_content)
      File.write!(@code_to_add_file, "console.log('Hello, SaladUI!');")

      JSPatcher.patch(@js_file, @code_to_add_file)

      patched_content = File.read!(@js_file)
      assert patched_content == initial_content
    end
  end
end
