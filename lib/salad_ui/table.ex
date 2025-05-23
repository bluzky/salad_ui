defmodule SaladUI.Table do
  @moduledoc """
  Implementation of table components from https://ui.shadcn.com/docs/components/table
  with proper ARIA attributes for accessibility.

  ## Examples:

      <.table aria-label="Invoices">
         <.table_caption>A list of your recent invoices.</.table_caption>
         <.table_header>
           <.table_row>
             <.table_head class="w-[100px]">Invoice</.table_head>
             <.table_head>Status</.table_head>
             <.table_head>Method</.table_head>
             <.table_head class="text-right">Amount</.table_head>
           </.table_row>
         </.table_header>
         <.table_body>
           <.table_row :for={invoice <- @invoices}>
             <.table_cell class="font-medium"><%= invoice.number %></.table_cell>
             <.table_cell><%= invoice.status %></.table_cell>
             <.table_cell><%= invoice.method %></.table_cell>
             <.table_cell class="text-right"><%= invoice.amount %></.table_cell>
           </.table_row>
         </.table_body>
      </.table>
  """
  use SaladUI, :component

  @doc """
  Renders a data table.

  ## Attributes

  * `:class` - Additional CSS classes for the table
  * `:aria-label` - Accessible name for the table when no caption is present
  * `:aria-describedby` - ID of an element that describes the table
  """
  attr :class, :string, default: nil
  attr :"aria-label", :string, default: nil
  attr :"aria-describedby", :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def table(assigns) do
    ~H"""
    <table
      class={classes(["w-full caption-bottom text-sm", @class])}
      aria-label={assigns[:"aria-label"]}
      aria-describedby={assigns[:"aria-describedby"]}
      {@rest}
    >
      {render_slot(@inner_block)}
    </table>
    """
  end

  @doc """
  Renders the table header container.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def table_header(assigns) do
    ~H"""
    <thead class={classes(["[&_tr]:border-b", @class])} {@rest}>
      {render_slot(@inner_block)}
    </thead>
    """
  end

  @doc """
  Renders a table row.

  ## Attributes

  * `:class` - Additional CSS classes
  * `:aria-rowindex` - Numeric index of the row
  """
  attr :class, :string, default: nil
  attr :"aria-rowindex", :integer, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def table_row(assigns) do
    ~H"""
    <tr
      class={
        classes([
          "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
          @class
        ])
      }
      aria-rowindex={assigns[:"aria-rowindex"]}
      {@rest}
    >
      {render_slot(@inner_block)}
    </tr>
    """
  end

  @doc """
  Renders a table column header.

  ## Attributes

  * `:class` - Additional CSS classes
  * `:scope` - Scope of the header cell (default: "col")
  * `:aria-sort` - Sort direction for screen readers (ascending, descending, or none)
  """
  attr :class, :string, default: nil
  attr :scope, :string, default: "col"
  attr :"aria-sort", :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def table_head(assigns) do
    ~H"""
    <th
      class={
        classes([
          "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
          @class
        ])
      }
      scope={@scope}
      aria-sort={assigns[:"aria-sort"]}
      {@rest}
    >
      {render_slot(@inner_block)}
    </th>
    """
  end

  @doc """
  Renders the table body.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def table_body(assigns) do
    ~H"""
    <tbody class={classes(["[&_tr:last-child]:border-0", @class])} {@rest}>
      {render_slot(@inner_block)}
    </tbody>
    """
  end

  @doc """
  Renders a table data cell.

  ## Attributes

  * `:class` - Additional CSS classes
  """
  attr :class, :any, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def table_cell(assigns) do
    ~H"""
    <td class={classes(["p-4 align-middle [&:has([role=checkbox])]:pr-0", @class])} {@rest}>
      {render_slot(@inner_block)}
    </td>
    """
  end

  @doc """
  Renders a table footer.
  """
  attr :class, :string, default: nil
  attr :rest, :global, include: ~w(disabled form name value)
  slot :inner_block, required: true

  def table_footer(assigns) do
    ~H"""
    <tfoot
      class={
        classes([
          "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </tfoot>
    """
  end

  @doc """
  Renders a table caption.

  A caption provides an accessible name for the table.
  """
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def table_caption(assigns) do
    ~H"""
    <caption class={classes(["mt-4 text-sm text-muted-foreground", @class])} {@rest}>
      {render_slot(@inner_block)}
    </caption>
    """
  end
end
