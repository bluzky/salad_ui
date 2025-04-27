defmodule Storybook.SaladUIComponents.Button do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  # def function, do: &SaladStorybookWeb.SaladUIComponents.button/1
  def function, do: &SaladUI.Button.button/1

  def variations do
    [
      %VariationGroup{
        id: :colors,
        description: "Color variations with `variant` attribute.",
        variations: [
          %Variation{
            id: :color_default,
            slots: ["Default"]
          },
          %Variation{
            id: :color_secondary,
            attributes: %{
              variant: "secondary"
            },
            slots: ["Secondary"]
          },
          %Variation{
            id: :color_destructive,
            attributes: %{
              variant: "destructive"
            },
            slots: ["Destructive"]
          },
          %Variation{
            id: :color_outline,
            attributes: %{
              variant: "outline"
            },
            slots: ["Outline"]
          },
          %Variation{
            id: :color_ghost,
            attributes: %{
              variant: "ghost"
            },
            slots: ["Ghost"]
          },
          %Variation{
            id: :color_link,
            attributes: %{
              variant: "link"
            },
            slots: ["Link"]
          }
        ]
      },
      %VariationGroup{
        id: :colors,
        description: "Color variations with `variant` attribute.",
        variations: []
      },
      %Variation{
        id: :custom_class,
        attributes: %{
          class: "rounded-full",
          variant: "destructive",
          size: "lg"
        },
        slots: ["Disabled"]
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
