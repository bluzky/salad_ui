defmodule SaladUI.Helpers do
  @moduledoc false
  use Phoenix.Component

  import Phoenix.Component

  @doc """
  Prepare input assigns for use in a form. Extract required attribute from the Form.Field struct and update current assigns.
  """
  def prepare_assign(%{field: %Phoenix.HTML.FormField{} = field} = assigns) do
    assigns
    |> assign(field: nil, id: assigns[:id] || field.id)
    |> assign(:errors, Enum.map(field.errors, &translate_error(&1)))
    |> assign(:name, assigns[:name] || if(assigns[:multiple], do: field.name <> "[]", else: field.name))
    |> assign(:value, assigns[:value] || field.value)
    |> prepare_assign()
  end

  # use default value if value is not provided or empty
  def prepare_assign(assigns) do
    value =
      if assigns[:value] in [nil, "", []] do
        assigns[:"default-value"]
      else
        assigns[:value]
      end

    assign(assigns, value: value)
  end

  # normalize_integer
  def normalize_integer(value) when is_integer(value), do: value

  def normalize_integer(value) when is_binary(value) do
    case Integer.parse(value) do
      {integer, _} -> integer
      _ -> nil
    end
  end

  def normalize_integer(_), do: nil

  def normalize_boolean(value) do
    case value do
      "true" -> true
      "false" -> false
      true -> true
      false -> false
      _ -> false
    end
  end

  @doc """
  Normalize id to be used in HTML id attribute
  It will replace all non-alphanumeric characters with `-` and downcase the string
  """
  def id(id) do
    id
    |> String.replace(~r/[^a-zA-Z0-9]/, "-")
    |> String.downcase()
  end

  @doc """
  Variant helper for generating classes based on side and align
  """
  @variants %{
    side: %{
      "top" => "bottom-full mb-2",
      "bottom" => "top-full mt-2",
      "left" => "right-full mr-2",
      "right" => "left-full ml-2"
    },
    align: %{
      "start-horizontal" => "left-0",
      "center-horizontal" => "left-1/2 -translate-x-1/2 slide-in-from-left-1/2",
      "end-horizontal" => "right-0",
      "start-vertical" => "top-0",
      "center-vertical" => "top-1/2 -translate-y-1/2 slide-in-from-top-1/2",
      "end-vertical" => "bottom-0"
    }
  }

  @spec side_variant(String.t(), String.t()) :: String.t()
  def side_variant(side, align \\ "center") do
    Enum.map_join(%{side: side, align: align(align, side)}, " ", fn {key, value} -> @variants[key][value] end)
  end

  # decide align class based on side
  defp align(align, side) do
    cond do
      side in ["top", "bottom"] ->
        "#{align}-horizontal"

      side in ["left", "right"] ->
        "#{align}-vertical"
    end
  end

  @variants %{
    variant: %{
      "default" => "bg-primary text-primary-foreground shadow hover:bg-primary/90",
      "destructive" => "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      "outline" => "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
      "secondary" => "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
      "ghost" => "hover:bg-accent hover:text-accent-foreground",
      "link" => "text-primary underline-offset-4 hover:underline"
    },
    size: %{
      "default" => "h-9 px-4 py-2",
      "sm" => "h-8 rounded-md px-3 text-xs",
      "lg" => "h-10 rounded-md px-8",
      "icon" => "h-9 w-9"
    }
  }

  @default_variants %{
    variant: "default",
    size: "default"
  }

  @doc """
  Reuseable button variant helper. Support 2 variant
  - size: `default|sm|lg|icon`
  - variant: `default|destructive|outline|secondary|ghost|link`
  """
  def button_variant(props \\ %{}) do
    variants = Map.take(props, ~w(variant size)a)
    variants = Map.merge(@default_variants, variants)

    variation_classes = Enum.map_join(variants, " ", fn {key, value} -> @variants[key][value] end)

    shared_classes =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"

    "#{shared_classes} #{variation_classes}"
  end

  @doc """
  Common function for building variant

  ## Examples

  ```elixir
  config =
  %{
    variants: %{
      variant: %{
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: %{
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    default_variants: %{
      variant: "default",
      size: "default",
    },
  }

  class_input = %{variant: "outline", size: "lg"}
  variant_class(config, class_input)
  ```

  """
  def variant_class(config, class_input) do
    variants = Map.get(config, :variants, %{})
    default_variants = Map.get(config, :default_variants, %{})

    variants
    |> Map.keys()
    |> Enum.map(fn variant_key ->
      # Get the variant value from input or use default
      variant_value =
        Map.get(class_input, variant_key) ||
          Map.get(default_variants, variant_key)

      # Get the variant options map
      variant_options = Map.get(variants, variant_key, %{})

      # Get the CSS classes for this variant value
      Map.get(variant_options, String.to_existing_atom(variant_value))
    end)
    |> Enum.reject(&is_nil/1)
    |> Enum.join(" ")
  end

  @doc """
  This function build css style string from map of css style

  ## Examples

  ```elixir
  css_style = %{
    "background-color": "red",
    "color": "white",
    "font-size": "16px",
  }

  style(css_style)

  # => "background-color: red; color: white; font-size: 16px;"
  ```
  """
  def style(css_map) do
    Enum.map_join(css_map, "; ", fn {k, v} -> "#{k}: #{v}" end) <> ";"
  end

  @doc """
  This function build js script to invoke JS stored in given attribute.
  Similar to JS.exec/2 but this function target the nearest ancestor element.

  ## Examples

  ```heex
  <button click={exec_closest("phx-hide-sheet", ".ancestor_class")}>
    Close
  </button>
  ```
  """
  def exec_closest(attribute, ancestor_selector) do
    """
    var el = this.closest("#{ancestor_selector}"); liveSocket.execJS(el, el.getAttribute("#{attribute}"));
    """
  end

  @doc """
  Generates a dynamically named HTML tag.

  Raises an `ArgumentError` if the tag name is found to be unsafe HTML.

  [INSERT LVATTRDOCS]

  ## Examples

  ```heex
  <.dynamic_tag name="input" type="text"/>
  ```

  ```html
  <input type="text"/>
  ```

  ```heex
  <.dynamic_tag name="p">content</.dynamic_tag>
  ```

  ```html
  <p>content</p>
  ```
  """
  def dynamic(%{as: name} = assigns) when is_function(name, 1) do
    assigns = Map.delete(assigns, :as)
    name.(assigns)
  end

  def dynamic(assigns) do
    name = assigns[:as] || assigns[:tag] || "div"

    assigns =
      assigns
      |> Map.delete(:as)
      |> Map.delete(:tag)
      |> assign(:name, name)

    dynamic_tag(assigns)
  end

  # Translate error message
  # borrowed from https://github.com/petalframework/petal_components/blob/main/lib/petal_components/field.ex#L414
  defp translate_error({msg, opts}) do
    config_translator = get_translator_from_config() || (&fallback_translate_error/1)

    config_translator.({msg, opts})
  end

  defp fallback_translate_error({msg, opts}) do
    Enum.reduce(opts, msg, fn {key, value}, acc ->
      try do
        String.replace(acc, "%{#{key}}", to_string(value))
      rescue
        e ->
          IO.warn(
            """
            the fallback message translator for the form_field_error function cannot handle the given value.

            Hint: you can set up the `error_translator_function` to route all errors to your application helpers:

              config :salad_ui, :error_translator_function, {MyAppWeb.CoreComponents, :translate_error}

            Given value: #{inspect(value)}

            Exception: #{Exception.message(e)}
            """,
            __STACKTRACE__
          )

          "invalid value"
      end
    end)
  end

  defp get_translator_from_config do
    case Application.get_env(:salad_ui, :error_translator_function) do
      {module, function} -> &apply(module, function, [&1])
      nil -> nil
    end
  end
end
