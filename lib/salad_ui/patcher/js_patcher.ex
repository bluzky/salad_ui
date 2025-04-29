defmodule SaladUI.Patcher.JSPatcher do
  @moduledoc false
  @doc """
  Patches JavaScript content by:
  1. Appending content after the last import statement
  2. Adding new hooks to the hooks object, or creating a hooks object if it doesn't exist

  ## Parameters
    - js_content: The JavaScript content as a string
    - content_import: The content to append after the last import
    - hooks: hook content to add (e.g. "newHook: MyHookHandler")

  ## Returns
    The modified JavaScript content
  """
  def patch_js(js_content, content_import, hooks) do
    # First, append content after the last import
    js_content
    |> append_after_last_import(content_import)
    |> add_hook(hooks)
  end

  @doc """
  Appends content after the last import statement in JavaScript content.

  ## Parameters
    - js_content: The JavaScript content as a string
    - content_to_append: The content to append after the last import

  ## Returns
    The modified JavaScript content with the content appended after the last import
  """
  def append_after_last_import(js_content, content_to_append) do
    # Find all import statements - handle both semicolon and non-semicolon imports
    import_regex = ~r/(import\s+.*?(?:;|\n|$))/
    imports = Regex.scan(import_regex, js_content)

    case imports do
      [] ->
        # No imports found, return original content
        js_content

      _ ->
        # Get the last import statement
        last_import = imports |> List.last() |> List.first()

        # Split the string at the last import and reconstruct with appended content
        [before_last_import, after_last_import] = String.split(js_content, last_import, parts: 2)
        before_last_import <> last_import <> content_to_append <> after_last_import
    end
  end

  @doc """
  Adds new hooks to the hooks object in JavaScript content.
  If the hooks object doesn't exist, it creates one.

  ## Parameters
    - js_content: The JavaScript content as a string
    - hooks: hook content (e.g. "newHook: MyHookHandler")

  ## Returns
    The modified JavaScript content with the new hooks added
  """
  def add_hook(js_content, hooks) do
    # First, extract the entire LiveSocket block
    liveSocket_regex =
      ~r/(let\s+liveSocket\s*=\s*new\s+LiveSocket\s*\(\s*"[^"]*"\s*,\s*Socket\s*,\s*\{)([\s\S]*?)(\}\s*\))/

    case Regex.run(liveSocket_regex, js_content) do
      nil ->
        # LiveSocket initialization not found
        js_content

      [whole_match, before_params, params, after_params] ->
        # Check if hooks already exist in the params
        has_hooks = String.match?(params, ~r/hooks\s*:/)

        if has_hooks do
          # Case 1: Hooks already exist, add to them
          update_existing_hooks(js_content, whole_match, params, hooks)
        else
          # Case 2: No hooks exist, create new hooks object
          create_new_hooks(js_content, whole_match, before_params, params, after_params, hooks)
        end
    end
  end

  # Updates existing hooks in the LiveSocket block
  defp update_existing_hooks(js_content, whole_match, params, new_hooks) do
    # Extract the existing hooks block
    hooks_regex = ~r/hooks\s*:\s*\{([\s\S]*?)\}/

    case Regex.run(hooks_regex, params) do
      nil ->
        # This shouldn't happen if we already detected hooks, but just in case
        js_content

      [hooks_block, hooks_content] ->
        # Check if any of the new hooks already exist
        hook_names =
          new_hooks
          |> String.split(",")
          |> Enum.map(fn hook ->
            hook |> String.trim() |> String.split(":") |> List.first() |> String.trim()
          end)

        # Filter out hooks that already exist
        existing_hooks =
          for hook_name <- hook_names,
              Regex.match?(~r/#{hook_name}\s*:/, hooks_content),
              do: hook_name

        if length(existing_hooks) == length(hook_names) do
          # All hooks already exist, don't modify
          js_content
        else
          # Add the new hooks to the existing hooks
          new_hooks_content =
            if String.trim(hooks_content) == "" do
              new_hooks
            else
              "#{hooks_content},\n    #{new_hooks}"
            end

          # Create the new hooks block
          new_hooks_block = "hooks: {#{new_hooks_content}}"

          # Replace the old hooks block with the new one in the params
          updated_params = String.replace(params, hooks_block, new_hooks_block)

          # Replace the entire LiveSocket block
          updated_match = String.replace(whole_match, params, updated_params)

          # Update the JS content
          String.replace(js_content, whole_match, updated_match, global: false)
        end
    end
  end

  # Creates a new hooks object when none exists
  defp create_new_hooks(js_content, whole_match, before_params, params, after_params, hooks) do
    # Add hooks object to the params
    new_params =
      if String.trim(params) == "" do
        "  hooks: { #{hooks} }"
      else
        "#{params},\n  hooks: { #{hooks} }"
      end

    # Replace the LiveSocket initialization with the new one
    String.replace(js_content, whole_match, "#{before_params}#{new_params}#{after_params}", global: false)
  end
end
