defmodule SaladUI.Patcher.CSSPatcher do
  @moduledoc false

  # When used in body, ensures dark and light mode work correctly
  @body_tweak "@apply bg-background text-foreground;"

  def patch(css_file_path, color_scheme_file_path) do
    color_scheme_code = File.read!(color_scheme_file_path)

    new_content =
      css_file_path
      |> File.read!()
      |> update_content(color_scheme_code)

    File.write!(css_file_path, new_content)
  end

  defp update_content(content, color_scheme_code) do
    content
    |> add_color_scheme(color_scheme_code)
    |> add_css_tweaks()
  end

  defp add_color_scheme(content, color_scheme_code) do
    new_base_layer = """
    @layer base {
      #{color_scheme_code}
      * {
        @apply border-border !important;
      }
    }\n
    """

    content <> "\n\n" <> new_base_layer
  end

  defp add_css_tweaks(content) do
    to_insert = """
    body { #{@body_tweak} }
    """

    # Add the tweaks at the bottom of the file
    content <> to_insert
  end
end
