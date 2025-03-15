defmodule SaladUI.Button do
  @moduledoc """
  Button component for user interactions.

  Provides a versatile button component with various styles, sizes, and states
  to handle user interactions throughout the application.
  """
  use SaladUI, :component

  @doc """
  Renders a button with configurable styles and behaviors.

  ## Attributes

  * `:type` - HTML button type attribute (e.g., "button", "submit")
  * `:class` - Additional CSS classes
  * `:variant` - Visual style variant of the button:
      * `"default"` - Primary action button
      * `"secondary"` - Secondary action button
      * `"destructive"` - Buttons for destructive actions
      * `"outline"` - Button with outline style
      * `"ghost"` - Button with minimal styling
      * `"link"` - Button that appears as a link
  * `:size` - Size of the button:
      * `"default"` - Standard size
      * `"sm"` - Small size
      * `"lg"` - Large size
      * `"icon"` - Square button optimized for icons
  * `:rest` - Additional HTML attributes including `disabled`, `form`, `name`, `value`

  ## Examples

      <.button>Send</.button>
      <.button variant="destructive" phx-click="delete">Delete</.button>
      <.button variant="outline" size="sm">Cancel</.button>
      <.button variant="ghost" size="icon">
        <.icon name="hero-x-mark" />
      </.button>
      <.button type="submit" phx-disable-with="Saving...">Save Changes</.button>
  """
  attr :type, :string, default: nil
  attr :class, :any, default: nil

  attr :variant, :string,
    values: ~w(default secondary destructive outline ghost link),
    default: "default",
    doc: "the button variant style"

  attr :size, :string, values: ~w(default sm lg icon), default: "default"
  attr :rest, :global, include: ~w(disabled form name value)

  slot :inner_block, required: true

  def(button(assigns)) do
    assigns = assign(assigns, :variant_class, button_variant(assigns))

    ~H"""
    <button
      type={@type}
      class={
        classes([
          @variant_class,
          @class
        ])
      }
      {@rest}
    >
      {render_slot(@inner_block)}
    </button>
    """
  end
end
