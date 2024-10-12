defmodule SaladUI.Patcher.JSPatcher do
  @moduledoc false
  def patch(js_file_path, code_to_add_file_path) do
    code_to_add = File.read!(code_to_add_file_path)

    new_content =
      js_file_path
      |> File.read!()
      |> update_content(code_to_add)

    File.write!(js_file_path, new_content)
  end

  defp update_content(content, code_to_add) do
    if String.contains?(content, code_to_add) do
      content
    else
      content <> "\n" <> "// Allows to execute JS commands from the server\n" <> code_to_add
    end
  end
end
