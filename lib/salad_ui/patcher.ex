defmodule SaladUI.Patcher do
  @moduledoc """
  Provides functionality to patch various configuration and source files in Phoenix projects.

  This module is intended to be used by the CLI during the installation of `SaladUI` in a project.
  It handles patching of config files, Tailwind CSS configuration, CSS files, and JavaScript files.
  """

  alias SaladUI.Patcher.ConfigPatcher
  alias SaladUI.Patcher.CSSPatcher
  alias SaladUI.Patcher.JSPatcher
  alias SaladUI.Patcher.TailwindPatcher

  @doc """
  Patches the Elixir project configuration file.

  Adds new configuration to the existing config file without modifying or removing previous content.

  ## Parameters

  - config_path: The path to the project's `config.exs` file
  - components_path: The path to the components directory
  """
  def patch_config(config_path, components_path) do
    ConfigPatcher.patch(config_path, components_path)
  end

  @doc """
  Patches the Tailwind CSS configuration in a Phoenix project.

  Adds required plugins to the Tailwind configuration and extends the theme configuration to use a JSON file that enables theming via CSS variables, without modifying existing user configuration.

  ## Parameters

  - tailwind_config_path: Path to the Tailwind configuration file
  """
  def patch_tailwind_config(tailwind_config_path) do
    TailwindPatcher.patch(tailwind_config_path)
  end

  @doc """
  Patches a CSS file by adding all variables needed for a color scheme.
  Also adds optional tweaks to the CSS file.

  ## Parameters

  - css_file_path: Path to the CSS file
  - color_scheme_file_path: Path to the file containing the color scheme CSS code
  """
  def patch_css_file(css_file_path, color_scheme_file_path) do
    CSSPatcher.patch(css_file_path, color_scheme_file_path)
  end

  @doc """
  Patches a JavaScript file by adding JS code snippet to handle events from the server.

  ## Parameters

  - js_file_path: Path to the JavaScript file
  - code_to_add_file_path: Path to the file containing the JS code to be added
  """
  def patch_js_file(js_file_path, code_to_add_file_path) do
    JSPatcher.patch(js_file_path, code_to_add_file_path)
  end
end
