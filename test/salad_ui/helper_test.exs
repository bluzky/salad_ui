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

  test "prepare_assign with default value" do
    assigns = %{__changed__: %{}}
    assert %{value: nil} = Helpers.prepare_assign(assigns)

    assigns = %{__changed__: %{}, value: "test"}
    assert %{value: "test"} = Helpers.prepare_assign(assigns)

    assigns = %{__changed__: %{}, value: ""}
    assert %{value: nil} = Helpers.prepare_assign(assigns)

    assigns = %{__changed__: %{}, value: []}
    assert %{value: nil} = Helpers.prepare_assign(assigns)
  end

  test "prepare_assign using default value if value is missing or empty" do
    assigns = %{__changed__: %{}, value: "", "default-value": "default"}
    assert %{value: "default"} = Helpers.prepare_assign(assigns)

    assigns = %{__changed__: %{}, value: nil, "default-value": "default"}
    assert %{value: "default"} = Helpers.prepare_assign(assigns)

    assigns = %{__changed__: %{}, value: [], "default-value": "default"}
    assert %{value: "default"} = Helpers.prepare_assign(assigns)

    assigns = %{__changed__: %{}, value: "test", "default-value": "default"}
    assert %{value: "test"} = Helpers.prepare_assign(assigns)
  end

  test "prepare_assign override name/value if provided" do
    assigns = %{
      __changed__: %{},
      value: "test",
      name: "name",
      field: %Phoenix.HTML.FormField{value: "value", name: "field", id: "a", errors: [], field: :name, form: nil}
    }

    assert %{value: "test", name: "name"} = Helpers.prepare_assign(assigns)
  end

  test "prepare_assign used name/value from field" do
    assigns = %{
      __changed__: %{},
      field: %Phoenix.HTML.FormField{value: "value", name: "field", id: "a", errors: [], field: :name, form: nil}
    }

    assert %{value: "value", name: "field"} = Helpers.prepare_assign(assigns)
  end

  test "prepare_assign build name for multiple" do
    assigns = %{
      __changed__: %{},
      multiple: "true",
      field: %Phoenix.HTML.FormField{value: "value", name: "name", id: "a", errors: [], field: :name, form: nil}
    }

    assert %{name: "name[]"} = Helpers.prepare_assign(assigns)
  end

  test "build error with custom translation function" do
    Application.put_env(:salad_ui, :error_translator_function, {__MODULE__, :translate_error})

    assigns = %{
      __changed__: %{},
      field: %Phoenix.HTML.FormField{
        value: "value",
        name: "name",
        id: "a",
        errors: [{"error 1", []}, {"error 2", []}],
        field: :name,
        form: nil
      }
    }

    assert %{errors: ["translated error 1", "translated error 2"]} = Helpers.prepare_assign(assigns)
  end

  def translate_error({"error 1", _}), do: "translated error 1"
  def translate_error({"error 2", _}), do: "translated error 2"
end
