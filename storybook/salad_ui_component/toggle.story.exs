defmodule Storybook.SaladUIComponents.Toggle do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  def function, do: &SaladUI.Toggle.toggle/1
  def imports, do: [{SaladUI.Label, [{:label, 1}]}]

  def variations do
    [
      %Variation{
        id: :default_toggle,
        slots: ["B"]
      },
      %Variation{
        id: :toggle_pressed,
        attributes: %{
          value: true
        },
        slots: ["B"]
      },
      %Variation{
        id: :toggle_disabled,
        attributes: %{
          disabled: true
        },
        slots: ["B"]
      },
      %VariationGroup{
        id: :variant_and_size,
        description: "Different variants and sizes",
        variations: [
          %Variation{
            id: :variant_outline,
            attributes: %{
              variant: "outline"
            },
            slots: ["Outline"]
          },
          %Variation{
            id: :size_small,
            attributes: %{
              size: "sm"
            },
            slots: ["Small"]
          },
          %Variation{
            id: :size_large,
            attributes: %{
              size: "lg"
            },
            slots: ["Large"]
          }
        ]
      }
    ]
  end
end
