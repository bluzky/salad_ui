defmodule Storybook.SaladUIComponents.Textarea do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  def function, do: &SaladUI.Textarea.textarea/1

  def variations do
    [
      %Variation{
        id: :textarea,
        attributes: %{
          name: "my-textarea",
          placeholder: "Type your message here"
        }
      },
      %Variation{
        id: :textarea_disabled,
        attributes: %{
          name: "my-textarea",
          disabled: true,
          placeholder: "I'm disabled"
        }
      }
    ]
  end
end
