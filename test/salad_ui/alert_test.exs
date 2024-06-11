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

      assert html =~
               "<div class=\"relative p-4 rounded-lg bg-background text-foreground w-full [&amp;&gt;span+div]:translate-y-[-3px] [&amp;&gt;span]:absolute [&amp;&gt;span]:left-4 [&amp;&gt;span]:top-4 [&amp;&gt;span~*]:pl-7 border\">"

      assert html =~ "<h5 class=\"mb-1 tracking-tight font-medium leading-none\">"

      assert html =~ "Heads up!"
      assert html =~ "Alert Descriptions"
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

      # Confirm the style rendering
      assert html =~ "relative p-4 rounded-lg border-destructive/50 text-destructive w-full dark:border-destructive"

      assert html =~ "Heads up!"
      assert html =~ "You can add components to your app using the cli"
    end

    test "It renders alert title correctly" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.alert_title>Alert title</.alert_title>
        """)

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
    end
  end
end
