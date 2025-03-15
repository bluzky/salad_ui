defmodule SaladUI.Breadcrumb do
  @moduledoc """
  Implementation of breadcrumb component from https://ui.shadcn.com/docs/components/breadcrumb

  Breadcrumbs help users navigate through the application by showing the current location
  and providing links to previous levels in the hierarchy.

  ## Features

  * Semantic HTML structure with proper ARIA attributes for accessibility
  * Visual separators between navigation items
  * Current page indication with proper styling
  * Optional ellipsis for collapsed paths
  * Responsive design capabilities

  ## Examples

      <.breadcrumb>
        <.breadcrumb_list>
          <.breadcrumb_item>
            <.breadcrumb_link href="/">Home</.breadcrumb_link>
          </.breadcrumb_item>
          <.breadcrumb_separator />
          <.breadcrumb_item>
            <.breadcrumb_link href="/components">Components</.breadcrumb_link>
          </.breadcrumb_item>
          <.breadcrumb_separator />
          <.breadcrumb_item>
            <.breadcrumb_page>Breadcrumb</.breadcrumb_page>
          </.breadcrumb_item>
        </.breadcrumb_list>
      </.breadcrumb>

  For responsive breadcrumbs that collapse on mobile:

      <.breadcrumb>
        <.breadcrumb_list>
          <.breadcrumb_item>
            <.breadcrumb_link href="/">Home</.breadcrumb_link>
          </.breadcrumb_item>
          <.breadcrumb_separator />

          <!-- Show on desktop only -->
          <div class="hidden md:flex md:items-center">
            <.breadcrumb_item>
              <.breadcrumb_link href="/components">Components</.breadcrumb_link>
            </.breadcrumb_item>
            <.breadcrumb_separator />
          </div>

          <!-- Show on mobile only -->
          <div class="md:hidden">
            <.breadcrumb_ellipsis />
            <.breadcrumb_separator />
          </div>

          <.breadcrumb_item>
            <.breadcrumb_page>Breadcrumb</.breadcrumb_page>
          </.breadcrumb_item>
        </.breadcrumb_list>
      </.breadcrumb>
  """
  use SaladUI, :component

  @doc """
  Renders a breadcrumb.
  ## Attributes

  * `:class` - Additional CSS classes to apply to the breadcrumb container
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def breadcrumb(assigns) do
    ~H"""
    <nav
      arial-label="breadcrumb"
      class={
        classes([
          "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
          @class
        ])
      }
      {@rest}
      }
    >
      {render_slot(@inner_block)}
    </nav>
    """
  end

  @doc """
  Renders breadcrumb list.

  Wraps the breadcrumb items in an ordered list to represent the hierarchical structure.

  ## Attributes

  * `:class` - Additional CSS classes to apply to the list
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def breadcrumb_list(assigns) do
    ~H"""
    <ol
      class={
        classes([
          "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
          @class
        ])
      }
      {@rest}
      }
    >
      {render_slot(@inner_block)}
    </ol>
    """
  end

  @doc """
  Renders a breadcrumb item.

  Individual item in the breadcrumb path that can contain a link or the current page.

  ## Attributes

  * `:class` - Additional CSS classes to apply to the item
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def breadcrumb_item(assigns) do
    ~H"""
    <li
      class={
        classes([
          "inline-flex items-center gap-1.5",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </li>
    """
  end

  @doc """
  Renders a breadcrumb link.

  Used for all breadcrumb items except the current page.

  ## Attributes

  * `:class` - Additional CSS classes to apply to the link
  * Standard HTML link attributes (href, target, etc.) are supported
  """
  attr :class, :string, default: nil
  attr :rest, :global, include: ~w(download href hreflang ping referrerpolicy rel target type)
  slot :inner_block, required: true

  def breadcrumb_link(assigns) do
    ~H"""
    <.link
      class={
        classes([
          "transition-colors hover:text-foreground",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </.link>
    """
  end

  @doc """
  Renders the current page breadcrumb item.

  Used for the final item in the breadcrumb path, representing the current page.
  The current page is not a link but styled differently to indicate the current location.

  ## Attributes

  * `:class` - Additional CSS classes to apply to the current page element
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def breadcrumb_page(assigns) do
    ~H"""
    <span
      role="link"
      class={
        classes([
          "font-normal text-foreground",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </span>
    """
  end

  @doc """
  Renders a separator between breadcrumb items.

  Visual indicator that separates items in the breadcrumb path.
  By default, shows a chevron right icon.

  ## Attributes

  * `:class` - Additional CSS classes to apply to the separator
  """
  attr :class, :string, default: nil
  attr :rest, :global

  def breadcrumb_separator(assigns) do
    ~H"""
    <li
      role="presentation"
      class={
        classes([
          "[&>svg]:size-3.5",
          @class
        ])
      }
      {@rest}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="size-6 w-3"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
    </li>
    """
  end

  @doc """
  Renders an ellipsis indicator for collapsed breadcrumb items.

  Used in responsive designs to indicate that some breadcrumb items are hidden.
  Typically used for middle items in a long breadcrumb path on mobile views.

  ## Attributes

  * `:class` - Additional CSS classes to apply to the ellipsis
  """
  attr :class, :string, default: nil
  attr :rest, :global

  def breadcrumb_ellipsis(assigns) do
    ~H"""
    <div
      class={
        classes([
          "flex h-9 w-9 items-center justify-center",
          @class
        ])
      }
      {@rest}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-4 h-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>

      <span class="sr-only">More</span>
    </div>
    """
  end
end
