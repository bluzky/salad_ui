defmodule Storybook.SaladUIComponents.Separator do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  def function, do: &SaladUI.Separator.separator/1

  def variations do
    [
      %Variation{
        id: :separator,
        template: """
        <div>
          <div class="space-y-1">
            <h4 class="text-sm font-medium leading-none">Radix Primitives</h4>
            <p class="text-sm text-muted-foreground">
              An open-source UI component library.
            </p>
          </div>
          <.separator class="my-4" />
          <div class="flex h-5 items-center space-x-4 text-sm">
            <div>Blog</div>
            <.separator orientation="vertical" />
            <div>Docs</div>
            <.separator orientation="vertical" />
            <div>Source</div>
          </div>
        </div>
        """
      }
    ]
  end
end
