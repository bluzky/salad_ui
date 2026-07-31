defmodule SaladUI.Helpers do
  @moduledoc false
  use Phoenix.Component

  import Phoenix.Component

  alias Phoenix.HTML.FormField

  @doc """
  Prepares form-related assigns for use in an input component.

  When a `:field` (a `%Phoenix.HTML.FormField{}`) is given, `:id`, `:name`, `:value`,
  and `:errors` are derived from it, though explicit assigns still take precedence.

  In all cases, falls back to `:"default-value"` when the resulting value is `nil`,
  `""`, or `[]`.
  """
  def prepare_assign(%{field: %FormField{} = field} = assigns) do
    assigns
    |> assign(field: nil, id: assigns[:id] || field.id)
    |> assign(:errors, Enum.map(field.errors, &translate_error(&1)))
    |> assign(:name, assigns[:name] || if(assigns[:multiple], do: field.name <> "[]", else: field.name))
    |> assign(:value, if(is_nil(assigns[:value]), do: field.value, else: assigns[:value]))
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

  @doc """
  Returns the translated error messages for a form field.

  Returns `[]` when given anything other than a `%Phoenix.HTML.FormField{}`.
  """
  def field_errors(%FormField{} = field) do
    Enum.map(field.errors, &translate_error(&1))
  end

  def field_errors(_), do: []

  @doc """
  Returns `true` when the given form field has one or more errors.
  """
  def has_error?(%FormField{} = field) do
    not Enum.empty?(field.errors)
  end

  def has_error?(_field), do: false

  @doc """
  Builds a map of client event mappings from all assigned `on-*` attributes.

  Each `on-*` attribute (e.g. `on-open`, `on-value-changed`) is mapped to its bare
  event name (`"open"`, `"value-changed"`) for JSON-encoding into the
  `data-event-mappings` attribute consumed by the SaladUI JS hook. Attributes whose
  value is `nil` or `false` are skipped.
  """
  def event_mappings(assigns) do
    Enum.reduce(assigns, %{}, fn
      {key, value}, event_map when is_atom(key) and value not in [nil, false] ->
        case Atom.to_string(key) do
          "on-" <> event -> Map.put(event_map, event, value)
          _ -> event_map
        end

      _, event_map ->
        event_map
    end)
  end

  @doc """
  Encodes `data` to JSON using the application's configured `Phoenix.json_library/0`.

  Used to serialize the `data-options` and `data-event-mappings` attributes.
  """
  def json(data) do
    Phoenix.json_library().encode!(data)
  end

  @variants %{
    variant: %{
      "default" => "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
      "destructive" => "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
      "outline" => "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
      "secondary" => "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
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
  Reusable button variant helper. Supports two variant kinds:
  - size: `default|sm|lg|icon`
  - variant: `default|destructive|outline|secondary|ghost|link`
  """
  def button_variant(props \\ %{}) do
    variants = Map.take(props, ~w(variant size)a)
    variants = Map.merge(@default_variants, variants)

    variation_classes = Enum.map_join(variants, " ", fn {key, value} -> @variants[key][value] end)

    shared_classes =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:ring-ring focus-visible:outline-hidden focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"

    "#{shared_classes} #{variation_classes}"
  end

  @doc """
  Builds a CSS class string from a variant config and the selected variant values,
  falling back to `default_variants` for any key not present in `class_input`.

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
  Builds a CSS `style` attribute string from a list of style maps and/or raw
  declaration strings. Map entries are merged together (later maps win on
  conflicting keys) and rendered before raw strings, which keep their given order.

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
  def style(items) when is_list(items) do
    {acc_map, acc_list} =
      Enum.reduce(items, {%{}, []}, fn item, {acc_map, acc_list} ->
        if is_map(item) do
          {Map.merge(acc_map, item), acc_list}
        else
          {acc_map, [item | acc_list]}
        end
      end)

    map_declarations = Enum.map(acc_map, fn {k, v} -> "#{k}: #{v}" end)
    declarations = map_declarations ++ Enum.reverse(acc_list)

    case declarations do
      [] -> ""
      _ -> Enum.join(declarations, "; ") <> ";"
    end
  end

  @doc """
  Renders a dynamic tag based on the `tag` attribute, which can be a string or a
  function component.

  Wraps Phoenix LiveView's `dynamic_tag/1`, which only supports string tags.

  ## Examples

  ```heex
  <.dynamic tag={@tag} class="bg-primary text-primary-foreground">
     Hello World
  </.dynamic>
  ```
  """
  def dynamic(%{tag: name} = assigns) when is_function(name, 1) do
    assigns = Map.delete(assigns, :tag)
    name.(assigns)
  end

  def dynamic(assigns) do
    name = assigns[:tag] || "div"

    assigns =
      assigns
      |> Map.delete(:tag)
      |> assign(:tag_name, name)
      |> assign(:name, name)

    dynamic_tag(assigns)
  end

  @doc """
  Mimics the behavior of shadcn/ui's `asChild` attribute.

  Passes all attributes given to `as_child` through to the `tag` function
  component, and passes `child` as that component's `as` attribute.

  The `tag` function component must accept an `:as` attribute to render the
  child component in its place.

  ## Examples

  ```heex
  <.as_child tag={&dropdown_menu_trigger/1} child={&sidebar_menu_button/1} class="bg-primary text-primary-foreground">
     Hello World
  </.as_child>
  ```

  This is equivalent to using `dropdown_menu_trigger` directly, but calling it
  directly would trigger a compiler warning for the unrecognized `:as` attribute:

  ```heex
  <.dropdown_menu_trigger as={&sidebar_menu_button/1} class="bg-primary text-primary-foreground">
     Hello World
  </.dropdown_menu_trigger>
  ```
  """
  def as_child(%{tag: tag, child: child_tag} = assigns) when is_function(tag, 1) do
    assigns
    |> Map.drop([:tag, :child])
    |> assign(:as, child_tag)
    |> tag.()
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
