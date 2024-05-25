defmodule SaladUiTest do
  use ExUnit.Case
  doctest SaladUI

  test "greets the world" do
    assert SaladUI.hello() == :world
  end
end
