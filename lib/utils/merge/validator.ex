defmodule SaladUI.Merge.Validator do
  @moduledoc false
  @arbitrary_value_regex ~r/^\[(?:([a-z-]+):)?(.+)\]$/i
  @fraction_regex ~r/^\d+\/\d+$/
  @tshirt_size_regex ~r/^(xs|sm|md|lg|(\d+(\.\d+)?)?xl)$/
  @image_regex ~r/^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/
  @color_function_regex ~r/^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/
  @shadow_regex ~r/^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/
  @length_unit_regex ~r/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/

  def arbitrary_value?(value) do
    Regex.match?(@arbitrary_value_regex, value)
  end

  def integer?(value) do
    case Integer.parse(value) do
      {_integer, ""} -> true
      _else -> false
    end
  end

  def number?(value) do
    # Tailwind allows settings float values without leading zeroes, such as `.01`, which `Float.parse/1` does not support.
    value =
      if Regex.match?(~r/^\.\d+$/, value) do
        "0" <> value
      else
        value
      end

    case Float.parse(value) do
      {_float, ""} -> true
      _else -> false
    end
  end

  def length?(value) do
    number?(value) or value in ~w(px full screen) or Regex.match?(@fraction_regex, value)
  end

  def percent?(value) do
    String.ends_with?(value, "%") and number?(String.slice(value, 0..-2//1))
  end

  def tshirt_size?(value) do
    Regex.match?(@tshirt_size_regex, value)
  end

  def arbitrary_length?(value) do
    arbitrary_value?(value, "length", &length_only?/1)
  end

  def arbitrary_number?(value) do
    arbitrary_value?(value, "number", &number?/1)
  end

  def arbitrary_size?(value) do
    arbitrary_value?(value, ~w(length size percentage), &never?/1)
  end

  def arbitrary_position?(value) do
    arbitrary_value?(value, "position", &never?/1)
  end

  def arbitrary_image?(value) do
    arbitrary_value?(value, ~w(image url), &image?/1)
  end

  def image?(value), do: Regex.match?(@image_regex, value)

  def length_only?(value), do: Regex.match?(@length_unit_regex, value) and not Regex.match?(@color_function_regex, value)

  def arbitrary_shadow?(value) do
    arbitrary_value?(value, "", &shadow?/1)
  end

  def any?, do: true

  def any?(_value), do: true

  def never?(_value), do: false

  def shadow?(value), do: Regex.match?(@shadow_regex, value)

  def arbitrary_value?(value, label, test_value) do
    case Regex.run(@arbitrary_value_regex, value) do
      [_, label_part, actual_value] ->
        if is_binary(label_part) and label_part != "" do
          case label do
            ^label_part -> true
            list when is_list(list) -> label_part in list
            _ -> false
          end
        else
          test_value.(actual_value)
        end

      _ ->
        false
    end
  end
end
