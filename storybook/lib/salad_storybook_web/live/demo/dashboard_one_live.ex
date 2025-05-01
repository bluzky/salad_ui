defmodule SaladStorybookWeb.Demo.DashboardOne do
  @moduledoc false
  use SaladStorybookWeb, :demo_view

  import SaladUI.Badge
  import SaladUI.Breadcrumb
  import SaladUI.Button
  import SaladUI.Card
  import SaladUI.DropdownMenu
  import SaladUI.Input
  import SaladUI.Menu
  import SaladUI.Sheet
  import SaladUI.Skeleton
  import SaladUI.Table
  import SaladUI.Tabs
  import SaladUI.Tooltip

  @impl true
  def mount(_params, _session, socket) do
    {:ok, assign(socket, products: seed_products(10))}
  end

  defp seed_products(count) do
    Enum.map(1..count, fn _ ->
      %{
        id: 8 |> :crypto.strong_rand_bytes() |> Base.encode16(),
        name: Faker.Commerce.product_name(),
        status: Enum.random(~w[active draft]),
        price: Faker.Commerce.price(),
        total_sales: Enum.random(0..100),
        created_at: Faker.DateTime.between(~D[2023-01-01], ~D[2024-12-31])
      }
    end)
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
            <span class="sr-only">Acme Inc</span>
          </.link>
          <.tooltip>
            <.link
              href="#"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Lucideicons.home class="h-5 w-5" />
              <span class="sr-only">Dashboard</span>
            </.link>
            <.tooltip_content side="right">Dashboard</.tooltip_content>
          </.tooltip>
          <.tooltip>
            <.link
              href="#"
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Lucideicons.shopping_cart class="h-5 w-5" />
              <span class="sr-only">Orders</span>
            </.link>
            <.tooltip_content side="right">Orders</.tooltip_content>
          </.tooltip>
          <.tooltip>
            <.link
              href="#"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Lucideicons.package class="h-5 w-5" />
              <span class="sr-only">Products</span>
            </.link>
            <.tooltip_content side="right">Products</.tooltip_content>
          </.tooltip>
          <.tooltip>
            <.link
              href="#"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Lucideicons.users class="h-5 w-5" />
              <span class="sr-only">Customers</span>
            </.link>
            <.tooltip_content side="right">Customers</.tooltip_content>
          </.tooltip>
          <.tooltip>
            <.link
              href="#"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Lucideicons.line_chart class="h-5 w-5" />
              <span class="sr-only">Analytics</span>
            </.link>
            <.tooltip_content side="right">Analytics</.tooltip_content>
          </.tooltip>
        </nav>
        <nav class="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <.tooltip>
            <.link
              href="#"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Lucideicons.settings class="h-5 w-5" />
              <span class="sr-only">Settings</span>
            </.link>
            <.tooltip_content side="right">Settings</.tooltip_content>
          </.tooltip>
        </nav>
      </aside>
      <div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <.sheet id="menu">
            <.sheet_trigger target="sheet">
              <.button size="icon" variant="outline" class="sm:hidden">
                <Lucideicons.panel_left class="h-5 w-5" />
                <span class="sr-only">Toggle Menu</span>
              </.button>
            </.sheet_trigger>
            <.sheet_content id="sheet" side="left" class="sm:max-w-xs">
              <nav class="grid gap-6 text-lg font-medium">
                <.link
                  href="#"
                  class="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Lucideicons.package class="h-5 w-5 transition-all group-hover:scale-110" />
                  <span class="sr-only">Acme Inc</span>
                </.link>
                <.link
                  href="#"
                  class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Lucideicons.home class="h-5 w-5" /> Dashboard
                </.link>
                <.link
                  href="#"
                  class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Lucideicons.shopping_cart class="h-5 w-5" /> Orders
                </.link>
                <.link href="#" class="flex items-center gap-4 px-2.5 text-foreground">
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
                  <.link href="#"></.link>Dashboard
                </.breadcrumb_link>
              </.breadcrumb_item>
              <.breadcrumb_separator />
              <.breadcrumb_item>
                <.breadcrumb_link>
                  <.link href="#"></.link>Products
                </.breadcrumb_link>
              </.breadcrumb_item>
              <.breadcrumb_separator />
              <.breadcrumb_item>
                <.breadcrumb_page>All Products</.breadcrumb_page>
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
          <.dropdown_menu id="accounts">
            <.dropdown_menu_trigger>
              <.button variant="outline" size="icon" class="overflow-hidden rounded-full">
                <img
                  src={~p"/images/avatar02.png"}
                  width="{36}"
                  height="{36}"
                  alt="Avatar"
                  class="overflow-hidden rounded-full"
                />
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
        </header>
        <main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <.tabs :let={builder} default="all" id="tabs">
            <div class="flex items-center">
              <.tabs_list>
                <.tabs_trigger value="all" builder={builder}>All</.tabs_trigger>
                <.tabs_trigger value="active" builder={builder}>Active</.tabs_trigger>
                <.tabs_trigger value="draft" builder={builder}>Draft</.tabs_trigger>
                <.tabs_trigger value="archived" builder={builder} class="hidden sm:flex">
                  Archived
                </.tabs_trigger>
              </.tabs_list>
              <div class="ml-auto flex items-center gap-2">
                <.dropdown_menu id="filters">
                  <.dropdown_menu_trigger>
                    <.button variant="outline" size="sm" class="h-8 gap-1">
                      <Lucideicons.list_filter class="h-3.5 w-3.5" />
                      <span class="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                      </span>
                    </.button>
                  </.dropdown_menu_trigger>
                  <.dropdown_menu_content align="end">
                    <.dropdown_menu_label>Filter by</.dropdown_menu_label>
                    <.dropdown_menu_separator />
                    <.dropdown_menu_item>
                      Active
                    </.dropdown_menu_item>
                    <.dropdown_menu_item>Draft</.dropdown_menu_item>
                    <.dropdown_menu_item>
                      Archived
                    </.dropdown_menu_item>
                  </.dropdown_menu_content>
                </.dropdown_menu>
                <.button size="sm" variant="outline" class="h-8 gap-1">
                  <Lucideicons.file class="h-3.5 w-3.5" />
                  <span class="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </.button>
                <.button size="sm" class="h-8 gap-1">
                  <Lucideicons.circle_plus class="h-3.5 w-3.5" />
                  <span class="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Product
                  </span>
                </.button>
              </div>
            </div>
            <.tabs_content value="all">
              <.card>
                <.card_header>
                  <.card_title>Products</.card_title>
                  <.card_description>
                    Manage your products and view their sales performance.
                  </.card_description>
                </.card_header>
                <.card_content>
                  <.table>
                    <.table_header>
                      <.table_row>
                        <.table_head class="hidden w-[100px] sm:table-cell"></.table_head>
                        <.table_head>Name</.table_head>
                        <.table_head>Status</.table_head>
                        <.table_head class="hidden md:table-cell">
                          Price
                        </.table_head>
                        <.table_head class="hidden md:table-cell">
                          Total Sales
                        </.table_head>
                        <.table_head class="hidden md:table-cell">
                          Created at
                        </.table_head>
                        <.table_head>
                          <span class="sr-only">Actions</span>
                        </.table_head>
                      </.table_row>
                    </.table_header>
                    <.table_body :for={product <- @products}>
                      <.table_row>
                        <.table_cell class="hidden sm:table-cell">
                          <.skeleton class="h-16 w-16" />
                        </.table_cell>
                        <.table_cell class="font-medium">
                          {product.name}
                        </.table_cell>
                        <.table_cell>
                          <.badge variant="outline">{product.status}</.badge>
                        </.table_cell>
                        <.table_cell class="hidden md:table-cell">
                          ${product.price}
                        </.table_cell>
                        <.table_cell class="hidden md:table-cell">
                          {product.total_sales}
                        </.table_cell>
                        <.table_cell class="hidden md:table-cell">
                          {product.created_at |> Calendar.strftime("%Y-%m-%d %I:%M:%S %p")}
                        </.table_cell>
                        <.table_cell>
                          <.dropdown_menu id="actions">
                            <.dropdown_menu_trigger>
                              <.button aria-haspopup="true" size="icon" variant="ghost">
                                <Lucideicons.ellipsis class="h-4 w-4" />
                                <span class="sr-only">Toggle menu</span>
                              </.button>
                            </.dropdown_menu_trigger>
                            <.dropdown_menu_content align="end">
                              <.dropdown_menu_label>Actions</.dropdown_menu_label>
                              <.dropdown_menu_item>Edit</.dropdown_menu_item>
                              <.dropdown_menu_item>Delete</.dropdown_menu_item>
                            </.dropdown_menu_content>
                          </.dropdown_menu>
                        </.table_cell>
                      </.table_row>
                    </.table_body>
                  </.table>
                </.card_content>
                <.card_footer>
                  <div class="text-xs text-muted-foreground">
                    Showing <strong>1-10</strong> of <strong>32</strong> products
                  </div>
                </.card_footer>
              </.card>
            </.tabs_content>
          </.tabs>
        </main>
      </div>
    </div>
    """
  end
end
