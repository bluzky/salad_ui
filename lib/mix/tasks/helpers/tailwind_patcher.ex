defmodule SaladUI.Patcher.TailwindPatcher do
  @moduledoc false

  @theme_block """
  @theme {
    --color-accent: hsl(var(--accent));
    --color-accent-foreground: hsl(var(--accent-foreground));
    --color-background: hsl(var(--background));
    --color-border: hsl(var(--border));
    --color-card: hsl(var(--card));
    --color-card-foreground: hsl(var(--card-foreground));
    --color-destructive: hsl(var(--destructive));
    --color-destructive-foreground: hsl(var(--destructive-foreground));
    --color-foreground: hsl(var(--foreground));
    --color-input: hsl(var(--input));
    --color-muted: hsl(var(--muted));
    --color-muted-foreground: hsl(var(--muted-foreground));
    --color-popover: hsl(var(--popover));
    --color-popover-foreground: hsl(var(--popover-foreground));
    --color-primary: hsl(var(--primary));
    --color-primary-foreground: hsl(var(--primary-foreground));
    --color-ring: hsl(var(--ring));
    --color-secondary: hsl(var(--secondary));
    --color-secondary-foreground: hsl(var(--secondary-foreground));
    --color-sidebar: hsl(var(--sidebar-background));
    --color-sidebar-foreground: hsl(var(--sidebar-foreground));
    --color-sidebar-primary: hsl(var(--sidebar-primary));
    --color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
    --color-sidebar-accent: hsl(var(--sidebar-accent));
    --color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
    --color-sidebar-border: hsl(var(--sidebar-border));
    --color-sidebar-ring: hsl(var(--sidebar-ring));
  }
  """

  @directives [
    ~s(@source "../js";),
    ~s(@source "../../lib";),
    ~s(@source "../../deps/salad_ui/lib";),
    ~s(@plugin "@tailwindcss/typography";),
    ~s(@plugin "../vendor/tailwindcss-animate";)
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
