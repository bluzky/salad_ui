defmodule SaladUI.Sidebar do
  @moduledoc false
  use SaladUI, :component

  import SaladUI.Button
  import SaladUI.Input
  import SaladUI.Separator
  import SaladUI.Sheet
  import SaladUI.Skeleton
  import SaladUI.Tooltip

  @sidebar_width "16rem"
  @sidebar_width_mobile "18rem"
  @sidebar_width_icon "3rem"


    @doc """
  Render
    """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar_provider(assigns) do
    assigns = assign(assigns, %{sidebar_width: @sidebar_width, sidebar_width_icon: @sidebar_width_icon})
    ~H"""
    <div
      style={
              style(%{
                "--sidebar-width": @sidebar_width,
                "--sidebar-width-icon": @sidebar_width_icon
              })
            }
      class={
        classes([
"group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
        @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Render
  """

  attr :side, :string, values: ~w(left right), default: "left"
  attr :variant, :string, values: ~w(sidebar floating inset), default: "sidebar"
  attr :collapsible, :string, values: ~w(offcanvas icon none), default: "offcanvas"
  attr :is_mobile, :boolean, default: false
  attr :state, :string, default: "expanded"
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar(%{collapsible: "none"} = assigns) do
    ~H"""
    <div
      class={
        classes([
          "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  def sidebar(%{is_mobile: true} = assigns) do
    ~H"""
    <.sheet>
      <.sheet_content
        data-sidebar="sidebar"
        data-mobile="true"
        class="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
        style={
          %{
            "--sidebar-width": @sidebar_width_mobile
          }
        }
        side={@side}
      >
        <div class="flex h-full w-full flex-col">
          <%= render_slot(@inner_block) %>
        </div>
      </.sheet_content>
    </.sheet>
    """
  end

  def sidebar(assigns) do
    ~H"""
    <div
      class="group peer hidden md:block text-sidebar-foreground"
      data-state={@state}
      data-collapsible={(@state == "collapsed" && @collapsible) || ""}
      data-variant={@variant}
      data-side={@side}
    >
      <div class={
        classes([
          "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          ((@variant == "floating" || @variant == "inset") &&
             "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]") ||
            "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
        ])
      } />
      <div
        class={
          classes([
            "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
            (@side == "left" &&
               "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]") ||
              "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            ((@variant == "floating" || @variant == "inset") &&
               "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]") ||
              "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
            @class
          ])
        }
        {@rest}
      >
        <div
          data-sidebar="sidebar"
          class="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
        >
          <%= render_slot(@inner_block) %>
        </div>
      </div>
    </div>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  # slot(:inner_block, required: true)

  def sidebar_trigger(assigns) do
    ~H"""
    <.button
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      class={classes(["h-7 w-7", @class])}
      onclick="TODO togleSidebar()"
      {@rest}
    >
      Close <span class="sr-only">Toggle Sidebar</span>
    </.button>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)

  def sidebar_rail(assigns) do
    ~H"""
    <button
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tab-index={-1}
      onclick="toggleSidebar() //TODO"
      title="Toggle Sidebar"
      class={
        classes([
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          @class
        ])
      }
      {@rest}
    />
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)

  def sidebar_inset(assigns) do
    ~H"""
    <main
      class={
        classes([
          "relative flex min-h-svh flex-1 flex-col bg-background",
          "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
          @class
        ])
      }
      {@rest}
    />
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)

  def sidebar_input(assigns) do
    ~H"""
    <.input
      data-sidebar="input"
      class={
        classes([
          "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          @class
        ])
      }
      {@rest}
    />
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar_header(assigns) do
    ~H"""
    <div
      data-sidebar="header"
      class={
        classes([
          "flex flex-col gap-2 p-2",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)

  def sidebar_footer(assigns) do
    ~H"""
    <div
      data-sidebar="footer"
      class={
        classes([
          "flex flex-col gap-2 p-2",
          @class
        ])
      }
      {@rest}
    >
    </div>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)

  def sidebar_separator(assigns) do
    ~H"""
    <.separator
      data-sidebar="separator"
      class={classes(["mx-2 w-auto bg-sidebar-border", @class])}
      {@rest}
    />
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar_content(assigns) do
    ~H"""
    <div
      data-sidebar="content"
      class={
        classes([
          "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar_group(assigns) do
    ~H"""
    <div
      data-sidebar="group"
      class={
        classes([
          "relative flex w-full min-w-0 flex-col p-2",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Render
  TODO: class merge not work well here
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar_group_label(assigns) do
    ~H"""
    <div
      data-sidebar="group-label"
      class={
        Enum.join([
          "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 text-xs",
          "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
          @class
        ], " ")
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar_group_action(assigns) do
    ~H"""
    <button
      data-sidebar="group-action"
      class={
        classes([
          "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          "after:absolute after:-inset-2 after:md:hidden",
          "group-data-[collapsible=icon]:hidden",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </button>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar_group_content(assigns) do
    ~H"""
    <div
      data-sidebar="menu"
      class={
        classes([
          "flex w-full min-w-0 flex-col gap-1",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar_menu(assigns) do
    ~H"""
    <ul
      data-sidebar="menu"
      class={
        classes([
          "flex w-full min-w-0 flex-col gap-1",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </ul>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar_menu_item(assigns) do
    ~H"""
    <div
      data-sidebar="menu-item"
      class={
        classes([
          "group/menu-item relative",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Render
  """
  attr :variant, :string, values: ~w(default outline), default: "default"
  attr :size, :string, values: ~w(default sm lg), default: "default"
  attr :is_active, :boolean, default: false
  attr(:class, :string, default: nil)
  attr :is_mobile, :boolean, default: false
  attr :state, :string, default: "expanded"
  attr(:rest, :global)
  slot(:inner_block, required: true)
  slot :tooltip, required: true

  def sidebar_menu_button(assigns) do
    button = ~H"""
    <button
      data-sidebar="menu-button"
      data-size={@size}
      data-active={@is_active}
      class={classes([get_variant(%{variant: @variant, size: @size}), @class])}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </button>
    """

    assigns = assign(assigns, :button, button)

    if assigns[:tooltip] do
      ~H"""
      <.tooltip>
        <.tooltip_trigger>
          <%= @button %>
        </.tooltip_trigger>
        <.tooltip_content side="right" align="center" hidden={@state != "collapsed" || @is_mobile}>
          <%= render_slot(@tooltip) %>
        </.tooltip_content>
      </.tooltip>
      """
    else
      button
    end
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr :show_on_hover, :boolean, default: false
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar_menu_action(assigns) do
    ~H"""
    <button
      data-sidebar="menu-action"
      class={
        classes([
          "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
          "after:absolute after:-inset-2 after:md:hidden",
          "peer-data-[size=sm]/menu-button:top-1",
          "peer-data-[size=default]/menu-button:top-1.5",
          "peer-data-[size=lg]/menu-button:top-2.5",
          "group-data-[collapsible=icon]:hidden",
          @show_on_hover &&
            "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </button>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar_menu_badge(assigns) do
    ~H"""
    <div
      data-sidebar="menu-badge"
      class={
        classes([
          "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
          "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
          "peer-data-[size=sm]/menu-button:top-1",
          "peer-data-[size=default]/menu-button:top-1.5",
          "peer-data-[size=lg]/menu-button:top-2.5",
          "group-data-[collapsible=icon]:hidden",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr :show_icon, :boolean, default: false
  attr(:rest, :global)

  def sidebar_menu_skeleton(assigns) do
    width = :rand.uniform(40) + 50
    assigns = assign(assigns, :width, width)

    ~H"""
    <div
      data-sidebar="menu-skeleton"
      class={classes(["rounded-md h-8 flex gap-2 px-2 items-center", @class])}
      {@rest}
    >
      <.skeleton :if={@show_icon} class="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />
      <.skeleton
        class="h-4 flex-1 max-w-[--skeleton-width]"
        data-sidebar="menu-skeleton-text"
        style={
          %{
            "--skeleton-width": @width
          }
        }
      />
    </div>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar_menu_sub(assigns) do
    ~H"""
    <ul
      data-sidebar="menu-sub"
      class={
        classes([
          "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
          "group-data-[collapsible=icon]:hidden",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </ul>
    """
  end

  @doc """
  Render
  """
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar_menu_sub_item(assigns) do
    ~H"""
    <li
      class={
        classes([
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </li>
    """
  end

  @doc """
  Render
  """
  attr :size, :string, values: ~w(sm md), default: "md"
  attr :is_active, :boolean, default: false
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  slot(:inner_block, required: true)

  def sidebar_menu_sub_button(assigns) do
    ~H"""
    <a
      data-sidebar="menu-sub-button"
      data-size={@size}
      data-active={@is_active}
      class={
        classes([
          "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
          "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
          @size == "sm" && "text-xs",
          @size == "md" && "text-sm",
          "group-data-[collapsible=icon]:hidden",
          @class
        ])
      }
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </a>
    """
  end

  @variant_config %{
    variants: %{
      variant: %{
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
      },
      size: %{
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
      }
    },
    default_variants: %{
      variant: "default",
      size: "default"
    }
  }
  @shared_classes "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0"
  defp get_variant(input) do
    @shared_classes <>
      " " <>
      variant_class(@variant_config, input)
  end
end
