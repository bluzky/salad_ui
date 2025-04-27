defmodule Storybook.SaladUIComponents.Slider do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  def function, do: &SaladUI.Slider.slider/1

  def template do
    """
    <.form class="w-full" phx-change="validate">
      <.psb-variation />
    </.form>
    """
  end

  def variations do
    [
      %Variation{
        id: :default_slider,
        attributes: %{
          id: "slider-default",
          value: 20,
          min: 10,
          max: 50,
          class: "w-[60%]",
          name: "scale"
        },
        description: "Default slider with custom min/max values"
      },
      %Variation{
        id: :step_slider,
        attributes: %{
          id: "slider-step",
          value: 20,
          max: 50,
          step: 5,
          class: "w-[60%]",
          name: "amount"
        },
        description: "Slider with custom step value of 5"
      },
      %Variation{
        id: :disabled_slider,
        attributes: %{
          id: "slider-disabled",
          value: 30,
          disabled: true,
          class: "w-[60%]",
          name: "disabled-slider"
        },
        description: "Disabled slider"
      },
      %Variation{
        id: :event_slider,
        attributes: %{
          id: "slider-events",
          value: 50,
          min: 0,
          max: 100,
          class: "w-[60%]",
          name: "volume",
          "on-value-changed": "handle_slider_change"
        },
        description: "Slider with value change event handler"
      }
    ]
  end
end
