defmodule SaladUI.AlertTest do
  use ComponentCase

  import SaladUI.Alert

  test "it renders default alert correctly" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.alert>
        <.alert_title>Heads up!</.alert_title>

        <.alert_description>Alert Descriptions</.alert_description>
      </.alert>
      """)

    # Assert the style rendering
    assert html =~
             "<div class=\"relative p-4 rounded-lg bg-background text-foreground w-full [&amp;&gt;span+div]:translate-y-[-3px] [&amp;&gt;span]:absolute [&amp;&gt;span]:left-4 [&amp;&gt;span]:top-4 [&amp;&gt;span~*]:pl-7 border\">"

    assert html =~ "<h5 class=\"mb-1 tracking-tight font-medium leading-none\">"

    # Confirm that the text is displayed on the screen
    assert html =~ "Heads up!"
    assert html =~ "Alert Descriptions"
  end

  test "It renders Destructive alert correctly" do
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
end
