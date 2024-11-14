defmodule SaladUI.Merge.Parser do
  @moduledoc false
  import NimbleParsec

  @chars [?a..?z, ?A..?Z, ?0..?9, ?-, ?_, ?., ?,, ?@, ?{, ?}, ?(, ?), ?>, ?*, ?&, ?', ?%, ?#]

  regular_chars = ascii_string(@chars, min: 1)

  modifier =
    [parsec(:arbitrary), regular_chars]
    |> choice()
    |> times(min: 1)
    |> ignore(string(":"))
    |> reduce({Enum, :join, [""]})
    |> unwrap_and_tag(:modifier)
    |> times(min: 1)

  important = "!" |> string() |> unwrap_and_tag(:important)

  base =
    [parsec(:arbitrary), regular_chars]
    |> choice()
    |> times(min: 1)
    |> reduce({Enum, :join, [""]})
    |> unwrap_and_tag(:base)

  postfix =
    "/"
    |> string()
    |> ignore()
    |> ascii_string([?a..?z, ?0..?9], min: 1)
    |> unwrap_and_tag(:postfix)

  defparsec :arbitrary,
            "["
            |> string()
            |> concat(times(choice([parsec(:arbitrary), ascii_string(@chars ++ [?:, ?/], min: 1)]), min: 1))
            |> concat(string("]"))

  defparsec :class,
            modifier
            |> optional()
            |> concat(optional(important))
            |> concat(base)
            |> concat(optional(postfix))
end
