defmodule SaladStorybookWeb.Demo.DashboardTwo do
  @moduledoc false
  use SaladStorybookWeb, :demo_view

  import SaladUI.Badge
  import SaladUI.Breadcrumb
  import SaladUI.Button
  import SaladUI.Card
  import SaladUI.DropdownMenu
  import SaladUI.Input
  import SaladUI.Pagination
  import SaladUI.Progress
  import SaladUI.Separator
  import SaladUI.Sheet
  import SaladUI.Table
  import SaladUI.Tabs
  import SaladUI.Tooltip

  @impl true
  def mount(_params, _session, socket) do
    {:ok, socket}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="flex min-h-screen w-full flex-col bg-muted/40">
      <aside class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav class="flex flex-col items-center gap-4 px-2 sm:py-5">
          <.link
            href="#"
            class="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Lucideicons.package class="h-4 w-4 transition-all group-hover:scale-110" />
            <span class="sr-only">
              Acme Inc
            </span>
          </.link>
          <.tooltip>
            <.tooltip_trigger>
              <.link
                href="#"
                class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Lucideicons.home class="h-5 w-5" />
                <span class="sr-only">
                  Dashboard
                </span>
              </.link>
            </.tooltip_trigger>
            <.tooltip_content side="right">
              Dashboard
            </.tooltip_content>
          </.tooltip>
          <.tooltip>
            <.tooltip_trigger>
              <.link
                href="#"
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Lucideicons.shopping_cart class="h-5 w-5" />
                <span class="sr-only">
                  Orders
                </span>
              </.link>
            </.tooltip_trigger>
            <.tooltip_content side="right">
              Orders
            </.tooltip_content>
          </.tooltip>
          <.tooltip>
            <.tooltip_trigger>
              <.link
                href="#"
                class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Lucideicons.package class="h-5 w-5" />
                <span class="sr-only">
                  Products
                </span>
              </.link>
            </.tooltip_trigger>
            <.tooltip_content side="right">
              Products
            </.tooltip_content>
          </.tooltip>
          <.tooltip>
            <.tooltip_trigger>
              <.link
                href="#"
                class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Lucideicons.users class="h-5 w-5" />
                <span class="sr-only">
                  Customers
                </span>
              </.link>
            </.tooltip_trigger>
            <.tooltip_content side="right">
              Customers
            </.tooltip_content>
          </.tooltip>
          <.tooltip>
            <.tooltip_trigger>
              <.link
                href="#"
                class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Lucideicons.line_chart class="h-5 w-5" />
                <span class="sr-only">
                  Analytics
                </span>
              </.link>
            </.tooltip_trigger>
            <.tooltip_content side="right">
              Analytics
            </.tooltip_content>
          </.tooltip>
        </nav>
        <nav class="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <.tooltip>
            <.tooltip_trigger>
              <.link
                href="#"
                class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Lucideicons.settings class="h-5 w-5" />
                <span class="sr-only">
                  Settings
                </span>
              </.link>
            </.tooltip_trigger>
            <.tooltip_content side="right">
              Settings
            </.tooltip_content>
          </.tooltip>
        </nav>
      </aside>
      <div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <.sheet id="sheet">
            <.sheet_trigger>
              <.button size="icon" variant="outline" class="sm:hidden">
                <Lucideicons.panel_left class="h-5 w-5" />
                <span class="sr-only">
                  Toggle Menu
                </span>
              </.button>
            </.sheet_trigger>
            <.sheet_content id="side" side="left" class="sm:max-w-xs">
              <nav class="grid gap-6 text-lg font-medium">
                <.link
                  href="#"
                  class="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Lucideicons.package class="h-5 w-5 transition-all group-hover:scale-110" />
                  <span class="sr-only">
                    Acme Inc
                  </span>
                </.link>
                <.link
                  href="#"
                  class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <home class="h-5 w-5"></home>
                  Dashboard
                </.link>
                <.link href="#" class="flex items-center gap-4 px-2.5 text-foreground">
                  <Lucideicons.shopping_cart class="h-5 w-5" /> Orders
                </.link>
                <.link
                  href="#"
                  class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Lucideicons.package class="h-5 w-5" /> Products
                </.link>
                <.link
                  href="#"
                  class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Lucideicons.users class="h-5 w-5" /> Customers
                </.link>
                <.link
                  href="#"
                  class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Lucideicons.line_chart class="h-5 w-5" /> Settings
                </.link>
              </nav>
            </.sheet_content>
          </.sheet>
          <.breadcrumb class="hidden md:flex">
            <.breadcrumb_list>
              <.breadcrumb_item>
                <.breadcrumb_link>
                  <.link href="#">
                    Dashboard
                  </.link>
                </.breadcrumb_link>
              </.breadcrumb_item>
              <.breadcrumb_separator />
              <.breadcrumb_item>
                <.breadcrumb_link>
                  <.link href="#">
                    Orders
                  </.link>
                </.breadcrumb_link>
              </.breadcrumb_item>
              <.breadcrumb_separator />
              <.breadcrumb_item>
                <.breadcrumb_page>
                  Recent Orders
                </.breadcrumb_page>
              </.breadcrumb_item>
            </.breadcrumb_list>
          </.breadcrumb>
          <div class="relative ml-auto flex-1 md:grow-0">
            <Lucideicons.search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <.input
              type="text"
              placeholder="Search..."
              class="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <.dropdown_menu id="dropdown">
            <.dropdown_menu_trigger>
              <.button variant="outline" size="icon" class="overflow-hidden rounded-full">
                <img
                  src={~p"/images/avatar02.png"}
                  width="36"
                  height="36"
                  alt="Avatar"
                  class="overflow-hidden rounded-full"
                />
              </.button>
            </.dropdown_menu_trigger>
            <.dropdown_menu_content align="end">
              <.dropdown_menu_label>
                My Account
              </.dropdown_menu_label>
              <.dropdown_menu_separator></.dropdown_menu_separator>
              <.dropdown_menu_item>
                Settings
              </.dropdown_menu_item>
              <.dropdown_menu_item>
                Support
              </.dropdown_menu_item>
              <.dropdown_menu_separator></.dropdown_menu_separator>
              <.dropdown_menu_item>
                Logout
              </.dropdown_menu_item>
            </.dropdown_menu_content>
          </.dropdown_menu>
        </header>
        <main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div class="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <.card class="sm:col-span-2">
                <.card_header class="pb-3">
                  <.card_title>
                    Your Orders
                  </.card_title>
                  <.card_description class="max-w-lg text-balance leading-relaxed">
                    Introducing Our Dynamic Orders Dashboard for Seamless
                    Management and Insightful Analysis.
                  </.card_description>
                </.card_header>
                <.card_footer>
                  <.button>
                    Create New Order
                  </.button>
                </.card_footer>
              </.card>
              <.card>
                <.card_header class="pb-2">
                  <.card_description>
                    This Week
                  </.card_description>
                  <.card_title class="text-4xl">
                    $1,329
                  </.card_title>
                </.card_header>
                <.card_content>
                  <div class="text-xs text-muted-foreground">
                    +25% from last week
                  </div>
                </.card_content>
                <.card_footer>
                  <.progress value={25} aria-label="25% increase" />
                </.card_footer>
              </.card>
              <.card>
                <.card_header class="pb-2">
                  <.card_description>
                    This Month
                  </.card_description>
                  <.card_title class="text-4xl">
                    $5,329
                  </.card_title>
                </.card_header>
                <.card_content>
                  <div class="text-xs text-muted-foreground">
                    +10% from last month
                  </div>
                </.card_content>
                <.card_footer>
                  <.progress value={12} aria-label="12% increase" />
                </.card_footer>
              </.card>
            </div>
            <.tabs id="tabs" default="week">
              <div class="flex items-center">
                <.tabs_list>
                  <.tabs_trigger value="week">
                    Week
                  </.tabs_trigger>
                  <.tabs_trigger value="month">
                    Month
                  </.tabs_trigger>
                  <.tabs_trigger value="year">
                    Year
                  </.tabs_trigger>
                </.tabs_list>
                <div class="ml-auto flex items-center gap-2">
                  <.dropdown_menu id="filter">
                    <.dropdown_menu_trigger>
                      <.button variant="outline" size="sm" class="h-7 gap-1 text-sm">
                        <Lucideicons.list_filter class="h-3.5 w-3.5" />
                        <span class="sr-only sm:not-sr-only">
                          Filter
                        </span>
                      </.button>
                    </.dropdown_menu_trigger>
                    <.dropdown_menu_content align="end">
                      <.dropdown_menu_label>
                        Filter by
                      </.dropdown_menu_label>
                      <.dropdown_menu_separator />
                      <.dropdown_menu_item>
                        Fulfilled
                      </.dropdown_menu_item>
                      <.dropdown_menu_item>
                        Declined
                      </.dropdown_menu_item>
                      <.dropdown_menu_item>
                        Refunded
                      </.dropdown_menu_item>
                    </.dropdown_menu_content>
                  </.dropdown_menu>
                  <.button size="sm" variant="outline" class="h-7 gap-1 text-sm">
                    <Lucideicons.file class="h-3.5 w-3.5" />
                    <span class="sr-only sm:not-sr-only">
                      Export
                    </span>
                  </.button>
                </div>
              </div>
              <.tabs_content value="week">
                <.card>
                  <.card_header class="px-7">
                    <.card_title>
                      Orders
                    </.card_title>
                    <.card_description>
                      Recent orders from your store.
                    </.card_description>
                  </.card_header>
                  <.card_content>
                    <.table>
                      <.table_header>
                        <.table_row>
                          <.table_head>
                            Customer
                          </.table_head>
                          <.table_head class="hidden sm:table-cell">
                            Type
                          </.table_head>
                          <.table_head class="hidden sm:table-cell">
                            Status
                          </.table_head>
                          <.table_head class="hidden md:table-cell">
                            Date
                          </.table_head>
                          <.table_head class="text-right">
                            Amount
                          </.table_head>
                        </.table_row>
                      </.table_header>
                      <.table_body>
                        <.table_row class="bg-accent">
                          <.table_cell>
                            <div class="font-medium">
                              Liam Johnson
                            </div>
                            <div class="hidden text-sm text-muted-foreground md:inline">
                              liam@example.com
                            </div>
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            Sale
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            <.badge class="text-xs" variant="secondary">
                              Fulfilled
                            </.badge>
                          </.table_cell>
                          <.table_cell class="hidden md:table-cell">
                            2023-06-23
                          </.table_cell>
                          <.table_cell class="text-right">
                            $250.00
                          </.table_cell>
                        </.table_row>
                        <.table_row>
                          <.table_cell>
                            <div class="font-medium">
                              Olivia Smith
                            </div>
                            <div class="hidden text-sm text-muted-foreground md:inline">
                              olivia@example.com
                            </div>
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            Refund
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            <.badge class="text-xs" variant="outline">
                              Declined
                            </.badge>
                          </.table_cell>
                          <.table_cell class="hidden md:table-cell">
                            2023-06-24
                          </.table_cell>
                          <.table_cell class="text-right">
                            $150.00
                          </.table_cell>
                        </.table_row>
                        <.table_row>
                          <.table_cell>
                            <div class="font-medium">
                              Noah Williams
                            </div>
                            <div class="hidden text-sm text-muted-foreground md:inline">
                              noah@example.com
                            </div>
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            Subscription
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            <.badge class="text-xs" variant="secondary">
                              Fulfilled
                            </.badge>
                          </.table_cell>
                          <.table_cell class="hidden md:table-cell">
                            2023-06-25
                          </.table_cell>
                          <.table_cell class="text-right">
                            $350.00
                          </.table_cell>
                        </.table_row>
                        <.table_row>
                          <.table_cell>
                            <div class="font-medium">
                              Emma Brown
                            </div>
                            <div class="hidden text-sm text-muted-foreground md:inline">
                              emma@example.com
                            </div>
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            Sale
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            <.badge class="text-xs" variant="secondary">
                              Fulfilled
                            </.badge>
                          </.table_cell>
                          <.table_cell class="hidden md:table-cell">
                            2023-06-26
                          </.table_cell>
                          <.table_cell class="text-right">
                            $450.00
                          </.table_cell>
                        </.table_row>
                        <.table_row>
                          <.table_cell>
                            <div class="font-medium">
                              Liam Johnson
                            </div>
                            <div class="hidden text-sm text-muted-foreground md:inline">
                              liam@example.com
                            </div>
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            Sale
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            <.badge class="text-xs" variant="secondary">
                              Fulfilled
                            </.badge>
                          </.table_cell>
                          <.table_cell class="hidden md:table-cell">
                            2023-06-23
                          </.table_cell>
                          <.table_cell class="text-right">
                            $250.00
                          </.table_cell>
                        </.table_row>
                        <.table_row>
                          <.table_cell>
                            <div class="font-medium">
                              Liam Johnson
                            </div>
                            <div class="hidden text-sm text-muted-foreground md:inline">
                              liam@example.com
                            </div>
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            Sale
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            <.badge class="text-xs" variant="secondary">
                              Fulfilled
                            </.badge>
                          </.table_cell>
                          <.table_cell class="hidden md:table-cell">
                            2023-06-23
                          </.table_cell>
                          <.table_cell class="text-right">
                            $250.00
                          </.table_cell>
                        </.table_row>
                        <.table_row>
                          <.table_cell>
                            <div class="font-medium">
                              Olivia Smith
                            </div>
                            <div class="hidden text-sm text-muted-foreground md:inline">
                              olivia@example.com
                            </div>
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            Refund
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            <.badge class="text-xs" variant="outline">
                              Declined
                            </.badge>
                          </.table_cell>
                          <.table_cell class="hidden md:table-cell">
                            2023-06-24
                          </.table_cell>
                          <.table_cell class="text-right">
                            $150.00
                          </.table_cell>
                        </.table_row>
                        <.table_row>
                          <.table_cell>
                            <div class="font-medium">
                              Emma Brown
                            </div>
                            <div class="hidden text-sm text-muted-foreground md:inline">
                              emma@example.com
                            </div>
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            Sale
                          </.table_cell>
                          <.table_cell class="hidden sm:table-cell">
                            <.badge class="text-xs" variant="secondary">
                              Fulfilled
                            </.badge>
                          </.table_cell>
                          <.table_cell class="hidden md:table-cell">
                            2023-06-26
                          </.table_cell>
                          <.table_cell class="text-right">
                            $450.00
                          </.table_cell>
                        </.table_row>
                      </.table_body>
                    </.table>
                  </.card_content>
                </.card>
              </.tabs_content>
            </.tabs>
          </div>
          <div>
            <.card class="overflow-hidden">
              <.card_header class="flex flex-row items-start bg-muted/50">
                <div class="grid gap-0.5">
                  <.card_title class="group flex items-center gap-2 text-lg">
                    Order Oe31b70H
                    <.button
                      size="icon"
                      variant="outline"
                      class="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <copy class="h-3 w-3"></copy>
                      <span class="sr-only">
                        Copy Order ID
                      </span>
                    </.button>
                  </.card_title>
                  <.card_description>
                    Date: November 23, 2023
                  </.card_description>
                </div>
                <div class="ml-auto flex items-center gap-1">
                  <.button size="sm" variant="outline" class="h-8 gap-1">
                    <Lucideicons.truck class="h-3.5 w-3.5" />
                    <span class="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                      Track Order
                    </span>
                  </.button>
                  <.dropdown_menu id="action">
                    <.dropdown_menu_trigger>
                      <.button size="icon" variant="outline" class="h-8 w-8">
                        <Lucideicons.ellipsis_vertical class="h-3.5 w-3.5" />
                        <span class="sr-only">
                          More
                        </span>
                      </.button>
                    </.dropdown_menu_trigger>
                    <.dropdown_menu_content align="end">
                      <.dropdown_menu_item>
                        Edit
                      </.dropdown_menu_item>
                      <.dropdown_menu_item>
                        Export
                      </.dropdown_menu_item>
                      <.dropdown_menu_separator></.dropdown_menu_separator>
                      <.dropdown_menu_item>
                        Trash
                      </.dropdown_menu_item>
                    </.dropdown_menu_content>
                  </.dropdown_menu>
                </div>
              </.card_header>
              <.card_content class="p-6 text-sm">
                <div class="grid gap-3">
                  <div class="font-semibold">
                    Order Details
                  </div>
                  <ul class="grid gap-3">
                    <li class="flex items-center justify-between">
                      <span class="text-muted-foreground">
                        Glimmer Lamps x
                        <span>
                          2
                        </span>
                      </span>
                      <span>
                        $250.00
                      </span>
                    </li>
                    <li class="flex items-center justify-between">
                      <span class="text-muted-foreground">
                        Aqua Filters x
                        <span>
                          1
                        </span>
                      </span>
                      <span>
                        $49.00
                      </span>
                    </li>
                  </ul>
                  <.separator class="my-2" />
                  <ul class="grid gap-3">
                    <li class="flex items-center justify-between">
                      <span class="text-muted-foreground">
                        Subtotal
                      </span>
                      <span>
                        $299.00
                      </span>
                    </li>
                    <li class="flex items-center justify-between">
                      <span class="text-muted-foreground">
                        Shipping
                      </span>
                      <span>
                        $5.00
                      </span>
                    </li>
                    <li class="flex items-center justify-between">
                      <span class="text-muted-foreground">
                        Tax
                      </span>
                      <span>
                        $25.00
                      </span>
                    </li>
                    <li class="flex items-center justify-between font-semibold">
                      <span class="text-muted-foreground">
                        Total
                      </span>
                      <span>
                        $329.00
                      </span>
                    </li>
                  </ul>
                </div>
                <.separator class="my-4" />
                <div class="grid grid-cols-2 gap-4">
                  <div class="grid gap-3">
                    <div class="font-semibold">
                      Shipping Information
                    </div>
                    <address class="grid gap-0.5 not-italic text-muted-foreground">
                      <span>
                        Liam Johnson
                      </span>
                      <span>
                        1234 Main St.
                      </span>
                      <span>
                        Anytown, CA 12345
                      </span>
                    </address>
                  </div>
                  <div class="grid auto-rows-max gap-3">
                    <div class="font-semibold">
                      Billing Information
                    </div>
                    <div class="text-muted-foreground">
                      Same as shipping address
                    </div>
                  </div>
                </div>
                <.separator class="my-4" />
                <div class="grid gap-3">
                  <div class="font-semibold">
                    Customer Information
                  </div>
                  <dl class="grid gap-3">
                    <div class="flex items-center justify-between">
                      <dt class="text-muted-foreground">
                        Customer
                      </dt>
                      <dd>
                        Liam Johnson
                      </dd>
                    </div>
                    <div class="flex items-center justify-between">
                      <dt class="text-muted-foreground">
                        Email
                      </dt>
                      <dd>
                        <a href="mailto:">
                          liam@acme.com
                        </a>
                      </dd>
                    </div>
                    <div class="flex items-center justify-between">
                      <dt class="text-muted-foreground">
                        Phone
                      </dt>
                      <dd>
                        <a href="tel:">
                          +1 234 567 890
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>
                <.separator class="my-4" />
                <div class="grid gap-3">
                  <div class="font-semibold">
                    Payment Information
                  </div>
                  <dl class="grid gap-3">
                    <div class="flex items-center justify-between">
                      <dt class="flex items-center gap-1 text-muted-foreground">
                        <Lucideicons.credit_card class="h-4 w-4" /> Visa
                      </dt>
                      <dd>
                        **** **** **** 4532
                      </dd>
                    </div>
                  </dl>
                </div>
              </.card_content>
              <.card_footer class="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
                <div class="text-xs text-muted-foreground">
                  Updated
                  <time datetime="2023-11-23">
                    November 23, 2023
                  </time>
                </div>
                <.pagination class="ml-auto mr-0 w-auto">
                  <.pagination_content>
                    <.pagination_item>
                      <.button size="icon" variant="outline" class="h-6 w-6">
                        <Lucideicons.chevron_left class="h-3.5 w-3.5" />
                        <span class="sr-only">
                          Previous Order
                        </span>
                      </.button>
                    </.pagination_item>
                    <.pagination_item>
                      <.button size="icon" variant="outline" class="h-6 w-6">
                        <Lucideicons.chevron_right class="h-3.5 w-3.5" />
                        <span class="sr-only">
                          Next Order
                        </span>
                      </.button>
                    </.pagination_item>
                  </.pagination_content>
                </.pagination>
              </.card_footer>
            </.card>
          </div>
        </main>
      </div>
    </div>
    """
  end
end
