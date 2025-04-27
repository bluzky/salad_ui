defmodule SaladStorybookWeb.Demo.SidebarOne do
  @moduledoc false
  use SaladStorybookWeb, :demo_view
  use SaladUI

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
      <.sidebar id="main-sidebar">
        <.sidebar_header>
          <.version_switcher versions={@data.versions} default_version={hd(@data.versions)} />
          <.search_form />
        </.sidebar_header>
        <.sidebar_content>
          <.sidebar_group :for={group <- @data.nav_main}>
            <.sidebar_group_label>
              <%= group.title %>
            </.sidebar_group_label>
            <.sidebar_group_content>
              <.sidebar_menu>
                <.sidebar_menu_item :for={item <- group.items}>
                  <.sidebar_menu_button is_active={item[:is_active]}>
                    <a href={item.url}>
                      <%= item.title %>
                    </a>
                  </.sidebar_menu_button>
                </.sidebar_menu_item>
              </.sidebar_menu>
            </.sidebar_group_content>
          </.sidebar_group>
        </.sidebar_content>
        <.sidebar_rail></.sidebar_rail>
      </.sidebar>
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
