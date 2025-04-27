defmodule Storybook.SaladUIComponents.Popover do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  alias SaladUI.Popover

  def function, do: &Popover.popover/1

  def imports do
    [
      {SaladUI.Popover, [popover_trigger: 1, popover_content: 1]},
      {SaladUI.Button, [button: 1]},
      {SaladUI.Avatar, [avatar: 1, avatar_image: 1, avatar_fallback: 1]},
      {SaladUI.Input, [input: 1]},
      {SaladUI.Label, [label: 1]}
    ]
  end

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{
          id: "popover-default"
        },
        slots: [
          """
          <.popover_trigger>
            <.button variant="outline">
              Open popover
            </.button>
          </.popover_trigger>
          <.popover_content side="top" align="center" side-offset={8} class="w-80">
            <div class="grid gap-4">
              <div class="space-y-2">
                <h4 class="font-medium leading-none">
                  Dimensions
                </h4>
                <p class="text-sm text-muted-foreground">
                  Set the dimensions for the layer.
                </p>
              </div>
              <div class="grid gap-2 max-h-32 overflow-y-auto">
                <div class="grid grid-cols-3 items-center gap-4">
                  <.label for="width">
                    Width
                  </.label>
                  <.input id="width" default-value="100%" class="col-span-2 h-8"></.input>
                </div>
                <div class="grid grid-cols-3 items-center gap-4">
                  <.label for="maxWidth">
                    Max. width
                  </.label>
                  <.input id="maxWidth" default-value="300px" class="col-span-2 h-8"></.input>
                </div>
                <div class="grid grid-cols-3 items-center gap-4">
                  <.label for="height">
                    Height
                  </.label>
                  <.input id="height" default-value="25px" class="col-span-2 h-8"></.input>
                </div>
                <div class="grid grid-cols-3 items-center gap-4">
                  <.label for="maxHeight">
                    Max. height
                  </.label>
                  <.input id="maxHeight" default-value="none" class="col-span-2 h-8"></.input>
                </div>
              </div>
            </div>
          </.popover_content>
          """
        ]
      },
      %Variation{
        id: :side_positions,
        attributes: %{
          id: "bottom-popover"
        },
        slots: [
          """
          <.popover_trigger>
            <.button variant="outline">
              Bottom Position
            </.button>
          </.popover_trigger>
          <.popover_content side="bottom" align="center" side-offset={8} class="w-64">
            <div class="grid gap-2">
              <h4 class="font-medium leading-none">Bottom Placement</h4>
              <p class="text-sm text-muted-foreground">
                This popover appears below the trigger
              </p>
            </div>
          </.popover_content>
          """
        ]
      },
      %Variation{
        id: :left_placement,
        attributes: %{
          id: "left-popover"
        },
        slots: [
          """
          <.popover_trigger>
            <.button variant="outline">
              Left Position
            </.button>
          </.popover_trigger>
          <.popover_content side="left" align="center" side-offset={8} class="w-64">
            <div class="grid gap-2">
              <h4 class="font-medium leading-none">Left Placement</h4>
              <p class="text-sm text-muted-foreground">
                This popover appears to the left of the trigger
              </p>
            </div>
          </.popover_content>
          """
        ]
      },
      %Variation{
        id: :right_placement,
        attributes: %{
          id: "right-popover"
        },
        slots: [
          """
          <.popover_trigger>
            <.button variant="outline">
              Right Position
            </.button>
          </.popover_trigger>
          <.popover_content side="right" align="center" side-offset={8} class="w-64">
            <div class="grid gap-2">
              <h4 class="font-medium leading-none">Right Placement</h4>
              <p class="text-sm text-muted-foreground">
                This popover appears to the right of the trigger
              </p>
            </div>
          </.popover_content>
          """
        ]
      },
      %Variation{
        id: :alignment,
        attributes: %{
          id: "start-align-popover"
        },
        slots: [
          """
          <.popover_trigger>
            <.button variant="outline">
              Start Alignment
            </.button>
          </.popover_trigger>
          <.popover_content side="bottom" align="start" side-offset={8} class="w-64">
            <div class="grid gap-2">
              <h4 class="font-medium leading-none">Start Alignment</h4>
              <p class="text-sm text-muted-foreground">
                This popover is aligned to the start
              </p>
            </div>
          </.popover_content>
          """
        ]
      },
      %Variation{
        id: :end_alignment,
        attributes: %{
          id: "end-align-popover"
        },
        slots: [
          """
          <.popover_trigger>
            <.button variant="outline">
              End Alignment
            </.button>
          </.popover_trigger>
          <.popover_content side="bottom" align="end" side-offset={8} class="w-64">
            <div class="grid gap-2">
              <h4 class="font-medium leading-none">End Alignment</h4>
              <p class="text-sm text-muted-foreground">
                This popover is aligned to the end
              </p>
            </div>
          </.popover_content>
          """
        ]
      },
      %Variation{
        id: :profile_demo,
        attributes: %{
          id: "profile-popover"
        },
        slots: [
          """
          <.popover_trigger>
            <.button variant="outline">
              <div class="flex items-center gap-2">
                <.avatar class="h-6 w-6">
                  <.avatar_fallback>JD</.avatar_fallback>
                </.avatar>
                <span>Profile</span>
              </div>
            </.button>
          </.popover_trigger>
          <.popover_content side="right" align="center" side-offset={8} class="w-80">
            <div class="flex flex-col gap-4 p-1">
              <div class="flex items-center gap-4">
                <.avatar class="h-10 w-10">
                  <.avatar_image src="/images/placeholders/avatar.png" />
                  <.avatar_fallback>JD</.avatar_fallback>
                </.avatar>
                <div class="flex flex-col">
                  <h4 class="text-sm font-semibold">John Doe</h4>
                  <p class="text-sm text-muted-foreground">john.doe@example.com</p>
                </div>
              </div>
              <div class="grid gap-2">
                <.button variant="outline" size="sm">View profile</.button>
                <.button variant="outline" size="sm">Settings</.button>
                <.button variant="outline" size="sm">Logout</.button>
              </div>
            </div>
          </.popover_content>
          """
        ]
      },
      %Variation{
        id: :increased_spacing,
        attributes: %{
          id: "large-spacing-popover"
        },
        slots: [
          """
          <.popover_trigger>
            <.button variant="outline">
              Increased Spacing
            </.button>
          </.popover_trigger>
          <.popover_content side="bottom" align="center" side-offset={20} class="w-64">
            <div class="grid gap-2">
              <h4 class="font-medium leading-none">Increased Side Offset</h4>
              <p class="text-sm text-muted-foreground">
                This popover has a larger gap (20px) from the trigger
              </p>
            </div>
          </.popover_content>
          """
        ]
      },
      %Variation{
        id: :custom_trigger,
        attributes: %{
          id: "custom-trigger-popover"
        },
        slots: [
          """
          <.popover_trigger>
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
          </.popover_trigger>
          <.popover_content side="right" align="center" side-offset={8} class="w-64">
            <div class="grid gap-2">
              <h4 class="font-medium leading-none">Custom Trigger Example</h4>
              <p class="text-sm text-muted-foreground">
                You can use any element as a trigger, not just buttons
              </p>
            </div>
          </.popover_content>
          """
        ]
      }
    ]
  end
end
