defmodule SaladUI.Merge.Config do
  @moduledoc false
  import SaladUI.Merge.Validator

  @theme_groups ~w(colors spacing blur brightness borderColor borderRadius borderSpacing borderWidth contrast grayscale hueRotate invert gap gradientColorStops gradientColorStopPositions inset margin opacity padding saturate scale sepia skew space translate)

  def config do
    prefix = Application.get_env(:turboprop, :prefix)
    theme = Application.get_env(:turboprop, :theme, default_theme())

    Map.merge(%{prefix: prefix, theme: theme}, settings())
  end

  defp default_theme do
    %{
      colors: [&any?/1],
      spacing: [&length?/1, &arbitrary_length?/1],
      blur: ["none", "", &tshirt_size?/1, &arbitrary_value?/1],
      brightness: number(),
      borderColor: [&from_theme(&1, "colors")],
      borderRadius: ["none", "", "full", &tshirt_size?/1, &arbitrary_value?/1],
      borderSpacing: spacing_with_arbitrary(),
      borderWidth: length_with_empty_and_arbitrary(),
      contrast: number(),
      grayscale: zero_and_empty(),
      hueRotate: number_and_arbitrary(),
      invert: zero_and_empty(),
      gap: spacing_with_arbitrary(),
      gradientColorStops: [&from_theme(&1, "colors")],
      gradientColorStopPositions: [&percent?/1, &arbitrary_length?/1],
      inset: spacing_with_auto_and_arbitrary(),
      margin: spacing_with_auto_and_arbitrary(),
      opacity: number(),
      padding: spacing_with_arbitrary(),
      saturate: number(),
      scale: number(),
      sepia: zero_and_empty(),
      skew: number_and_arbitrary(),
      space: spacing_with_arbitrary(),
      translate: spacing_with_arbitrary()
    }
  end

  defp settings do
    %{
      groups: %{
        "aspect" => %{"aspect" => ["auto", "square", "video", &arbitrary_value?/1]},
        "container" => ["container"],
        "columns" => %{"columns" => [&tshirt_size?/1]},
        "break-after" => %{"break-after" => breaks()},
        "break-before" => %{"break-before" => breaks()},
        "break-inside" => %{"break-inside" => ["auto", "avoid", "avoid-page", "avoid-column"]},
        "box-decoration" => %{"box-decoration" => ["slice", "clone"]},
        "box" => %{"box" => ["border", "content"]},
        "display" => [
          "block",
          "inline-block",
          "inline",
          "flex",
          "inline-flex",
          "table",
          "inline-table",
          "table-caption",
          "table-cell",
          "table-column",
          "table-column-group",
          "table-footer-group",
          "table-header-group",
          "table-row-group",
          "table-row",
          "flow-root",
          "grid",
          "inline-grid",
          "contents",
          "list-item",
          "hidden"
        ],
        "float" => %{"float" => ["right", "left", "none", "start", "end"]},
        "clear" => %{"clear" => ["left", "right", "both", "none", "start", "end"]},
        "isolation" => ["isolate", "isolation-auto"],
        "object-fit" => %{"object" => ["contain", "cover", "fill", "none", "scale-down"]},
        "object-position" => %{"object" => [positions(), &arbitrary_value?/1]},
        "overflow" => %{"overflow" => overflow()},
        "overflow-x" => %{"overflow-x" => overflow()},
        "overflow-y" => %{"overflow-y" => overflow()},
        "overscroll" => %{"overscroll" => overscroll()},
        "overscroll-x" => %{"overscroll-x" => overscroll()},
        "overscroll-y" => %{"overscroll-y" => overscroll()},
        "position" => ["static", "fixed", "absolute", "relative", "sticky"],
        "inset" => %{"inset" => [&from_theme(&1, "inset")]},
        "inset-x" => %{"inset-x" => [&from_theme(&1, "inset")]},
        "inset-y" => %{"inset-y" => [&from_theme(&1, "inset")]},
        "start" => %{"start" => [&from_theme(&1, "inset")]},
        "end" => %{"end" => [&from_theme(&1, "inset")]},
        "top" => %{"top" => [&from_theme(&1, "inset")]},
        "right" => %{"right" => [&from_theme(&1, "inset")]},
        "bottom" => %{"bottom" => [&from_theme(&1, "inset")]},
        "left" => %{"left" => [&from_theme(&1, "inset")]},
        "visibility" => ["visible", "invisible", "collapse"],
        "z" => %{"z" => ["auto", &integer?/1, &arbitrary_value?/1]},
        "basis" => %{"basis" => spacing_with_auto_and_arbitrary()},
        "flex-direction" => %{"flex" => ["row", "row-reverse", "col", "col-reverse"]},
        "flex-wrap" => %{"flex" => ["wrap", "wrap-reverse", "nowrap"]},
        "flex" => %{"flex" => ["1", "auto", "initial", "none", &arbitrary_value?/1]},
        "grow" => %{"grow" => zero_and_empty()},
        "shrink" => %{"shrink" => zero_and_empty()},
        "order" => %{"order" => ["first", "last", "none", &integer?/1, &arbitrary_value?/1]},
        "grid-cols" => %{"grid-cols" => [&any?/1]},
        "col-start-end" => %{"col" => ["auto", %{"span" => ["full", &integer?/1, &arbitrary_value?/1]}, &arbitrary_value?/1]},
        "col-start" => %{"col-start" => number_with_auto_and_arbitrary()},
        "col-end" => %{"col-end" => number_with_auto_and_arbitrary()},
        "grid-rows" => %{"grid-rows" => [&any?/1]},
        "row-start-end" => %{"row" => ["auto", %{"span" => ["full", &integer?/1, &arbitrary_value?/1]}, &arbitrary_value?/1]},
        "row-start" => %{"row-start" => number_with_auto_and_arbitrary()},
        "row-end" => %{"row-end" => number_with_auto_and_arbitrary()},
        "grid-flow" => %{"grid-flow" => ["row", "col", "dense", "row-dense", "col-dense"]},
        "auto-cols" => %{"auto-cols" => ["auto", "min", "max", "fr", &arbitrary_value?/1]},
        "auto-rows" => %{"auto-rows" => ["auto", "min", "max", "fr", &arbitrary_value?/1]},
        "gap" => %{"gap" => [&from_theme(&1, "gap")]},
        "gap-x" => %{"gap-x" => [&from_theme(&1, "gap")]},
        "gap-y" => %{"gap-y" => [&from_theme(&1, "gap")]},
        "justify-content" => %{"justify" => ["normal", align()]},
        "justify-items" => %{"justify-items" => ["start", "end", "center", "stretch"]},
        "justify-self" => %{"justify-self" => ["auto", "start", "end", "center", "stretch"]},
        "align-content" => %{"content" => ["normal", align(), "baseline"]},
        "align-items" => %{"items" => ["start", "end", "center", "baseline", "stretch"]},
        "align-self" => %{"self" => ["auto", "start", "end", "center", "stretch", "baseline"]},
        "place-content" => %{"place-content" => [align(), "baseline"]},
        "place-items" => %{"place-items" => ["start", "end", "center", "baseline", "stretch"]},
        "place-self" => %{"place-self" => ["auto", "start", "end", "center", "stretch"]},
        "p" => %{"p" => [&from_theme(&1, "padding")]},
        "px" => %{"px" => [&from_theme(&1, "padding")]},
        "py" => %{"py" => [&from_theme(&1, "padding")]},
        "ps" => %{"ps" => [&from_theme(&1, "padding")]},
        "pe" => %{"pe" => [&from_theme(&1, "padding")]},
        "pt" => %{"pt" => [&from_theme(&1, "padding")]},
        "pr" => %{"pr" => [&from_theme(&1, "padding")]},
        "pb" => %{"pb" => [&from_theme(&1, "padding")]},
        "pl" => %{"pl" => [&from_theme(&1, "padding")]},
        "m" => %{"m" => [&from_theme(&1, "margin")]},
        "mx" => %{"mx" => [&from_theme(&1, "margin")]},
        "my" => %{"my" => [&from_theme(&1, "margin")]},
        "ms" => %{"ms" => [&from_theme(&1, "margin")]},
        "me" => %{"me" => [&from_theme(&1, "margin")]},
        "mt" => %{"mt" => [&from_theme(&1, "margin")]},
        "mr" => %{"mr" => [&from_theme(&1, "margin")]},
        "mb" => %{"mb" => [&from_theme(&1, "margin")]},
        "ml" => %{"ml" => [&from_theme(&1, "margin")]},
        "space-x" => %{"space-x" => [&from_theme(&1, "space")]},
        "space-x-reverse" => ["space-x-reverse"],
        "space-y" => %{"space-y" => [&from_theme(&1, "space")]},
        "space-y-reverse" => ["space-y-reverse"],
        "w" => %{"w" => ["auto", "min", "max", "fit", "svw", "lvw", "dvw", &from_theme(&1, "spacing"), &arbitrary_value?/1]},
        "min-w" => %{"min-w" => ["min", "max", "fit", &from_theme(&1, "spacing"), &arbitrary_value?/1]},
        "max-w" => %{
          "max-w" => [
            "none",
            "full",
            "min",
            "max",
            "fit",
            "prose",
            &tshirt_size?/1,
            &arbitrary_value?/1,
            &from_theme(&1, "spacing"),
            %{"screen" => [&tshirt_size?/1]}
          ]
        },
        "h" => %{
          "h" => [
            "auto",
            "min",
            "max",
            "fit",
            "svh",
            "lvh",
            "dvh",
            &from_theme(&1, "spacing"),
            &arbitrary_value?/1
          ]
        },
        "min-h" => %{"min-h" => ["min", "max", "fit", "svh", "lvh", "dvh", &from_theme(&1, "spacing"), &arbitrary_value?/1]},
        "max-h" => %{"max-h" => ["min", "max", "fit", "svh", "lvh", "dvh", &from_theme(&1, "spacing"), &arbitrary_value?/1]},
        "size" => %{"size" => ["auto", "min", "max", "fit", &from_theme(&1, "spacing"), &arbitrary_value?/1]},
        "font-size" => %{"text" => ["base", &tshirt_size?/1, &arbitrary_length?/1]},
        "font-smoothing" => ["antialiased", "subpixel-antialiased"],
        "font-style" => ["italic", "not-italic"],
        "font-weight" => %{
          "font" => [
            "thin",
            "extralight",
            "light",
            "normal",
            "medium",
            "semibold",
            "bold",
            "extrabold",
            "black",
            &arbitrary_number?/1
          ]
        },
        "font-family" => %{"font" => [&any?/1]},
        "fvn-normal" => ["normal-nums"],
        "fvn-ordinal" => ["ordinal"],
        "fvn-slashed-zero" => ["slashed-zero"],
        "fvn-figure" => ["lining-nums", "oldstyle-nums"],
        "fvn-spacing" => ["proportional-nums", "tabular-nums"],
        "fvn-fraction" => ["diagonal-fractions", "stacked-fractions"],
        "tracking" => %{
          "tracking" => [
            "tighter",
            "tight",
            "normal",
            "wide",
            "wider",
            "widest",
            &arbitrary_value?/1
          ]
        },
        "line-clamp" => %{"line-clamp" => ["none", &number?/1, &arbitrary_number?/1]},
        "leading" => %{
          "leading" => [
            "none",
            "tight",
            "snug",
            "normal",
            "relaxed",
            "loose",
            &length?/1,
            &arbitrary_value?/1
          ]
        },
        "list-image" => %{"list-image" => ["none", &arbitrary_value?/1]},
        "list-style-type" => %{"list" => ["none", "disc", "decimal", &arbitrary_value?/1]},
        "list-style-position" => %{"list" => ["inside", "outside"]},
        "placeholder-color" => %{"placeholder" => [&from_theme(&1, "colors")]},
        "placeholder-opacity" => %{"placeholder-opacity" => [&from_theme(&1, "opacity")]},
        "text-alignment" => %{"text" => ["left", "center", "right", "justify", "start", "end"]},
        "text-color" => %{"text" => [&from_theme(&1, "colors")]},
        "text-opacity" => %{"text-opacity" => [&from_theme(&1, "opacity")]},
        "text-decoration" => ["underline", "overline", "line-through", "no-underline"],
        "text-decoration-style" => %{"decoration" => [line_styles(), "wavy"]},
        "text-decoration-thickness" => %{"decoration" => ["auto", "from-font", &length?/1, &arbitrary_length?/1]},
        "underline-offset" => %{"underline-offset" => ["auto", &length?/1, &arbitrary_value?/1]},
        "text-decoration-color" => %{"decoration" => [&from_theme(&1, "colors")]},
        "text-transform" => ["uppercase", "lowercase", "capitalize", "normal-case"],
        "text-overflow" => ["truncate", "text-ellipsis", "text-clip"],
        "text-wrap" => %{"text" => ["wrap", "nowrap", "balance", "pretty"]},
        "indent" => %{"indent" => spacing_with_arbitrary()},
        "vertical-align" => %{
          "align" => [
            "baseline",
            "top",
            "middle",
            "bottom",
            "text-top",
            "text-bottom",
            "sub",
            "super",
            &arbitrary_value?/1
          ]
        },
        "whitespace" => %{"whitespace" => ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]},
        "break" => %{"break" => ["normal", "words", "all", "keep"]},
        "hyphens" => %{"hyphens" => ["none", "manual", "auto"]},
        "content" => %{"content" => ["none", &arbitrary_value?/1]},
        "bg-attachment" => %{"bg" => ["fixed", "local", "scroll"]},
        "bg-clip" => %{"bg-clip" => ["border", "padding", "content", "text"]},
        "bg-opacity" => %{"bg-opacity" => [&from_theme(&1, "opacity")]},
        "bg-origin" => %{"bg-origin" => ["border", "padding", "content"]},
        "bg-position" => %{"bg" => [positions(), &arbitrary_position?/1]},
        "bg-repeat" => %{"bg" => ["no-repeat", %{"repeat" => ["", "x", "y", "round", "space"]}]},
        "bg-size" => %{"bg" => ["auto", "cover", "contain", &arbitrary_size?/1]},
        "bg-image" => %{
          "bg" => [
            "none",
            %{"gradient-to" => ["t", "tr", "r", "br", "b", "bl", "l", "tl"]},
            &arbitrary_image?/1
          ]
        },
        "bg-color" => %{"bg" => [&from_theme(&1, "colors")]},
        "gradient-from-pos" => %{"from" => [&from_theme(&1, "gradientColorStopPositions")]},
        "gradient-via-pos" => %{"via" => [&from_theme(&1, "gradientColorStopPositions")]},
        "gradient-to-pos" => %{"to" => [&from_theme(&1, "gradientColorStopPositions")]},
        "gradient-from" => %{"from" => [&from_theme(&1, "gradientColorStops")]},
        "gradient-via" => %{"via" => [&from_theme(&1, "gradientColorStops")]},
        "gradient-to" => %{"to" => [&from_theme(&1, "gradientColorStops")]},
        "rounded" => %{"rounded" => [&from_theme(&1, "borderRadius")]},
        "rounded-s" => %{"rounded-s" => [&from_theme(&1, "borderRadius")]},
        "rounded-e" => %{"rounded-e" => [&from_theme(&1, "borderRadius")]},
        "rounded-t" => %{"rounded-t" => [&from_theme(&1, "borderRadius")]},
        "rounded-r" => %{"rounded-r" => [&from_theme(&1, "borderRadius")]},
        "rounded-b" => %{"rounded-b" => [&from_theme(&1, "borderRadius")]},
        "rounded-l" => %{"rounded-l" => [&from_theme(&1, "borderRadius")]},
        "rounded-ss" => %{"rounded-ss" => [&from_theme(&1, "borderRadius")]},
        "rounded-se" => %{"rounded-se" => [&from_theme(&1, "borderRadius")]},
        "rounded-ee" => %{"rounded-ee" => [&from_theme(&1, "borderRadius")]},
        "rounded-es" => %{"rounded-es" => [&from_theme(&1, "borderRadius")]},
        "rounded-tl" => %{"rounded-tl" => [&from_theme(&1, "borderRadius")]},
        "rounded-tr" => %{"rounded-tr" => [&from_theme(&1, "borderRadius")]},
        "rounded-br" => %{"rounded-br" => [&from_theme(&1, "borderRadius")]},
        "rounded-bl" => %{"rounded-bl" => [&from_theme(&1, "borderRadius")]},
        "border-w" => %{"border" => [&from_theme(&1, "borderWidth")]},
        "border-w-x" => %{"border-x" => [&from_theme(&1, "borderWidth")]},
        "border-w-y" => %{"border-y" => [&from_theme(&1, "borderWidth")]},
        "border-w-s" => %{"border-s" => [&from_theme(&1, "borderWidth")]},
        "border-w-e" => %{"border-e" => [&from_theme(&1, "borderWidth")]},
        "border-w-t" => %{"border-t" => [&from_theme(&1, "borderWidth")]},
        "border-w-r" => %{"border-r" => [&from_theme(&1, "borderWidth")]},
        "border-w-b" => %{"border-b" => [&from_theme(&1, "borderWidth")]},
        "border-w-l" => %{"border-l" => [&from_theme(&1, "borderWidth")]},
        "border-opacity" => %{"border-opacity" => [&from_theme(&1, "opacity")]},
        "border-style" => %{"border" => [line_styles(), "hidden"]},
        "divide-x" => %{"divide-x" => [&from_theme(&1, "borderWidth")]},
        "divide-x-reverse" => ["divide-x-reverse"],
        "divide-y" => %{"divide-y" => [&from_theme(&1, "borderWidth")]},
        "divide-y-reverse" => ["divide-y-reverse"],
        "divide-opacity" => %{"divide-opacity" => [&from_theme(&1, "opacity")]},
        "divide-style" => %{"divide" => line_styles()},
        "border-color" => %{"border" => [&from_theme(&1, "borderColor")]},
        "border-color-x" => %{"border-x" => [&from_theme(&1, "borderColor")]},
        "border-color-y" => %{"border-y" => [&from_theme(&1, "borderColor")]},
        "border-color-t" => %{"border-t" => [&from_theme(&1, "borderColor")]},
        "border-color-r" => %{"border-r" => [&from_theme(&1, "borderColor")]},
        "border-color-b" => %{"border-b" => [&from_theme(&1, "borderColor")]},
        "border-color-l" => %{"border-l" => [&from_theme(&1, "borderColor")]},
        "divide-color" => %{"divide" => [&from_theme(&1, "borderColor")]},
        "outline-style" => %{"outline" => ["", line_styles()]},
        "outline-offset" => %{"outline-offset" => [&length?/1, &arbitrary_value?/1]},
        "outline-w" => %{"outline" => [&length?/1, &arbitrary_length?/1]},
        "outline-color" => %{"outline" => [&from_theme(&1, "colors")]},
        "ring-w" => %{"ring" => length_with_empty_and_arbitrary()},
        "ring-w-inset" => ["ring-inset"],
        "ring-color" => %{"ring" => [&from_theme(&1, "colors")]},
        "ring-opacity" => %{"ring-opacity" => [&from_theme(&1, "opacity")]},
        "ring-offset-w" => %{"ring-offset" => [&length?/1, &arbitrary_length?/1]},
        "ring-offset-color" => %{"ring-offset" => [&from_theme(&1, "colors")]},
        "shadow" => %{"shadow" => ["", "inner", "none", &tshirt_size?/1, &arbitrary_shadow?/1]},
        "shadow-color" => %{"shadow" => [&any?/1]},
        "opacity" => %{"opacity" => [&from_theme(&1, "opacity")]},
        "mix-blend" => %{"mix-blend" => [blend_modes(), "plus-lighter", "plus-darker"]},
        "bg-blend" => %{"bg-blend" => blend_modes()},
        "filter" => %{"filter" => ["", "none"]},
        "blur" => %{"blur" => [&from_theme(&1, "blur")]},
        "brightness" => %{"brightness" => [&from_theme(&1, "brightness")]},
        "contrast" => %{"contrast" => [&from_theme(&1, "contrast")]},
        "drop-shadow" => %{"drop-shadow" => ["", "none", &tshirt_size?/1, &arbitrary_value?/1]},
        "grayscale" => %{"grayscale" => [&from_theme(&1, "grayscale")]},
        "hue-rotate" => %{"hue-rotate" => [&from_theme(&1, "hueRotate")]},
        "invert" => %{"invert" => [&from_theme(&1, "invert")]},
        "saturate" => %{"saturate" => [&from_theme(&1, "saturate")]},
        "sepia" => %{"sepia" => [&from_theme(&1, "sepia")]},
        "backdrop-filter" => %{"backdrop-filter" => ["", "none"]},
        "backdrop-blur" => %{"backdrop-blur" => [&from_theme(&1, "blur")]},
        "backdrop-brightness" => %{"backdrop-brightness" => [&from_theme(&1, "brightness")]},
        "backdrop-contrast" => %{"backdrop-contrast" => [&from_theme(&1, "contrast")]},
        "backdrop-grayscale" => %{"backdrop-grayscale" => [&from_theme(&1, "grayscale")]},
        "backdrop-hue-rotate" => %{"backdrop-hue-rotate" => [&from_theme(&1, "hueRotate")]},
        "backdrop-invert" => %{"backdrop-invert" => [&from_theme(&1, "invert")]},
        "backdrop-opacity" => %{"backdrop-opacity" => [&from_theme(&1, "opacity")]},
        "backdrop-saturate" => %{"backdrop-saturate" => [&from_theme(&1, "saturate")]},
        "backdrop-sepia" => %{"backdrop-sepia" => [&from_theme(&1, "sepia")]},
        "border-collapse" => %{"border" => ["collapse", "separate"]},
        "border-spacing" => %{"border-spacing" => [&from_theme(&1, "borderSpacing")]},
        "border-spacing-x" => %{"border-spacing-x" => [&from_theme(&1, "borderSpacing")]},
        "border-spacing-y" => %{"border-spacing-y" => [&from_theme(&1, "borderSpacing")]},
        "table-layout" => %{"table" => ["auto", "fixed"]},
        "caption" => %{"caption" => ["top", "bottom"]},
        "transition" => %{
          "transition" => [
            "none",
            "all",
            "",
            "colors",
            "opacity",
            "shadow",
            "transform",
            &arbitrary_value?/1
          ]
        },
        "duration" => %{"duration" => number_and_arbitrary()},
        "ease" => %{"ease" => ["linear", "in", "out", "in-out", &arbitrary_value?/1]},
        "delay" => %{"delay" => number_and_arbitrary()},
        "animate" => %{"animate" => ["none", "spin", "ping", "pulse", "bounce", &arbitrary_value?/1]},
        "transform" => %{"transform" => ["", "gpu", "none"]},
        "scale" => %{"scale" => [&from_theme(&1, "scale")]},
        "scale-x" => %{"scale-x" => [&from_theme(&1, "scale")]},
        "scale-y" => %{"scale-y" => [&from_theme(&1, "scale")]},
        "rotate" => %{"rotate" => [&integer?/1, &arbitrary_value?/1]},
        "translate-x" => %{"translate-x" => [&from_theme(&1, "translate")]},
        "translate-y" => %{"translate-y" => [&from_theme(&1, "translate")]},
        "skew-x" => %{"skew-x" => [&from_theme(&1, "skew")]},
        "skew-y" => %{"skew-y" => [&from_theme(&1, "skew")]},
        "transform-origin" => %{
          "origin" => [
            "center",
            "top",
            "top-right",
            "right",
            "bottom-right",
            "bottom",
            "bottom-left",
            "left",
            "top-left",
            &arbitrary_value?/1
          ]
        },
        "accent" => %{"accent" => ["auto", &from_theme(&1, "colors")]},
        "appearance" => %{"appearance" => ["none", "auto"]},
        "cursor" => %{
          "cursor" => [
            "auto",
            "default",
            "pointer",
            "wait",
            "text",
            "move",
            "help",
            "not-allowed",
            "none",
            "context-menu",
            "progress",
            "cell",
            "crosshair",
            "vertical-text",
            "alias",
            "copy",
            "no-drop",
            "grab",
            "grabbing",
            "all-scroll",
            "col-resize",
            "row-resize",
            "n-resize",
            "e-resize",
            "s-resize",
            "w-resize",
            "ne-resize",
            "nw-resize",
            "se-resize",
            "sw-resize",
            "ew-resize",
            "ns-resize",
            "nesw-resize",
            "nwse-resize",
            "zoom-in",
            "zoom-out",
            &arbitrary_value?/1
          ]
        },
        "caret-color" => %{"caret" => [&from_theme(&1, "colors")]},
        "pointer-events" => %{"pointer-events" => ["none", "auto"]},
        "resize" => %{"resize" => ["none", "y", "x", ""]},
        "scroll-behavior" => %{"scroll" => ["auto", "smooth"]},
        "scroll-m" => %{"scroll-m" => spacing_with_arbitrary()},
        "scroll-mx" => %{"scroll-mx" => spacing_with_arbitrary()},
        "scroll-my" => %{"scroll-my" => spacing_with_arbitrary()},
        "scroll-ms" => %{"scroll-ms" => spacing_with_arbitrary()},
        "scroll-me" => %{"scroll-me" => spacing_with_arbitrary()},
        "scroll-mt" => %{"scroll-mt" => spacing_with_arbitrary()},
        "scroll-mr" => %{"scroll-mr" => spacing_with_arbitrary()},
        "scroll-mb" => %{"scroll-mb" => spacing_with_arbitrary()},
        "scroll-ml" => %{"scroll-ml" => spacing_with_arbitrary()},
        "scroll-p" => %{"scroll-p" => spacing_with_arbitrary()},
        "scroll-px" => %{"scroll-px" => spacing_with_arbitrary()},
        "scroll-py" => %{"scroll-py" => spacing_with_arbitrary()},
        "scroll-ps" => %{"scroll-ps" => spacing_with_arbitrary()},
        "scroll-pe" => %{"scroll-pe" => spacing_with_arbitrary()},
        "scroll-pt" => %{"scroll-pt" => spacing_with_arbitrary()},
        "scroll-pr" => %{"scroll-pr" => spacing_with_arbitrary()},
        "scroll-pb" => %{"scroll-pb" => spacing_with_arbitrary()},
        "scroll-pl" => %{"scroll-pl" => spacing_with_arbitrary()},
        "snap-align" => %{"snap" => ["start", "end", "center", "align-none"]},
        "snap-stop" => %{"snap" => ["normal", "always"]},
        "snap-type" => %{"snap" => ["none", "x", "y", "both"]},
        "snap-strictness" => %{"snap" => ["mandatory", "proximity"]},
        "touch" => %{"touch" => ["auto", "none", "manipulation"]},
        "touch-x" => %{"touch-pan" => ["x", "left", "right"]},
        "touch-y" => %{"touch-pan" => ["y", "up", "down"]},
        "touch-pz" => ["touch-pinch-zoom"],
        "select" => %{"select" => ["none", "text", "all", "auto"]},
        "will-change" => %{"will-change" => ["auto", "scroll", "contents", "transform", &arbitrary_value?/1]},
        "fill" => %{"fill" => [&from_theme(&1, "colors"), "none"]},
        "stroke-w" => %{"stroke" => [&length?/1, &arbitrary_length?/1, &arbitrary_number?/1]},
        "stroke" => %{"stroke" => [&from_theme(&1, "colors"), "none"]},
        "sr" => ["sr-only", "not-sr-only"],
        "forced-color-adjust" => %{"forced-color-adjust" => ["auto", "none"]}
      },
      conflicting_groups: %{
        "overflow" => ["overflow-x", "overflow-y"],
        "overscroll" => ["overscroll-x", "overscroll-y"],
        "inset" => ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"],
        "inset-x" => ["right", "left"],
        "inset-y" => ["top", "bottom"],
        "flex" => ["basis", "grow", "shrink"],
        "gap" => ["gap-x", "gap-y"],
        "p" => ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
        "px" => ["pr", "pl"],
        "py" => ["pt", "pb"],
        "m" => ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
        "mx" => ["mr", "ml"],
        "my" => ["mt", "mb"],
        "size" => ["w", "h"],
        "font-size" => ["leading"],
        "fvn-normal" => [
          "fvn-ordinal",
          "fvn-slashed-zero",
          "fvn-figure",
          "fvn-spacing",
          "fvn-fraction"
        ],
        "fvn-ordinal" => ["fvn-normal"],
        "fvn-slashed-zero" => ["fvn-normal"],
        "fvn-figure" => ["fvn-normal"],
        "fvn-spacing" => ["fvn-normal"],
        "fvn-fraction" => ["fvn-normal"],
        "line-clamp" => ["display", "overflow"],
        "rounded" => [
          "rounded-s",
          "rounded-e",
          "rounded-t",
          "rounded-r",
          "rounded-b",
          "rounded-l",
          "rounded-ss",
          "rounded-se",
          "rounded-ee",
          "rounded-es",
          "rounded-tl",
          "rounded-tr",
          "rounded-br",
          "rounded-bl"
        ],
        "rounded-s" => ["rounded-ss", "rounded-es"],
        "rounded-e" => ["rounded-se", "rounded-ee"],
        "rounded-t" => ["rounded-tl", "rounded-tr"],
        "rounded-r" => ["rounded-tr", "rounded-br"],
        "rounded-b" => ["rounded-br", "rounded-bl"],
        "rounded-l" => ["rounded-tl", "rounded-bl"],
        "border-spacing" => ["border-spacing-x", "border-spacing-y"],
        "border-w" => [
          "border-w-s",
          "border-w-e",
          "border-w-t",
          "border-w-r",
          "border-w-b",
          "border-w-l"
        ],
        "border-w-x" => ["border-w-r", "border-w-l"],
        "border-w-y" => ["border-w-t", "border-w-b"],
        "border-color" => ["border-color-t", "border-color-r", "border-color-b", "border-color-l"],
        "border-color-x" => ["border-color-r", "border-color-l"],
        "border-color-y" => ["border-color-t", "border-color-b"],
        "scroll-m" => [
          "scroll-mx",
          "scroll-my",
          "scroll-ms",
          "scroll-me",
          "scroll-mt",
          "scroll-mr",
          "scroll-mb",
          "scroll-ml"
        ],
        "scroll-mx" => ["scroll-mr", "scroll-ml"],
        "scroll-my" => ["scroll-mt", "scroll-mb"],
        "scroll-p" => [
          "scroll-px",
          "scroll-py",
          "scroll-ps",
          "scroll-pe",
          "scroll-pt",
          "scroll-pr",
          "scroll-pb",
          "scroll-pl"
        ],
        "scroll-px" => ["scroll-pr", "scroll-pl"],
        "scroll-py" => ["scroll-pt", "scroll-pb"],
        "touch" => ["touch-x", "touch-y", "touch-pz"],
        "touch-x" => ["touch"],
        "touch-y" => ["touch"],
        "touch-pz" => ["touch"]
      },
      conflicting_group_modifiers: %{
        "font-size" => ["leading"]
      }
    }
  end

  for group <- @theme_groups do
    defp from_theme(theme, unquote(group)) do
      theme[String.to_existing_atom(unquote(group))] || []
    end
  end

  defp overscroll do
    ["auto", "contain", "none"]
  end

  defp overflow do
    ["auto", "hidden", "clip", "visible", "scroll"]
  end

  defp spacing_with_auto_and_arbitrary do
    ["auto", &arbitrary_value?/1, &from_theme(&1, "spacing")]
  end

  defp spacing_with_arbitrary do
    [&arbitrary_value?/1, &from_theme(&1, "spacing")]
  end

  defp length_with_empty_and_arbitrary do
    ["", &length?/1, &arbitrary_length?/1]
  end

  defp number_with_auto_and_arbitrary do
    ["auto", &number?/1, &arbitrary_value?/1]
  end

  defp positions do
    [
      "bottom",
      "center",
      "left",
      "left-bottom",
      "left-top",
      "right",
      "right-bottom",
      "right-top",
      "top"
    ]
  end

  defp line_styles do
    ["solid", "dashed", "dotted", "double", "none"]
  end

  defp blend_modes do
    [
      "normal",
      "multiply",
      "screen",
      "overlay",
      "darken",
      "lighten",
      "color-dodge",
      "color-burn",
      "hard-light",
      "soft-light",
      "difference",
      "exclusion",
      "hue",
      "saturation",
      "color",
      "luminosity"
    ]
  end

  defp align do
    ["start", "end", "center", "between", "around", "evenly", "stretch"]
  end

  defp zero_and_empty do
    ["", "0", &arbitrary_value?/1]
  end

  defp breaks do
    [
      "auto",
      "avoid",
      "all",
      "avoid-page",
      "page",
      "left",
      "right",
      "column"
    ]
  end

  defp number do
    [&number?/1, &arbitrary_number?/1]
  end

  defp number_and_arbitrary do
    [&number?/1, &arbitrary_value?/1]
  end
end
