defmodule SaladUI.Alert do
  @moduledoc """
  Implementation of alert component for displaying important messages to users.

  Alerts are used to communicate status, warnings, or contextual feedback to users.
  They can be configured with different variants to indicate severity and typically
  consist of a title and a description.

  ## Examples:

      <.alert>
        <.alert_title>Note</.alert_title>
        <.alert_description>This is a standard informational alert.</.alert_description>
      </.alert>

      <.alert variant="destructive">
        <.alert_title>Error</.alert_title>
        <.alert_description>
          There was a problem with your request. Please try again.
        </.alert_description>
      </.alert>

      <.alert>
        <span class="mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M9 12l2 2l4-4"></path>
          </svg>
        </span>
        <.alert_title>Success</.alert_title>
        <.alert_description>Your changes have been saved successfully.</.alert_description>
      </.alert>
  """
  use SaladUI, :component

  @doc """
  Renders an alert container.

  The alert component displays important messages or feedback to users with styling
  appropriate for the context.

  ## Options

  * `:variant` - The visual style of the alert. Available variants:
    * `"default"` - Standard alert styling (default)
    * `"destructive"` - Red-tinted styling for errors and warnings
  * `:class` - Additional CSS classes to apply to the alert container.

  ## Examples

      <.alert>
        <.alert_title>Information</.alert_title>
        <.alert_description>This is an informational message.</.alert_description>
      </.alert>

      <.alert variant="destructive" class="mt-4">
        <.alert_title>Warning</.alert_title>
        <.alert_description>This action cannot be undone.</.alert_description>
      </.alert>
  """
  attr :variant, :string, default: "default", values: ~w(default destructive)
  attr :class, :string, default: nil
  slot :inner_block, required: true
  attr :rest, :global, default: %{}

  def alert(assigns) do
    assigns = assign(assigns, :variant_class, variant(assigns))

    ~H"""
    <div
      role="alert"
      class={
        classes([
          "relative w-full rounded-lg border p-4 [&>span~*]:pl-7 [&>span+div]:translate-y-[-3px] [&>span]:absolute [&>span]:left-4 [&>span]:top-4",
          @variant_class,
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @doc """
  Renders an alert title.

  The title component is used to provide a concise heading for the alert message.

  ## Options

  * `:class` - Additional CSS classes to apply to the title.

  ## Examples

      <.alert_title>Success</.alert_title>
      <.alert_title class="text-primary">Important Notice</.alert_title>
  """
  attr :class, :string, default: nil
  attr :rest, :global, include: ~w(disabled form name value)
  slot :inner_block, required: true

  def alert_title(assigns) do
    ~H"""
    <h5
      class={
        classes([
          "mb-1 font-medium leading-none tracking-tight",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </h5>
    """
  end

  @doc """
  Renders an alert description.

  The description provides more detailed information about the alert message.

  ## Options

  * `:class` - Additional CSS classes to apply to the description.

  ## Examples

      <.alert_description>Your account has been updated successfully.</.alert_description>
      <.alert_description class="text-gray-600">
        Please review the changes before continuing.
      </.alert_description>
  """
  attr :class, :string, default: nil
  attr :rest, :global, include: ~w(disabled form name value)
  slot :inner_block, required: true

  def alert_description(assigns) do
    ~H"""
    <div
      class={
        classes([
          "text-sm [&_p]:leading-relaxed",
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </div>
    """
  end

  @variants %{
    variant: %{
      "default" => "bg-background text-foreground",
      "destructive" =>
        "bg-background border-destructive/50 text-destructive dark:border-destructive [&>span]:text-destructive"
    }
  }

  @default_variants %{
    variant: "default"
  }

  defp variant(variants) do
    variants = Map.merge(@default_variants, variants)

    Enum.map_join(variants, " ", fn {key, value} -> @variants[key][value] end)
  end
end
