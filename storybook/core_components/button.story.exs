defmodule Storybook.CoreComponents.Button do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  def function, do: &SaladStorybookWeb.CoreComponents.button/1

  def variations do
    [
      %Variation{
        id: :default,
        slots: ["Button"]
      },
      %Variation{
        id: :custom_class,
        attributes: %{
          class: "rounded-full bg-green-500 hover:bg-green-600"
        },
        slots: ["Green Button"]
      },
      %Variation{
        id: :disabled,
        attributes: %{
          disabled: true
        },
        slots: ["Disabled"]
      }
    ]
  end
end
