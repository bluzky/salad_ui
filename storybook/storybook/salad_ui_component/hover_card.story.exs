defmodule Storybook.SaladUIComponents.HoverCard do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladUI.HoverCard

  def function, do: &HoverCard.hover_card/1

  def imports,
    do: [
      {SaladUI.HoverCard, [hover_card_trigger: 1, hover_card_content: 1]},
      {SaladUI.Button, [button: 1]},
      {SaladUI.Avatar, [avatar: 1, avatar_image: 1, avatar_fallback: 1]},
      {SaladUI.Badge, [badge: 1]},
      {SaladStorybookWeb.CoreComponents, [icon: 1]}
    ]

  def descriptions do
    """
    The `HoverCard` component displays content when hovering over a trigger element.
    It's perfect for showing additional information like user profiles, previews, or tooltips without requiring a click.

    The component handles hover interactions, timing delays, and positioning automatically.
    """
  end

  def variations do
    [
      %Variation{
        id: :default,
        description: "Default hover card with user profile",
        attributes: %{
          id: "default-hover-card",
          "open-delay": 300,
          "close-delay": 200
        },
        slots: [
          """
          <.hover_card_trigger>
            <.button variant="link">@salad_ui</.button>
          </.hover_card_trigger>
          <.hover_card_content side="bottom" align="center">
            <div class="flex justify-between space-x-4">
              <.avatar>
                <.avatar_image src="https://github.com/vercel.png">
                </.avatar_image>
                <.avatar_fallback>
                  VC
                </.avatar_fallback>
              </.avatar>
              <div class="space-y-1">
                <h4 class="text-sm font-semibold">
                  @salad_ui
                </h4>
                <p class="text-sm">LiveView component library inspired by shadcn</p>
                <div class="flex items-center pt-2">
                  <span class="text-xs text-muted-foreground">
                    Joined May 2024
                  </span>
                </div>
              </div>
            </div>
          </.hover_card_content>
          """
        ]
      },
      %Variation{
        id: :top_position,
        description: "Hover card positioned above the trigger",
        attributes: %{
          id: "top-hover-card",
          "open-delay": 200
        },
        slots: [
          """
          <.hover_card_trigger>
            <.button variant="outline">Profile Hover Card</.button>
          </.hover_card_trigger>
          <.hover_card_content side="top" align="center">
            <div class="flex justify-between space-x-4">
              <.avatar>
                <.avatar_image src="https://github.com/vercel.png">
                </.avatar_image>
                <.avatar_fallback>
                  VC
                </.avatar_fallback>
              </.avatar>
              <div class="space-y-1">
                <h4 class="text-sm font-semibold">
                  @salad_ui
                </h4>
                <p class="text-sm">LiveView component library inspired by shadcn</p>
                <div class="flex items-center pt-2">
                  <span class="text-xs text-muted-foreground">
                    Joined May 2024
                  </span>
                </div>
              </div>
            </div>
          </.hover_card_content>
          """
        ]
      },
      %Variation{
        id: :right_aligned,
        description: "Hover card displayed on the right of the trigger",
        attributes: %{
          id: "right-hover-card",
          "close-delay": 300
        },
        slots: [
          """
          <.hover_card_trigger>
            <.button>Documentation</.button>
          </.hover_card_trigger>
          <.hover_card_content side="right" align="start">
            <div class="space-y-2">
              <h4 class="text-sm font-semibold">HoverCard Component</h4>
              <p class="text-sm text-muted-foreground">
                The hover card component displays floating content when a trigger element is hovered.
                Perfect for user profiles, tooltips, and rich previews.
              </p>
              <div class="flex justify-end">
                <.button size="sm" variant="outline">View Docs</.button>
              </div>
            </div>
          </.hover_card_content>
          """
        ]
      },
      %Variation{
        id: :left_aligned,
        description: "Hover card displayed on the left of the trigger",
        attributes: %{
          id: "left-hover-card"
        },
        slots: [
          """
          <.hover_card_trigger>
            <.button variant="secondary">Package Info</.button>
          </.hover_card_trigger>
          <.hover_card_content side="left" align="center">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-semibold">SaladUI Package</h4>
                <.badge variant="outline">v1.0.0</.badge>
              </div>
              <p class="text-sm text-muted-foreground">
                A collection of UI components for Phoenix LiveView applications.
                Built with accessibility and performance in mind.
              </p>
              <ul class="text-sm space-y-1">
                <li class="flex items-center text-muted-foreground">
                  <.icon name="hero-check-circle" class="w-4 h-4 mr-2 text-green-500"/>
                  100% Accessible
                </li>
                <li class="flex items-center text-muted-foreground">
                  <.icon name="hero-check-circle" class="w-4 h-4 mr-2 text-green-500"/>
                  State Management
                </li>
              </ul>
            </div>
          </.hover_card_content>
          """
        ]
      },
      %Variation{
        id: :alignment_variations,
        description: "Different alignment options (start, center, end)",
        attributes: %{
          id: "alignment-hover-card",
          class: "flex justify-around items-center gap-8"
        },
        slots: [
          """
          <div>
            <.hover_card id="bottom-start-card">
              <.hover_card_trigger>
                <.button variant="outline" size="sm">Bottom Start</.button>
              </.hover_card_trigger>
              <.hover_card_content side="bottom" align="start">
                <p class="text-sm">Aligned to the bottom start</p>
              </.hover_card_content>
            </.hover_card>
          </div>

          <div>
            <.hover_card id="bottom-center-card">
              <.hover_card_trigger>
                <.button variant="outline" size="sm">Bottom Center</.button>
              </.hover_card_trigger>
              <.hover_card_content side="bottom" align="center">
                <p class="text-sm">Aligned to the bottom center</p>
              </.hover_card_content>
            </.hover_card>
          </div>

          <div>
            <.hover_card id="bottom-end-card">
              <.hover_card_trigger>
                <.button variant="outline" size="sm">Bottom End</.button>
              </.hover_card_trigger>
              <.hover_card_content side="bottom" align="end">
                <p class="text-sm">Aligned to the bottom end</p>
              </.hover_card_content>
            </.hover_card>
          </div>
          """
        ]
      }
    ]
  end
end
