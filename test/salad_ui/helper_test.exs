defmodule SaladUI.HelperTest do
  use ExUnit.Case, async: true

  alias SaladUI.Helpers

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
