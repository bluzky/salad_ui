defmodule Storybook.SaladUIComponents.Tooltip do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  def function, do: &SaladUI.Tooltip.tooltip/1

  def imports do
    [
      {SaladUI.Tooltip, [tooltip_trigger: 1, tooltip_content: 1]},
      {SaladUI.Button, [button: 1]}
    ]
  end

  def variations do
    [
      %Variation{
        id: :default,
        description: "Default tooltip with top placement",
        slots: [
          """
          <.tooltip_trigger>
            <.button variant="outline">Hover me</.button>
          </.tooltip_trigger>
          <.tooltip_content>
            <p>Hi! I'm a tooltip.</p>
          </.tooltip_content>
          """
        ]
      },
      %VariationGroup{
        id: :placement_examples,
        description: "Tooltips with different placements",
        variations: [
          %Variation{
            id: :top_placement,
            description: "Top placement (default)",
            slots: [
              """
              <.tooltip_trigger>
                <.button variant="outline">Top</.button>
              </.tooltip_trigger>
              <.tooltip_content side="top">
                <p>I appear on the top!</p>
              </.tooltip_content>
              """
            ]
          },
          %Variation{
            id: :right_placement,
            description: "Right placement",
            slots: [
              """
              <.tooltip_trigger>
                <.button variant="outline">Right</.button>
              </.tooltip_trigger>
              <.tooltip_content side="right">
                <p>I appear on the right!</p>
              </.tooltip_content>
              """
            ]
          },
          %Variation{
            id: :bottom_placement,
            description: "Bottom placement",
            slots: [
              """
              <.tooltip_trigger>
                <.button variant="outline">Bottom</.button>
              </.tooltip_trigger>
              <.tooltip_content side="bottom">
                <p>I appear at the bottom!</p>
              </.tooltip_content>
              """
            ]
          },
          %Variation{
            id: :left_placement,
            description: "Left placement",
            slots: [
              """
              <.tooltip_trigger>
                <.button variant="outline">Left</.button>
              </.tooltip_trigger>
              <.tooltip_content side="left">
                <p>I appear on the left!</p>
              </.tooltip_content>
              """
            ]
          }
        ]
      },
      %Variation{
        id: :styled,
        description: "Tooltip with custom styling",
        slots: [
          """
          <.tooltip_trigger>
            <.button variant="outline">Styled tooltip</.button>
          </.tooltip_trigger>
          <.tooltip_content class="bg-primary text-primary-foreground border-primary">
            <p>I have custom styling!</p>
          </.tooltip_content>
          """
        ]
      },
      %Variation{
        id: :with_offset,
        description: "Tooltip with increased side offset",
        slots: [
          """
          <.tooltip_trigger>
            <.button variant="outline">Offset tooltip</.button>
          </.tooltip_trigger>
          <.tooltip_content side="bottom" side-offset={12}>
            <p>I have more space from my trigger (12px)!</p>
          </.tooltip_content>
          """
        ]
      },
      %Variation{
        id: :complex_content,
        description: "Tooltip with complex content",
        slots: [
          """
          <.tooltip_trigger>
            <.button variant="outline">Complex tooltip</.button>
          </.tooltip_trigger>
          <.tooltip_content class="p-0 overflow-hidden">
            <div>
              <div class="bg-muted p-3 font-medium border-b">Tooltip Header</div>
              <div class="p-3">
                <p>Tooltips can contain complex content including:</p>
                <ul class="list-disc pl-4 mt-2 space-y-1">
                  <li>Multiple paragraphs</li>
                  <li>Lists</li>
                  <li>Other components</li>
                </ul>
              </div>
            </div>
          </.tooltip_content>
          """
        ]
      }
    ]
  end
end
