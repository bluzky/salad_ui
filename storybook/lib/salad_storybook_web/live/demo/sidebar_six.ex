defmodule SaladStorybookWeb.Demo.SidebarSix do
  @moduledoc false
  use SaladStorybookWeb, :demo_view
  use SaladUI

  import Lucideicons, except: [import: 1, quote: 1, menu: 1]

  @data %{
    user: %{
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg"
    },
    teams: [
      %{
        name: "Acme Inc",
        logo: &gallery_vertical_end/1,
        plan: "Enterprise"
      },
      %{
        name: "Acme Corp.",
        logo: &audio_waveform/1,
        plan: "Startup"
      },
      %{
        name: "Evil Corp.",
        logo: &command/1,
        plan: "Free"
      }
    ],
    navMain: [
      %{
        title: "Playground",
        url: "#",
        icon: &square_terminal/1,
        is_active: true,
        items: [
          %{
            title: "History",
            url: "#"
          },
          %{
            title: "Starred",
            url: "#"
          },
          %{
            title: "Settings",
            url: "#"
          }
        ]
      },
      %{
        title: "Models",
        url: "#",
        icon: &bot/1,
        items: [
          %{
            title: "Genesis",
            url: "#"
          },
          %{
            title: "Explorer",
            url: "#"
          },
          %{
            title: "Quantum",
            url: "#"
          }
        ]
      },
      %{
        title: "Documentation",
        url: "#",
        icon: &book_open/1,
        items: [
          %{
            title: "Introduction",
            url: "#"
          },
          %{
            title: "Get Started",
            url: "#"
          },
          %{
            title: "Tutorials",
            url: "#"
          },
          %{
            title: "Changelog",
            url: "#"
          }
        ]
      },
      %{
        title: "Settings",
        url: "#",
        icon: &settings/1,
        items: [
          %{
            title: "General",
            url: "#"
          },
          %{
            title: "Team",
            url: "#"
          },
          %{
            title: "Billing",
            url: "#"
          },
          %{
            title: "Limits",
            url: "#"
          }
        ]
      }
    ],
    projects: [
      %{
        name: "Design Engineering",
        url: "#",
        icon: &frame/1
      },
      %{
        name: "Sales & Marketing",
        url: "#",
        icon: &pie_chart/1
      },
      %{
        name: "Travel",
        url: "#",
        icon: &map/1
      }
    ]
  }

  @impl true
  def mount(_params, _session, socket) do
    {:ok, assign(socket, %{data: @data})}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <.sidebar_provider>
      <.sidebar_main data={@data}></.sidebar_main>
      <.sidebar_inset>
        <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <.sidebar_trigger target="main-sidebar" class="-ml-1">
            <Lucideicons.panel_left class="w-4 h-4" />
          </.sidebar_trigger>
          <.separator orientation="vertical" class="mr-2 h-4"></.separator>
          <.breadcrumb>
            <.breadcrumb_list>
              <.breadcrumb_item class="hidden md:block">
                <.breadcrumb_link href="#">
                  Building Your Application
                </.breadcrumb_link>
              </.breadcrumb_item>
              <.breadcrumb_separator class="hidden md:block"></.breadcrumb_separator>
              <.breadcrumb_item>
                <.breadcrumb_page>
                  Data Fetching
                </.breadcrumb_page>
              </.breadcrumb_item>
            </.breadcrumb_list>
          </.breadcrumb>
        </header>
        <div class="flex flex-1 flex-col gap-4 p-4">
          <div class="grid auto-rows-min gap-4 md:grid-cols-3">
            <div class="aspect-video rounded-xl bg-muted/50"></div>
            <div class="aspect-video rounded-xl bg-muted/50"></div>
            <div class="aspect-video rounded-xl bg-muted/50"></div>
          </div>
          <div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"></div>
        </div>
      </.sidebar_inset>
    </.sidebar_provider>
    """
  end

  def sidebar_main(assigns) do
    ~H"""
    <.sidebar collapsible="icon" id="main-sidebar">
      <.sidebar_header>
        <.team_switcher teams={@data.teams} />
      </.sidebar_header>
      <.sidebar_content>
        <.nav_main items={@data.navMain} />
        <.nav_projects projects={@data.projects} />
      </.sidebar_content>
      <.sidebar_footer>
        <.nav_user user={@data.user} />
      </.sidebar_footer>
      <.sidebar_rail />
    </.sidebar>
    """
  end

  def team_switcher(assigns) do
    assigns = assign(assigns, :active_team, hd(assigns.teams))

    ~H"""
    <.sidebar_menu>
      <.sidebar_menu_item>
        <.dropdown_menu class="block">
          <.as_child tag={&dropdown_menu_trigger/1}
            child={&sidebar_menu_button/1}
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <.dynamic tag={@active_team.logo} class="size-4" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">
                <%= @active_team.name %>
              </span>
              <span class="truncate text-xs">
                <%= @active_team.plan %>
              </span>
            </div>
            <.chevrons_up_down class="ml-auto" />
          </.as_child>
          <.dropdown_menu_content
            class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="right"
          >
            <.menu>
              <.menu_label class="text-xs text-muted-foreground">
                Teams
              </.menu_label>

              <.menu_item :for={{team, index} <- Enum.with_index(@teams)} class="gap-2 p-2">
                <div class="flex size-6 items-center justify-center rounded-sm border">
                  <.dynamic tag={team.logo} class="size-4 shrink-0" />
                </div>
                <%= team.name %>
                <.dropdown_menu_shortcut>
                  ⌘<%= index + 1 %>
                </.dropdown_menu_shortcut>
              </.menu_item>

              <.menu_separator></.menu_separator>
              <.menu_item class="gap-2 p-2">
                <div class="flex size-6 items-center justify-center rounded-md border bg-background">
                  <.plus class="size-4" />
                </div>
                <div class="font-medium text-muted-foreground">
                  Add team
                </div>
              </.menu_item>
            </.menu>
          </.dropdown_menu_content>
        </.dropdown_menu>
      </.sidebar_menu_item>
    </.sidebar_menu>
    """
  end

  def nav_main(assigns) do
    ~H"""
    <.sidebar_group>
      <.sidebar_group_label>
        Platform
      </.sidebar_group_label>
      <.sidebar_menu>
        <.collapsible
          :for={item <- @items}
          id={id(item.title)}
          aschild="aschild"
          open={item[:is_active]}
          class="group/collapsible block"
        >
          <.sidebar_menu_item>
            <.as_child tag={&collapsible_trigger/1} child={&sidebar_menu_button/1} tooltip={item.title}>
              <.dynamic :if={not is_nil(item.icon)} tag={item.icon} />

              <span>
                <%= item.title %>
              </span>
              <.chevron_right class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </.as_child>
            <.collapsible_content>
              <.sidebar_menu_sub>
                <.sidebar_menu_sub_item :for={sub_item <- item.items}>
                  <.as_child tag={&sidebar_menu_sub_button/1} child="a" href={sub_item.url}>
                    <span>
                      <%= sub_item.title %>
                    </span>
                  </.as_child>
                </.sidebar_menu_sub_item>
              </.sidebar_menu_sub>
            </.collapsible_content>
          </.sidebar_menu_item>
        </.collapsible>
      </.sidebar_menu>
    </.sidebar_group>
    """
  end

  def nav_projects(assigns) do
    ~H"""
    <.sidebar_group class="group-data-[collapsible=icon]:hidden">
      <.sidebar_group_label>
        Projects
      </.sidebar_group_label>
      <.sidebar_menu>
        <.sidebar_menu_item :for={item <- @projects}>
          <.dropdown_menu style="-ml-8 block">
            <.dropdown_menu_trigger show_on_hover>
              <.as_child tag={&sidebar_menu_button/1} child="a" href={item.url}>
                <.dynamic tag={item.icon} />
                <span>
                  <%= item.name %>
                </span>
              </.as_child>
              <.sidebar_menu_action>
                <.ellipsis class="h-4 w-4" />
                <span class="sr-only">
                  More
                </span>
              </.sidebar_menu_action>
            </.dropdown_menu_trigger>
            <.dropdown_menu_content class="w-48 rounded-lg" side="right" align="start">
              <.menu>
                <.menu_item>
                  <.folder class="text-muted-foreground h-4 w-4 mr-2" />
                  <span>
                    View Project
                  </span>
                </.menu_item>
                <.menu_item>
                  <.forward class="text-muted-foreground h-4 w-4 mr-2" />
                  <span>
                    Share Project
                  </span>
                </.menu_item>
                <.menu_separator></.menu_separator>
                <.menu_item>
                  <.trash_2 class="text-muted-foreground h-4 w-4 mr-2" />
                  <span>
                    Delete Project
                  </span>
                </.menu_item>
              </.menu>
            </.dropdown_menu_content>
          </.dropdown_menu>
        </.sidebar_menu_item>
        <.sidebar_menu_item>
          <.sidebar_menu_button class="text-sidebar-foreground/70">
            <.ellipsis class="text-sidebar-foreground/70" />
            <span>
              More
            </span>
          </.sidebar_menu_button>
        </.sidebar_menu_item>
      </.sidebar_menu>
    </.sidebar_group>
    """
  end

  def nav_user(assigns) do
    ~H"""
    <.sidebar_menu>
      <.sidebar_menu_item>
        <.dropdown_menu class="block">
          <.as_child tag={&dropdown_menu_trigger/1}
            child={&sidebar_menu_button/1}
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <.avatar class="h-8 w-8 rounded-lg">
              <.avatar_image src={@user.avatar} alt={@user.name} />
              <.avatar_fallback class="rounded-lg">
                CN
              </.avatar_fallback>
            </.avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">
                <%= @user.name %>
              </span>
              <span class="truncate text-xs">
                <%= @user.email %>
              </span>
            </div>
            <.chevrons_up_down class="ml-auto size-4" />
          </.as_child>
          <.dropdown_menu_content
            class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="right"
            align="end"
            sideoffset="{4}"
          >
            <.menu>
              <.menu_label class="p-0 font-normal">
                <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <.avatar class="h-8 w-8 rounded-lg">
                    <.avatar_image src="{user.avatar}" alt="{user.name}"></.avatar_image>
                    <.avatar_fallback class="rounded-lg">
                      CN
                    </.avatar_fallback>
                  </.avatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">
                      <%= @user.name %>
                    </span>
                    <span class="truncate text-xs">
                      <%= @user.email %>
                    </span>
                  </div>
                </div>
              </.menu_label>
              <.menu_separator></.menu_separator>
              <dropdownmenugroup>
                <.menu_item>
                  <.sparkles class="w-4 h-4 mr-2" /> Upgrade to Pro
                </.menu_item>
              </dropdownmenugroup>
              <.menu_separator></.menu_separator>
              <dropdownmenugroup>
                <.menu_item>
                  <.badge_check class="w-4 h-4 mr-2" /> Account
                </.menu_item>
                <.menu_item>
                  <.credit_card class="w-4 h-4 mr-2" /> Billing
                </.menu_item>
                <.menu_item>
                  <.bell class="w-4 h-4 mr-2" /> Notifications
                </.menu_item>
              </dropdownmenugroup>
              <.menu_separator></.menu_separator>
              <.menu_item>
                <.log_out class="w-4 h-4 mr-2" /> Log out
              </.menu_item>
            </.menu>
          </.dropdown_menu_content>
        </.dropdown_menu>
      </.sidebar_menu_item>
    </.sidebar_menu>
    """
  end
end
