defmodule Storybook.SaladUIComponents.RadioGroup do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  def function, do: &SaladUI.RadioGroup.radio_group/1
  def imports, do: [{SaladUI.Label, [{:label, 1}]}, {SaladUI.RadioGroup, [radio_group_item: 1]}]

  def variations do
    [
      %Variation{
        id: :default,
        description: "Default radio group with no preselected option",
        slots: [
          """
          <div class="flex flex-col space-y-2">
            <div class="flex items-center space-x-2">
              <.radio_group_item value="option-one" id="option-one" />
              <.label for="option-one">Option One</.label>
            </div>
            <div class="flex items-center space-x-2">
              <.radio_group_item value="option-two" id="option-two" />
              <.label for="option-two">Option Two</.label>
            </div>
          </div>
          """
        ],
        attributes: %{
          name: "question-1"
        }
      },
      %Variation{
        id: :with_value,
        description: "Radio group with a preselected option via value attribute",
        slots: [
          """
          <div class="flex flex-col space-y-2">
            <div class="flex items-center space-x-2">
              <.radio_group_item value="option-one" id="option-one-value" />
              <.label for="option-one-value">Option One</.label>
            </div>
            <div class="flex items-center space-x-2">
              <.radio_group_item value="option-two" id="option-two-value" />
              <.label for="option-two-value">Option Two</.label>
            </div>
          </div>
          """
        ],
        attributes: %{
          name: "question-2",
          value: "option-two"
        }
      },
      %Variation{
        id: :with_default_value,
        description: "Radio group with a preselected option via default-value attribute",
        slots: [
          """
          <div class="flex flex-col space-y-2">
            <div class="flex items-center space-x-2">
              <.radio_group_item value="option-one" id="option-one-default" />
              <.label for="option-one-default">Option One</.label>
            </div>
            <div class="flex items-center space-x-2">
              <.radio_group_item value="option-two" id="option-two-default" />
              <.label for="option-two-default">Option Two</.label>
            </div>
          </div>
          """
        ],
        attributes: %{
          name: "question-3",
          "default-value": "option-one"
        }
      },
      %Variation{
        id: :with_disabled_option,
        description: "Radio group with a disabled option",
        slots: [
          """
          <div class="flex flex-col space-y-2">
            <div class="flex items-center space-x-2">
              <.radio_group_item value="option-one" id="option-one-disabled" />
              <.label for="option-one-disabled">Option One</.label>
            </div>
            <div class="flex items-center space-x-2">
              <.radio_group_item value="option-two" id="option-two-disabled" disabled />
              <.label for="option-two-disabled" class="opacity-50">Option Two (Disabled)</.label>
            </div>
            <div class="flex items-center space-x-2">
              <.radio_group_item value="option-three" id="option-three-disabled" />
              <.label for="option-three-disabled">Option Three</.label>
            </div>
          </div>
          """
        ],
        attributes: %{
          name: "question-4",
          value: "option-one"
        }
      },
      %Variation{
        id: :horizontal_layout,
        description: "Radio group with horizontal layout",
        slots: [
          """
          <div class="flex space-x-6">
            <div class="flex items-center space-x-2">
              <.radio_group_item value="option-one" id="option-one-horizontal" />
              <.label for="option-one-horizontal">Option One</.label>
            </div>
            <div class="flex items-center space-x-2">
              <.radio_group_item value="option-two" id="option-two-horizontal" />
              <.label for="option-two-horizontal">Option Two</.label>
            </div>
            <div class="flex items-center space-x-2">
              <.radio_group_item value="option-three" id="option-three-horizontal" />
              <.label for="option-three-horizontal">Option Three</.label>
            </div>
          </div>
          """
        ],
        attributes: %{
          name: "question-5",
          value: "option-two"
        }
      },
      %Variation{
        id: :with_event_handler,
        description: "Radio group with event handler for value changes",
        slots: [
          """
          <div class="flex flex-col space-y-2">
            <div class="flex items-center space-x-2">
              <.radio_group_item value="option-one" id="option-one-event" />
              <.label for="option-one-event">Option One</.label>
            </div>
            <div class="flex items-center space-x-2">
              <.radio_group_item value="option-two" id="option-two-event" />
              <.label for="option-two-event">Option Two</.label>
            </div>
          </div>
          """
        ],
        attributes: %{
          name: "question-6",
          value: "option-one",
          on_value_changed: "handle_radio_group_change"
        }
      }
    ]
  end
end
