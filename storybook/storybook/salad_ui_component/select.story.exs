defmodule Storybook.SaladUIComponents.Select do
  @moduledoc """
  Storybook documentation for the SaladUI Select component.

  The Select component provides a dropdown menu for selecting options from a list.
  """
  use PhoenixStorybook.Story, :component

  def function, do: &SaladUI.Select.select/1

  def imports,
    do: [
      {SaladUI.Select,
       [
         select_trigger: 1,
         select_content: 1,
         select_group: 1,
         select_label: 1,
         select_item: 1,
         select_value: 1,
         select_separator: 1
       ]},
      {SaladUI.Button, [button: 1]}
    ]

  def description do
    """
    The Select component allows users to choose one option from a dropdown list.
    It supports single and multiple selection modes, grouping of options, and disabled states.
    """
  end

  def variations do
    [
      %Variation{
        id: :default_select,
        description: "A select component with default styling and behavior",
        attributes: %{
          id: "fruit-select",
          name: "fruit",
          "on-value-changed": "value_changed",
          "use-portal": false
        },
        let: :select,
        slots: [
          """
            <.select_trigger class="w-[180px]">
              <.select_value placeholder="Select a fruit" />
            </.select_trigger>
            <.select_content>
              <.select_group>
                <.select_label>Fruits</.select_label>
                <.select_item value="apple">Apple</.select_item>
                <.select_item value="banana">Banana</.select_item>
                <.select_item value="blueberry">Blueberry</.select_item>
                <.select_separator />
                <.select_item disabled value="grapes">Grapes</.select_item>
                <.select_item value="pineapple">Pineapple</.select_item>
              </.select_group>
            </.select_content>
          """
        ]
      },
      %Variation{
        id: :with_default_value,
        description: "A select component with a pre-selected default value",
        attributes: %{
          id: "preset-select",
          name: "fruit",
          value: "banana",
          "use-portal": false
        },
        let: :select,
        slots: [
          """
            <.select_trigger class="w-[180px]">
              <.select_value />
            </.select_trigger>
            <.select_content>
              <.select_item value="apple">Apple</.select_item>
              <.select_item value="banana">Banana</.select_item>
              <.select_item value="orange">Orange</.select_item>
            </.select_content>
          """
        ]
      },
      %Variation{
        id: :in_form,
        description: "A select component used within a form",
        attributes: %{
          id: "form-select",
          name: "fruit",
          "use-portal": false
        },
        template: """
        <form phx-change="validate" phx-submit="save" class="space-y-4">
          <div>
            <label for="form-select" class="block text-sm font-medium text-gray-700 mb-1">
              Select a fruit
            </label>
            <.psb-variation />
          </div>
          <.button type="submit">Submit</.button>
        </form>
        """,
        let: :select,
        slots: [
          """
            <.select_trigger class="min-w-64 w-full">
              <.select_value placeholder="Choose an option" />
            </.select_trigger>
            <.select_content>
              <.select_group>
                <.select_item value="apple">Apple</.select_item>
                <.select_item value="banana">Banana</.select_item>
                <.select_item value="blueberry">Blueberry</.select_item>
              </.select_group>
            </.select_content>
          """
        ]
      }
    ]
  end
end
