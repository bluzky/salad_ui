defmodule SaladUI.HelperTest do
  use ExUnit.Case, async: true

  alias SaladUI.Helpers

  @vertical_align_classes %{
    "start" => "top-0",
    "center" => "top-1/2 -translate-y-1/2 slide-in-from-top-1/2",
    "end" => "bottom-0"
  }

  @horizontal_align_classes %{
    "start" => "left-0",
    "center" => "left-1/2 -translate-x-1/2 slide-in-from-left-1/2",
    "end" => "right-0"
  }

  @side_classes %{
    "top" => "bottom-full mb-2",
    "bottom" => "top-full mt-2",
    "left" => "right-full mr-2",
    "right" => "left-full ml-2"
  }

  test "build variant for side with default center align" do
    for side <- ["top", "bottom"] do
      assert Helpers.side_variant(side) =~ @side_classes[side]
      assert Helpers.side_variant(side) =~ @horizontal_align_classes["center"]
    end

    for side <- ["left", "right"] do
      assert Helpers.side_variant(side) =~ @side_classes[side]
      assert Helpers.side_variant(side) =~ @vertical_align_classes["center"]
    end
  end

  test "build variant with correct allignment for top and bottom" do
    for side <- ["top", "bottom"], align <- ["start", "center", "end"] do
      assert Helpers.side_variant(side, align) =~ @horizontal_align_classes[align]
    end
  end

  test "build variant with correct allignment for left and right" do
    for side <- ["left", "right"], align <- ["start", "center", "end"] do
      assert Helpers.side_variant(side, align) =~ @vertical_align_classes[align]
    end
  end
end
