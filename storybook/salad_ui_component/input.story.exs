defmodule Storybook.SaladUIComponents.Input do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladStorybookWeb.SaladUIComponents

  def function, do: &SaladUI.Input.input/1
  def imports, do: [{SaladStorybookWeb.CoreComponents, [simple_form: 1]}]

  def template do
    """
    <.simple_form :let={f} for={%{}} as={:story} class="w-full">
      <.psb-variation-group/>
    </.simple_form>
    """
  end

  def variations do
    [
      %VariationGroup{
        id: :basic_inputs,
        variations:
          for type <- ~w(text number date color)a do
            %Variation{
              id: type,
              attributes: %{
                type: to_string(type),
                label: String.capitalize("#{type} input"),
                placeholder: String.capitalize("#{type} input")
              }
            }
          end
      }
    ]
  end
end
