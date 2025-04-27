defmodule Storybook.SaladUIComponents.Avatar do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladUI.Avatar

  def function, do: &SaladUI.Avatar.avatar/1

  def imports, do: [{Avatar, [avatar_image: 1, avatar_fallback: 1]}]

  def variations do
    [
      %Variation{
        id: :avatar_image,
        template: """
        <.avatar>
        <.avatar_image src="https://github.com/shadcn.png" />
        <.avatar_fallback class="bg-primary text-white">CN</.avatar_fallback>
        </.avatar>
        """
      },
      %Variation{
        id: :avatar_fallback,
        template: """
        <.avatar>
        <.avatar_image src="http://example.com/badimage.png" />
        <.avatar_fallback class="bg-primary text-white">CN</.avatar_fallback>
        </.avatar>
        """
      }
    ]
  end
end
