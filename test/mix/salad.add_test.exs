defmodule Mix.Tasks.Salad.AddTest do
  use SaladUI.Test.MixTaskCase

  alias Mix.Tasks.Salad.Add

  # The salad.add mix task returns a shortened list of available components
  # when we are in test environment. This module attribute should match that
  # list to ensure the task behaves as expected. See
  # `list_available_components/1` of `Mix.Tasks.Salad.Add` module
  @available_components ["button", "card", "input"]

  @components_path "test/support/components"

  setup do
    Application.put_env(:salad_ui, :components_path, @components_path)

    on_exit(fn ->
      Application.delete_env(:salad_ui, :components_path)
      File.rm_rf!(@components_path)
    end)

    :ok
  end

  test "run/1 with 'all' installs all available components" do
    File.mkdir_p!(@components_path)
    Add.run(["all"])

    Enum.each(@available_components, fn component ->
      assert_mix_output(:info, "#{component} component installed successfully ✅")
      assert File.exists?("test/support/components/#{component}.ex")
    end)
  end

  test "run/1 with valid component names installs specified components" do
    Add.run(["button", "card"])

    assert_mix_output(:info, "button component installed successfully ✅")
    assert_mix_output(:info, "card component installed successfully ✅")
    assert File.exists?("test/support/components/button.ex")
    assert File.exists?("test/support/components/card.ex")
    refute File.exists?("test/support/components/progress.ex")
  end

  test "run/1 with invalid component names reports errors" do
    Add.run(["invalid_component"])

    assert_mix_output(:error, "Invalid components:\ninvalid_component")
  end
end
