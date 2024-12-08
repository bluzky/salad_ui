defmodule SaladUI.Patcher.ElixirPatcher do
  @moduledoc false

  def patch_application_supervisor(application_file_path, new_children, description \\ nil) do
    new_content =
      application_file_path
      |> File.read!()
      |> update_content(new_children, description)

    case new_content do
      {:ok, new_content} -> File.write!(application_file_path, new_content)
      {:error, _} = error -> error
    end
  end

  defp update_content(content, new_children, description) do
    cond do
      # If the new children already exists, do nothing
      Regex.match?(~r/\[([^\]]*#{Regex.escape(new_children)}[^\]]*)\]/m, content) ->
        {:ok, content}

      # Try to find and modify an existing children variable
      Regex.match?(~r/children\s*=\s*\[/m, content) ->
        {:ok,
         Regex.replace(
           ~r/(children\s*=\s*\[)([^\]]*)/m,
           content,
           fn _, opening, existing_elements ->
             existing_elements =
               if single_element_list?(existing_elements),
                 do: "",
                 else: ", #{existing_elements}"

             if single_line_list?(existing_elements) do
               "#{opening}#{new_children}#{existing_elements}"
             else
               indentation =
                 extract_indentation(existing_elements) || "  "

               to_add = build_addition(new_children, description, indentation)
               "#{opening}\n#{to_add}#{existing_elements}"
             end
           end
         )}

      # If no children list found, look for Supervisor.start_link call
      Regex.match?(~r/Supervisor\.start_link\(\s*\[/m, content) ->
        {:ok,
         Regex.replace(
           ~r/(Supervisor\.start_link\(\s*\[)([^\]]*)/m,
           content,
           fn _, opening, existing_elements ->
             existing_elements =
               if single_element_list?(existing_elements),
                 do: "",
                 else: ", #{existing_elements}"

             if single_line_list?(existing_elements) do
               "#{opening}#{new_children}#{existing_elements}"
             else
               indentation = extract_indentation(existing_elements) || "  "

               to_add = build_addition(new_children, description, indentation)
               "#{opening}\n#{to_add}#{existing_elements}"
             end
           end
         )}

      # Otherwise, return an error
      true ->
        {:error,
         "Could not find a location to add the child to the supervisor. Please add TwMerge.Cache to your supervisor."}
    end
  end

  defp single_line_list?(list_content) do
    not String.contains?(list_content, "\n")
  end

  defp single_element_list?(list_content) do
    list_content == ""
  end

  defp extract_indentation(list_content) do
    list_content
    |> String.split("\n")
    |> Enum.find_value(fn line ->
      if String.match?(line, ~r/^\s*\S/), do: ~r/^\s*/ |> Regex.run(line) |> List.first()
    end)
  end

  defp build_addition(new_children, description, element_indentation) do
    addition =
      if description, do: "# #{description}\n#{new_children}", else: new_children

    addition |> String.split("\n") |> Enum.map_join("\n", &"#{element_indentation}#{&1}")
  end
end
