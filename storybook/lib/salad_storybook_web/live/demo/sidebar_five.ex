defmodule SaladStorybookWeb.Demo.SidebarFive do
  @moduledoc false
  use SaladStorybookWeb, :demo_view
  use SaladUI

  import Lucideicons, except: [import: 1, quote: 1, menu: 1]

  @data %{
    versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
    nav_main: [
      %{
        title: "Getting Started",
        url: "#",
        items: [
          %{
            title: "Installation",
            url: "#"
          },
          %{
            title: "Project Structure",
            url: "#"
          }
        ]
      },
      %{
        title: "Building Your Application",
        url: "#",
        items: [
          %{
            title: "Routing",
            url: "#"
          },
          %{
            title: "Data Fetching",
            url: "#",
            is_active: true
          },
          %{
            title: "Rendering",
            url: "#"
          },
          %{
            title: "Caching",
            url: "#"
          },
          %{
            title: "Styling",
            url: "#"
          },
          %{
            title: "Optimizing",
            url: "#"
          },
          %{
            title: "Configuring",
            url: "#"
          },
          %{
            title: "Testing",
            url: "#"
          },
          %{
            title: "Authentication",
            url: "#"
          },
          %{
            title: "Deploying",
            url: "#"
          },
          %{
            title: "Upgrading",
            url: "#"
          },
          %{
            title: "Examples",
            url: "#"
          }
        ]
      },
      %{
        title: "API Reference",
        url: "#",
        items: [
          %{
            title: "Components",
            url: "#"
          },
          %{
            title: "File Conventions",
            url: "#"
          },
          %{
            title: "Functions",
            url: "#"
          },
          %{
            title: "next.config.js Options",
            url: "#"
          },
          %{
            title: "CLI",
            url: "#"
          },
          %{
            title: "Edge Runtime",
            url: "#"
          }
        ]
      },
      %{
        title: "Architecture",
        url: "#",
        items: [
          %{
            title: "Accessibility",
            url: "#"
          },
          %{
            title: "Fast Refresh",
            url: "#"
          },
          %{
            title: "Next.js Compiler",
            url: "#"
          },
          %{
            title: "Supported Browsers",
            url: "#"
          },
          %{
            title: "Turbopack",
            url: "#"
          }
        ]
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
          <.separator orientation="vertical" class="mr-2 h-4" />
          <.breadcrumb>
            <.breadcrumb_list>
              <.breadcrumb_item class="hidden md:block">
                <.breadcrumb_link href="#">
                  Building Your Application
                </.breadcrumb_link>
              </.breadcrumb_item>
              <.breadcrumb_separator class="hidden md:block" />
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
    <.sidebar id="main-sidebar">
      <.sidebar_header>
        <.sidebar_menu>
          <.sidebar_menu_item>
            <.as_child tag={&sidebar_menu_button/1} size="lg" child="a" href="#">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Lucideicons.gallery_vertical_end class="size-4" />
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-semibold">
                  Documentation
                </span>
                <span class="">
                  v1.0.0
                </span>
              </div>
            </.as_child>
          </.sidebar_menu_item>
        </.sidebar_menu>
      </.sidebar_header>
      <.sidebar_content>
        <.sidebar_group>
          <.sidebar_menu>
            <.collapsible
              :for={group <- @data.nav_main}
              id={id(group.title)}
              open={true}
              class="group/collapsible"
            >
              <.sidebar_menu_item>
                <.as_child tag={&collapsible_trigger/1} child={&sidebar_menu_button/1}>
                  <%= group.title %>
                  <.plus class="ml-auto group-data-[state=open]/collapsible:hidden" />
                  <.minus class="ml-auto group-data-[state=closed]/collapsible:hidden" />
                </.as_child>
                <.collapsible_content>
                  <.sidebar_menu_sub>
                    <.sidebar_menu_sub_item :for={item <- group.items}>
                      <.as_child tag={&sidebar_menu_sub_button/1}
                        child="a"
                        is_active={item[:is_active]}
                        href={item.url}
                      >
                        <%= item.title %>
                      </.as_child>
                    </.sidebar_menu_sub_item>
                  </.sidebar_menu_sub>
                </.collapsible_content>
              </.sidebar_menu_item>
            </.collapsible>
          </.sidebar_menu>
        </.sidebar_group>
      </.sidebar_content>
      <.sidebar_rail />
    </.sidebar>
    """
  end

  def search_form(assigns) do
    ~H"""
    <form>
      <.sidebar_group class="py-0">
        <.sidebar_group_content class="relative">
          <.label for="search" class="sr-only">
            Search
          </.label>
          <.sidebar_input id="search" placeholder="Search the docs..." class="pl-8"></.sidebar_input>
          <search class="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50">
          </search>
        </.sidebar_group_content>
      </.sidebar_group>
    </form>
    """
  end

  def version_switcher(assigns) do
    ~H"""
    <.sidebar_menu>
      <.sidebar_menu_item>
        <.dropdown_menu class="block">
          <.dropdown_menu_trigger>
            <.sidebar_menu_button
              size="lg"
              class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Lucideicons.gallery_vertical_end class="size-4" />
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-semibold">
                  Documentation
                </span>
                <span class="">
                  v<%= @default_version %>
                </span>
              </div>
              <Lucideicons.chevrons_up_down class="ml-auto" />
            </.sidebar_menu_button>
          </.dropdown_menu_trigger>
          <.dropdown_menu_content class="w-full" align="start">
            <.menu>
              <.menu_item :for={item <- @versions}>
                v<%= item %>
              </.menu_item>
            </.menu>
          </.dropdown_menu_content>
        </.dropdown_menu>
      </.sidebar_menu_item>
    </.sidebar_menu>
    """
  end
end
