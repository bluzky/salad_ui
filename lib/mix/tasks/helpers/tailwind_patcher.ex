defmodule SaladUI.Patcher.TailwindPatcher do
  @moduledoc false

  @theme_block """
  @theme inline {
    --radius-sm: calc(var(--radius) * 0.6);
    --radius-md: calc(var(--radius) * 0.8);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) * 1.4);
    --color-accent: var(--accent);
    --color-accent-foreground: var(--accent-foreground);
    --color-background: var(--background);
    --color-border: var(--border);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-destructive: var(--destructive);
    --color-destructive-foreground: var(--destructive-foreground);
    --color-foreground: var(--foreground);
    --color-input: var(--input);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-ring: var(--ring);
    --color-secondary: var(--secondary);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-sidebar: var(--sidebar-background);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-ring: var(--sidebar-ring);
  }
  """

  # `assets/salad_ui` is scanned separately from `lib` because the toast
  # component builds its card/viewport classes at runtime in JS (its DOM is
  # entirely client-constructed) rather than embedding them in HEEx like
  # every other component — without this source, Tailwind never sees those
  # class strings and the toast ships with no styling or transitions.
  @directives [
    ~s(@source "../js";),
    ~s(@source "../../lib";),
    ~s(@source "../../deps/salad_ui/lib";),
    ~s(@source "../../deps/salad_ui/assets/salad_ui";),
    ~s(@plugin "@tailwindcss/typography";),
    ~s(@import "../vendor/tw-animate.css";)
  ]

  def patch(css_path, opts \\ []) do
    new_content =
      css_path
      |> File.read!()
      |> update_content(opts)

    File.write!(css_path, new_content)
  end

  defp update_content(content, _opts) do
    content
    |> replace_v3_imports()
    |> ensure_tailwind_import()
    |> ensure_theme()
    |> ensure_directives()
  end

  defp replace_v3_imports(content) do
    Regex.replace(
      ~r/@import\s+["']tailwindcss\/(base|components|utilities)["'];\n?/,
      content,
      ""
    )
  end

  defp ensure_tailwind_import(content) do
    if String.contains?(content, ~s(@import "tailwindcss";)) do
      content
    else
      ~s(@import "tailwindcss";) <> "\n" <> content
    end
  end

  defp ensure_theme(content) do
    if String.contains?(content, "--color-background:") do
      content
    else
      append_block(content, @theme_block)
    end
  end

  defp ensure_directives(content) do
    Enum.reduce(@directives, content, fn directive, acc ->
      if String.contains?(acc, directive), do: acc, else: append_block(acc, directive)
    end)
  end

  defp append_block(content, block) do
    content = String.trim_trailing(content)
    block = String.trim(block)

    content <> "\n\n" <> block <> "\n"
  end
end
