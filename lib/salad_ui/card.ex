defmodule SaladUI.Card do
  @moduledoc """
  Card components for containing content and actions.

  Cards provide a flexible container for displaying content with support for headers,
  footers, and various content layouts. They organize information and actions consistently.
  """
  use SaladUI, :component

  @doc """
  Renders a card container.

  ## Examples:

      <.card>
        <.card_header>
          <.card_title>Account Settings</.card_title>
          <.card_description>Manage your account settings.</.card_description>
        </.card_header>
        <.card_content>
          <p>Your account details and preferences.</p>
        </.card_content>
        <.card_footer>
          <.button variant="outline">Cancel</.button>
          <.button>Save</.button>
        </.card_footer>
      </.card>
  """

  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def card(assigns) do
    ~H"""
    <div class={classes(["rounded-xl border bg-card text-card-foreground shadow", @class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Renders a card header section for title and description.
  """
  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def card_header(assigns) do
    ~H"""
    <div class={classes(["flex flex-col space-y-1.5 p-6", @class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Renders a card title within the header section.
  """
  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def card_title(assigns) do
    ~H"""
    <h3 class={classes(["text-2xl font-semibold leading-none tracking-tight", @class])} {@rest}>
      {render_slot(@inner_block)}
    </h3>
    """
  end

  @doc """
  Renders a card description within the header section.
  """
  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def card_description(assigns) do
    ~H"""
    <p class={classes(["text-sm text-muted-foreground", @class])} {@rest}>
      {render_slot(@inner_block)}
    </p>
    """
  end

  @doc """
  Renders the main content area of the card.
  """
  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def card_content(assigns) do
    ~H"""
    <div class={classes(["p-6 pt-0", @class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Renders a footer section for the card, typically containing actions.
  """
  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global

  def card_footer(assigns) do
    ~H"""
    <div class={classes(["flex items-center justify-between p-6 pt-0 ", @class])} {@rest}>
      {render_slot(@inner_block)}
    </div>
    """
  end
end
