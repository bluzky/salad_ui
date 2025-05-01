defmodule SaladStorybookWeb.Demo.DashboardThree do
  @moduledoc false
  use SaladStorybookWeb, :demo_view

  import SaladStorybookWeb.CoreComponents, only: [icon: 1]
  import SaladUI.Avatar
  import SaladUI.Badge
  import SaladUI.Button
  import SaladUI.Card
  import SaladUI.DropdownMenu
  import SaladUI.Input
  import SaladUI.Menu
  import SaladUI.Sheet
  import SaladUI.Table

  @impl true
  def mount(_params, _session, socket) do
    {:ok, socket}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <header class="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav class="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <.link href="#" class="flex items-center gap-2 text-lg font-semibold md:text-base">
          <.icon name="hero-rectangle-stack" class="h-6 w-6" />
          <span class="sr-only">Acme Inc</span>
        </.link>
        <.link href="#" class="text-foreground transition-colors hover:text-foreground">
          Dashboard
        </.link>
        <.link href="#" class="text-muted-foreground transition-colors hover:text-foreground">
          Orders
        </.link>
        <.link href="#" class="text-muted-foreground transition-colors hover:text-foreground">
          Products
        </.link>
        <.link href="#" class="text-muted-foreground transition-colors hover:text-foreground">
          Customers
        </.link>
        <.link href="#" class="text-muted-foreground transition-colors hover:text-foreground">
          Analytics
        </.link>
      </nav>
      <.sheet id="menu">
        <.sheet_trigger target="sheet-content">
          <.button variant="outline" size="icon" class="shrink-0 md:hidden">
            <.icon name="hero-bars-3" class="h-5 w-5" />
            <span class="sr-only">Toggle navigation menu</span>
          </.button>
        </.sheet_trigger>
        <.sheet_content side="left" id="sheet-content">
          <nav class="grid gap-6 text-lg font-medium">
            <.link href="#" class="flex items-center gap-2 text-lg font-semibold">
              <.icon name="hero-inbox" class="h-6 w-6" />
              <span class="sr-only">Acme Inc</span>
            </.link>
            <.link href="#" class="hover:text-foreground">
              Dashboard
            </.link>
            <.link href="#" class="text-muted-foreground hover:text-foreground">
              Orders
            </.link>
            <.link href="#" class="text-muted-foreground hover:text-foreground">
              Products
            </.link>
            <.link href="#" class="text-muted-foreground hover:text-foreground">
              Customers
            </.link>
            <.link href="#" class="text-muted-foreground hover:text-foreground">
              Analytics
            </.link>
          </nav>
        </.sheet_content>
      </.sheet>
      <div class="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form class="ml-auto flex-1 sm:flex-initial">
          <div class="relative">
            <.icon
              name="hero-magnifying-glass"
              class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            />
            <.input
              type="text"
              placeholder="Search products..."
              class="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <.dropdown_menu id="accounts">
          <.dropdown_menu_trigger>
            <.button variant="secondary" size="icon" class="rounded-full">
              <.icon name="hero-user-circle" class="h-5 w-5" />
              <span class="sr-only">Toggle user menu</span>
            </.button>
          </.dropdown_menu_trigger>
          <.dropdown_menu_content align="end">
            <.dropdown_menu_label>My Account</.dropdown_menu_label>
            <.dropdown_menu_separator />
            <.dropdown_menu_item>Settings</.dropdown_menu_item>
            <.dropdown_menu_item>Support</.dropdown_menu_item>
            <.dropdown_menu_separator />
            <.dropdown_menu_item>Logout</.dropdown_menu_item>
          </.dropdown_menu_content>
        </.dropdown_menu>
      </div>
    </header>
    <main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <.card>
          <.card_header class="flex flex-row items-center justify-between space-y-0 pb-2">
            <.card_title class="text-sm font-medium">
              Total Revenue
            </.card_title>
            <.icon name="hero-currency-dollar" class="h-4 w-4 text-muted-foreground" />
          </.card_header>
          <.card_content>
            <div class="text-2xl font-bold">$45,231.89</div>
            <p class="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </.card_content>
        </.card>
        <.card>
          <.card_header class="flex flex-row items-center justify-between space-y-0 pb-2">
            <.card_title class="text-sm font-medium">
              Subscriptions
            </.card_title>
            <.icon name="hero-users" class="h-4 w-4 text-muted-foreground" />
          </.card_header>
          <.card_content>
            <div class="text-2xl font-bold">+2350</div>
            <p class="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </.card_content>
        </.card>
        <.card>
          <.card_header class="flex flex-row items-center justify-between space-y-0 pb-2">
            <.card_title class="text-sm font-medium">Sales</.card_title>
            <.icon name="hero-credit-card" class="h-4 w-4 text-muted-foreground" />
          </.card_header>
          <.card_content>
            <div class="text-2xl font-bold">+12,234</div>
            <p class="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </.card_content>
        </.card>
        <.card>
          <.card_header class="flex flex-row items-center justify-between space-y-0 pb-2">
            <.card_title class="text-sm font-medium">Active Now</.card_title>
            <.icon name="hero-cursor-arrow-rays" class="h-4 w-4 text-muted-foreground" />
          </.card_header>
          <.card_content>
            <div class="text-2xl font-bold">+573</div>
            <p class="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </.card_content>
        </.card>
      </div>
      <div class="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-5">
        <.card class="xl:col-span-3">
          <.card_header class="flex flex-row items-center">
            <div class="grid gap-2">
              <.card_title>Transactions</.card_title>
              <.card_description>
                Recent transactions from your store.
              </.card_description>
            </div>
            <.button size="sm" class="ml-auto gap-1">
              <.link href="#">
                View All <.icon name="hero-arrow-up-right" class="h-4 w-4" />
              </.link>
            </.button>
          </.card_header>
          <.card_content>
            <.table>
              <.table_header>
                <.table_row>
                  <.table_head>Customer</.table_head>
                  <.table_head class="hidden xl:table-column">
                    Type
                  </.table_head>
                  <.table_head class="hidden xl:table-column">
                    Status
                  </.table_head>
                  <.table_head class="hidden xl:table-column">
                    Date
                  </.table_head>
                  <.table_head class="text-right">Amount</.table_head>
                </.table_row>
              </.table_header>
              <.table_body>
                <.table_row>
                  <.table_cell>
                    <div class="font-medium">Liam Johnson</div>
                    <div class="hidden text-sm text-muted-foreground md:inline">
                      liam@example.com
                    </div>
                  </.table_cell>
                  <.table_cell class="hidden xl:table-column">
                    Sale
                  </.table_cell>
                  <.table_cell class="hidden xl:table-column">
                    <.badge class="text-xs" variant="outline">
                      Approved
                    </.badge>
                  </.table_cell>
                  <.table_cell class="hidden md:table-cell lg:hidden xl:table-column">
                    2023-06-23
                  </.table_cell>
                  <.table_cell class="text-right">$250.00</.table_cell>
                </.table_row>
                <.table_row>
                  <.table_cell>
                    <div class="font-medium">Olivia Smith</div>
                    <div class="hidden text-sm text-muted-foreground md:inline">
                      olivia@example.com
                    </div>
                  </.table_cell>
                  <.table_cell class="hidden xl:table-column">
                    Refund
                  </.table_cell>
                  <.table_cell class="hidden xl:table-column">
                    <.badge class="text-xs" variant="outline">
                      Declined
                    </.badge>
                  </.table_cell>
                  <.table_cell class="hidden md:table-cell lg:hidden xl:table-column">
                    2023-06-24
                  </.table_cell>
                  <.table_cell class="text-right">$150.00</.table_cell>
                </.table_row>
                <.table_row>
                  <.table_cell>
                    <div class="font-medium">Noah Williams</div>
                    <div class="hidden text-sm text-muted-foreground md:inline">
                      noah@example.com
                    </div>
                  </.table_cell>
                  <.table_cell class="hidden xl:table-column">
                    Subscription
                  </.table_cell>
                  <.table_cell class="hidden xl:table-column">
                    <.badge class="text-xs" variant="outline">
                      Approved
                    </.badge>
                  </.table_cell>
                  <.table_cell class="hidden md:table-cell lg:hidden xl:table-column">
                    2023-06-25
                  </.table_cell>
                  <.table_cell class="text-right">$350.00</.table_cell>
                </.table_row>
                <.table_row>
                  <.table_cell>
                    <div class="font-medium">Emma Brown</div>
                    <div class="hidden text-sm text-muted-foreground md:inline">
                      emma@example.com
                    </div>
                  </.table_cell>
                  <.table_cell class="hidden xl:table-column">
                    Sale
                  </.table_cell>
                  <.table_cell class="hidden xl:table-column">
                    <.badge class="text-xs" variant="outline">
                      Approved
                    </.badge>
                  </.table_cell>
                  <.table_cell class="hidden md:table-cell lg:hidden xl:table-column">
                    2023-06-26
                  </.table_cell>
                  <.table_cell class="text-right">$450.00</.table_cell>
                </.table_row>
                <.table_row>
                  <.table_cell>
                    <div class="font-medium">Liam Johnson</div>
                    <div class="hidden text-sm text-muted-foreground md:inline">
                      liam@example.com
                    </div>
                  </.table_cell>
                  <.table_cell class="hidden xl:table-column">
                    Sale
                  </.table_cell>
                  <.table_cell class="hidden xl:table-column">
                    <.badge class="text-xs" variant="outline">
                      Approved
                    </.badge>
                  </.table_cell>
                  <.table_cell class="hidden md:table-cell lg:hidden xl:table-column">
                    2023-06-27
                  </.table_cell>
                  <.table_cell class="text-right">$550.00</.table_cell>
                </.table_row>
              </.table_body>
            </.table>
          </.card_content>
        </.card>
        <.card class="xl:col-span-2">
          <.card_header>
            <.card_title>Recent Sales</.card_title>
          </.card_header>
          <.card_content class="grid gap-8">
            <div class="flex items-center gap-4">
              <.avatar class="h-9 w-9">
                <.avatar_image src="https://ui.shadcn.com/avatars/01.png" alt=".avatar" />
                <.avatar_fallback>OM</.avatar_fallback>
              </.avatar>
              <div class="grid gap-1">
                <p class="text-sm font-medium leading-none">
                  Olivia Martin
                </p>
                <p class="text-sm text-muted-foreground">
                  olivia.martin@email.com
                </p>
              </div>
              <div class="ml-auto font-medium">+$1,999.00</div>
            </div>
            <div class="flex items-center gap-4">
              <.avatar class="h-9 w-9">
                <.avatar_image src="https://ui.shadcn.com/avatars/01.png" alt=".avatar" />
                <.avatar_fallback>JL</.avatar_fallback>
              </.avatar>
              <div class="grid gap-1">
                <p class="text-sm font-medium leading-none">
                  Jackson Lee
                </p>
                <p class="text-sm text-muted-foreground">
                  jackson.lee@email.com
                </p>
              </div>
              <div class="ml-auto font-medium">+$39.00</div>
            </div>
            <div class="flex items-center gap-4">
              <.avatar class="h-9 w-9">
                <.avatar_image src="https://ui.shadcn.com/avatars/01.png" alt=".avatar" />
                <.avatar_fallback>IN</.avatar_fallback>
              </.avatar>
              <div class="grid gap-1">
                <p class="text-sm font-medium leading-none">
                  Isabella Nguyen
                </p>
                <p class="text-sm text-muted-foreground">
                  isabella.nguyen@email.com
                </p>
              </div>
              <div class="ml-auto font-medium">+$299.00</div>
            </div>
            <div class="flex items-center gap-4">
              <.avatar class="h-9 w-9">
                <.avatar_image src="x" alt=".avatar" id="ii" />
                <.avatar_fallback>WK</.avatar_fallback>
              </.avatar>
              <div class="grid gap-1">
                <p class="text-sm font-medium leading-none">
                  William Kim
                </p>
                <p class="text-sm text-muted-foreground">
                  will@email.com
                </p>
              </div>
              <div class="ml-auto font-medium">+$99.00</div>
            </div>
            <div class="flex items-center gap-4">
              <.avatar class="h-9 w-9">
                <.avatar_image src="https://ui.shadcn.com/avatars/04.png" alt=".avatar" />
                <.avatar_fallback>SD</.avatar_fallback>
              </.avatar>
              <div class="grid gap-1">
                <p class="text-sm font-medium leading-none">
                  Sofia Davis
                </p>
                <p class="text-sm text-muted-foreground">
                  sofia.davis@email.com
                </p>
              </div>
              <div class="ml-auto font-medium">+$39.00</div>
            </div>
          </.card_content>
        </.card>
      </div>
    </main>
    """
  end
end
