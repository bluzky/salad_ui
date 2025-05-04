==> salad_ui
defmodule Storybook.SaladUIComponents.Sheet do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladUI.Button
  alias SaladUI.Input
  alias SaladUI.Label
  alias SaladUI.Sheet

  def function, do: &Sheet.sheet/1

  def imports,
    do: [
      {Sheet,
       [
         sheet_trigger: 1,
         sheet_content: 1,
         sheet_header: 1,
         sheet_title: 1,
         sheet_footer: 1,
         sheet_description: 1,
         sheet_close: 1
       ]},
      {Button, [button: 1]},
      {Input, [input: 1]},
      {Label, [label: 1]}
    ]

  def variations do
    [
      %Variation{
        id: :default,
        description: """
        Sheets slide in from one of four sides: top, right, bottom, or left. Default is `right`.
        """,
        template: """
        <.sheet id="sheet-default">
          <.sheet_trigger>
            <.button variant="outline">Open Sheet</.button>
          </.sheet_trigger>
          <.sheet_content side="right">
            <.sheet_header>
              <.sheet_title>Edit profile</.sheet_title>
              <.sheet_description>
                Make changes to your profile here. Click save when you're done.
              </.sheet_description>
            </.sheet_header>
            <div class="grid gap-4 py-4">
              <div class="grid grid-cols-4 items-center gap-4">
                <.label for="name" class="text-right">
                  Name
                </.label>
                <.input id="name" value="Pedro Duarte" class="col-span-3" />
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <.label for="username" class="text-right">
                  Username
                </.label>
                <.input id="username" value="@peduarte" class="col-span-3" />
              </div>
            </div>
            <.sheet_footer>
              <.sheet_close>
                <.button type="submit" phx-click="save">Save changes</.button>
              </.sheet_close>
            </.sheet_footer>
          </.sheet_content>
        </.sheet>
        """
      },
      %Variation{
        id: :sides,
        description: """
        Sheets can appear from any of the four sides of the screen.
        """,
        template: """
        <div class="flex flex-wrap gap-4">
          <.sheet id="sheet-left">
            <.sheet_trigger>
              <.button variant="outline">From Left</.button>
            </.sheet_trigger>
            <.sheet_content side="left">
              <.sheet_header>
                <.sheet_title>Left Sheet</.sheet_title>
                <.sheet_description>This sheet slides in from the left side.</.sheet_description>
              </.sheet_header>
              <.sheet_footer>
                <.sheet_close>
                  <.button>Close</.button>
                </.sheet_close>
              </.sheet_footer>
            </.sheet_content>
          </.sheet>

          <.sheet id="sheet-right">
            <.sheet_trigger>
              <.button variant="outline">From Right</.button>
            </.sheet_trigger>
            <.sheet_content side="right">
              <.sheet_header>
                <.sheet_title>Right Sheet</.sheet_title>
                <.sheet_description>This sheet slides in from the right side.</.sheet_description>
              </.sheet_header>
              <.sheet_footer>
                <.sheet_close>
                  <.button>Close</.button>
                </.sheet_close>
              </.sheet_footer>
            </.sheet_content>
          </.sheet>

          <.sheet id="sheet-top">
            <.sheet_trigger>
              <.button variant="outline">From Top</.button>
            </.sheet_trigger>
            <.sheet_content side="top">
              <.sheet_header>
                <.sheet_title>Top Sheet</.sheet_title>
                <.sheet_description>This sheet slides in from the top.</.sheet_description>
              </.sheet_header>
              <.sheet_footer>
                <.sheet_close>
                  <.button>Close</.button>
                </.sheet_close>
              </.sheet_footer>
            </.sheet_content>
          </.sheet>

          <.sheet id="sheet-bottom">
            <.sheet_trigger>
              <.button variant="outline">From Bottom</.button>
            </.sheet_trigger>
            <.sheet_content side="bottom">
              <.sheet_header>
                <.sheet_title>Bottom Sheet</.sheet_title>
                <.sheet_description>This sheet slides in from the bottom.</.sheet_description>
              </.sheet_header>
              <.sheet_footer>
                <.sheet_close>
                  <.button>Close</.button>
                </.sheet_close>
              </.sheet_footer>
            </.sheet_content>
          </.sheet>
        </div>
        """
      },
      %Variation{
        id: :programmatic,
        description: """
        Sheets can be controlled programmatically using LiveView's JS commands.
        """,
        template: """
        <div class="space-y-4">
          <.sheet id="sheet-programmatic">
            <.sheet_content side="right">
              <.sheet_header>
                <.sheet_title>Programmatic Sheet</.sheet_title>
                <.sheet_description>
                  This sheet is controlled programmatically from outside.
                </.sheet_description>
              </.sheet_header>
              <div class="py-4">
                <p>The sheet was opened using a JS command rather than a trigger.</p>
              </div>
              <.sheet_footer>
                <.sheet_close>
                  <.button>Close</.button>
                </.sheet_close>
              </.sheet_footer>
            </.sheet_content>
          </.sheet>

          <.button phx-click={%JS{} |> SaladUI.JS.dispatch_command("open", to: "#sheet-programmatic")}>
            Open Sheet Programmatically
          </.button>
        </div>
        """
      }
    ]
  end
end
