defmodule Storybook.SaladUIComponents.Badge do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  # def function, do: &SaladStorybookWeb.SaladUIComponents.button/1
  def function, do: &SaladUI.Badge.badge/1

  def variations do
    [
      %Variation{
        id: :default,
        slots: ["Badge"]
      },
      %VariationGroup{
        id: :badge_variants,
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
          }
        ]
      }
    ]
  end
end
