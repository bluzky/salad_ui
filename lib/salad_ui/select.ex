defmodule SaladUI.Select do
  @moduledoc false
  use SaladUI, :component

  @doc """
  Displays a select input.

  ## Examples

      <.select prompt="Select your color" options={["Red", "Green", "White", "Yellow"]} multiple=true />
  """
  attr(:id, :any, default: nil)
  attr(:name, :any, default: nil)
  attr(:value, :any, default: nil)
  attr(:class, :string, default: nil)
  attr(:rest, :global)
  attr :prompt, :string, default: nil, doc: "the prompt for select inputs"
  attr :options, :list, doc: "the options to pass to Phoenix.HTML.Form.options_for_select/2"
  attr :multiple, :boolean, default: false, doc: "the multiple flag for select inputs"

  def select(assigns) do
    assigns = prepare_assign(assigns)
    rest = Map.merge(assigns.rest, Map.take(assigns, [:id, :name, :value, :type]))
    assigns = assign(assigns, :rest, rest)

    ~H"""
    <select
      id={@id}
      name={@name}
      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      multiple={@multiple}
      {@rest}
    >
      <option :if={@prompt} value=""><%= @prompt %></option>
      <%= Phoenix.HTML.Form.options_for_select(@options, @value) %>
    </select>
    """
  end
end
