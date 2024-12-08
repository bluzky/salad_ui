defmodule SaladUI.Patcher.ElixirPatcherTest do
  use ExUnit.Case, async: true

  alias SaladUI.Patcher.ElixirPatcher

  @temp_dir "tmp/test"
  @application_file_path Path.join(@temp_dir, "lib/salad_ui/application.ex")

  setup do
    File.mkdir_p!(Path.dirname(@application_file_path))
    File.touch!(@application_file_path)
    on_exit(fn -> File.rm_rf!(Path.dirname(@application_file_path)) end)
    %{file_path: @application_file_path}
  end

  describe "Test elixir patcher" do
    test "patch_application_supervisor/3 adds new children to an existing children list", %{file_path: file_path} do
      initial_content = """
      defmodule MyApp.Application do
        def start(_type, _args) do
          children = [
            MyApp.Worker
          ]
          Supervisor.start_link(children, strategy: :one_for_one)
        end
      end
      """

      File.write!(file_path, initial_content)

      new_children = "MyApp.NewWorker"
      ElixirPatcher.patch_application_supervisor(file_path, new_children)

      result = File.read!(file_path)
      assert result =~ "MyApp.NewWorker"
    end

    test "patch_application_supervisor/3 adds a new children in a Supervisor.start_link call", %{file_path: file_path} do
      initial_content = """
      defmodule MyApp.Application do
        def start(_type, _args) do
          Supervisor.start_link([], strategy: :one_for_one)
        end
      end
      """

      File.write!(file_path, initial_content)

      new_children = "MyApp.NewWorker"
      ElixirPatcher.patch_application_supervisor(file_path, new_children)

      result = File.read!(file_path)
      assert result =~ "Supervisor.start_link([MyApp.NewWorker], strategy: :one_for_one)"
    end

    test "patch_application_supervisor/3 does not duplicate existing children", %{file_path: file_path} do
      initial_content = """
      defmodule MyApp.Application do
        def start(_type, _args) do
          children = [
            MyApp.Worker,
            MyApp.NewWorker
          ]
          Supervisor.start_link(children, strategy: :one_for_one)
        end
      end
      """

      File.write!(file_path, initial_content)

      new_children = "MyApp.NewWorker"
      ElixirPatcher.patch_application_supervisor(file_path, new_children)

      result = File.read!(file_path)
      assert result =~ "MyApp.NewWorker"
      assert String.contains?(result, "MyApp.NewWorker") == true
    end

    test "patch_application_supervisor/3 returns an error when no suitable location is found", %{file_path: file_path} do
      initial_content = """
      defmodule MyApp.Application do
        def start(_type, _args) do
        end
      end
      """

      File.write!(file_path, initial_content)

      new_children = "MyApp.NewWorker"

      assert {:error, _} =
               ElixirPatcher.patch_application_supervisor(file_path, new_children)
    end
  end
end
