defmodule Storybook.SaladUIComponents.Checkbox do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  def function, do: &SaladUI.Checkbox.checkbox/1
  def imports, do: [{SaladUI.Label, [{:label, 1}]}]

  def variations do
    [
      %Variation{
        id: :checkbox_checked,
        template: """
        <div className="flex items-center space-x-2">
        <.checkbox id="checked" value={true}/>
        <.label for="checked">I'm a label</.label>
        </div>


        """,
        attributes: %{
          value: true
        }
      },
      %Variation{
        id: :checkbox,
        template: """
        <div className="flex items-center space-x-2">
        <.checkbox id="unchecked"/>
        <.label for="unchecked">I'm a label</.label>
        </div>
        """
      }
    ]
  end
end
