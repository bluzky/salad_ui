defmodule SaladUI.AlertTest do
  use ComponentCase

  import SaladUI.Alert

  describe "Test Alerting" do
    test "it renders default alert correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.alert>
          <.alert_title>Heads up!</.alert_title>

          <.alert_description>Alert Descriptions</.alert_description>
        </.alert>
        """)

      assert html =~ "<h5 class=\"mb-1 tracking-tight font-medium leading-none\">"
      assert html =~ "Heads up!"
      assert html =~ "Alert Descriptions"

      for class <- ~w(relative w-full rounded-lg border p-4 absolute left-4 top-4) do
        assert html =~ class
      end
    end

    test "It renders destructive alert correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.alert variant="destructive">
          <.alert_title>Heads up!</.alert_title>

          <.alert_description>
            You can add components to your app using the cli
          </.alert_description>
        </.alert>
        """)

      for class <- ~w(relative p-4 rounded-lg border-destructive/50 text-destructive w-full dark:border-destructive) do
        assert html =~ class
      end

      assert html =~ "Heads up!"
      assert html =~ "You can add components to your app using the cli"
    end

    test "It renders alert title correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.alert_title>Alert title</.alert_title>
        """)

      for class <- ~w(mb-1 font-medium leading-none tracking-tight) do
        assert html =~ class
      end

      assert html =~ "<h5 class=\"mb-1"
      assert html =~ "Alert title"
      assert html =~ "</h5>"
    end

    test "it renders alert description correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.alert_description>Alert description</.alert_description>
        """)

      assert html =~ "Alert description"
      assert html =~ "<div class=\"text-sm [&amp;_p]:leading-relaxed\">"

      for class <- ~w(text-sm leading-relaxed) do
        assert html =~ class
      end
    end
  end
end
