defmodule SaladUI.LiveViewTest do
  use ExUnit.Case, async: true

  alias Phoenix.LiveView.JS

  describe "SaladUI.JS.dispatch_command/3" do
    test "supports direct call with opts and scopes client command by default" do
      assert %JS{ops: [["dispatch", args]]} = SaladUI.JS.dispatch_command("open", to: "#dialog")

      assert args.event == "salad_ui:command"
      assert args.to == "#dialog"
      assert args.bubbles == false
      assert args.detail == %{command: "open", params: %{}}
    end

    test "supports JS pipeline, command params, and explicit bubbling override" do
      js = SaladUI.JS.dispatch_command(%JS{}, "update", to: "#chart", detail: %{data: %{labels: [1]}}, bubbles: true)

      assert %JS{ops: [["dispatch", args]]} = js
      assert args.to == "#chart"
      assert args.bubbles == true
      assert args.detail == %{command: "update", params: %{data: %{labels: [1]}}}
    end
  end
end
