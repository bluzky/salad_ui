# MIT License
#
# Copyright (c) 2021 Dany Castillo
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

defmodule SaladUI.MergeTest do
  use ExUnit.Case, async: false

  import SaladUI.Merge

  alias SaladUI.Cache

  doctest SaladUI.Merge

  setup do
    Cache.create_table()
    :ok
  end

  describe "non-conflicting" do
    test "merges non-conflicting classes correctly" do
      assert merge(["border-t", "border-white/10"]) == "border-t border-white/10"
      assert merge(["border-t", "border-white"]) == "border-t border-white"
      assert merge(["text-3.5xl", "text-black"]) == "text-3.5xl text-black"
    end
  end

  describe "colors" do
    test "handles color conflicts properly" do
      assert merge("bg-grey-5 bg-hotpink") == "bg-hotpink"
      assert merge("hover:bg-grey-5 hover:bg-hotpink") == "hover:bg-hotpink"
      assert merge(["stroke-[hsl(350_80%_0%)]", "stroke-[10px]"]) == "stroke-[hsl(350_80%_0%)] stroke-[10px]"
    end
  end

  describe "borders" do
    test "merges classes with per-side border colors correctly" do
      assert merge(["border-t-some-blue", "border-t-other-blue"]) == "border-t-other-blue"
      assert merge(["border-t-some-blue", "border-some-blue"]) == "border-some-blue"
    end
  end

  describe "group conflicts" do
    test "merges classes from same group correctly" do
      assert merge("overflow-x-auto overflow-x-hidden") == "overflow-x-hidden"
      assert merge("basis-full basis-auto") == "basis-auto"
      assert merge("w-full w-fit") == "w-fit"
      assert merge("overflow-x-auto overflow-x-hidden overflow-x-scroll") == "overflow-x-scroll"
      assert merge(["overflow-x-auto", "hover:overflow-x-hidden", "overflow-x-scroll"]) == "hover:overflow-x-hidden overflow-x-scroll"

      assert merge(["overflow-x-auto", "hover:overflow-x-hidden", "hover:overflow-x-auto", "overflow-x-scroll"]) ==
               "hover:overflow-x-auto overflow-x-scroll"

      assert merge("col-span-1 col-span-full") == "col-span-full"
    end

    test "merges classes from Font Variant Numeric section correctly" do
      assert merge(["lining-nums", "tabular-nums", "diagonal-fractions"]) == "lining-nums tabular-nums diagonal-fractions"
      assert merge(["normal-nums", "tabular-nums", "diagonal-fractions"]) == "tabular-nums diagonal-fractions"
      assert merge(["tabular-nums", "diagonal-fractions", "normal-nums"]) == "normal-nums"
      assert merge("tabular-nums proportional-nums") == "proportional-nums"
    end
  end

  describe "conflicts across groups" do
    test "handles conflicts across class groups correctly" do
      assert merge("inset-1 inset-x-1") == "inset-1 inset-x-1"
      assert merge("inset-x-1 inset-1") == "inset-1"
      assert merge(["inset-x-1", "left-1", "inset-1"]) == "inset-1"
      assert merge(["inset-x-1", "inset-1", "left-1"]) == "inset-1 left-1"
      assert merge(["inset-x-1", "right-1", "inset-1"]) == "inset-1"
      assert merge(["inset-x-1", "right-1", "inset-x-1"]) == "inset-x-1"
      assert merge(["inset-x-1", "right-1", "inset-y-1"]) == "inset-x-1 right-1 inset-y-1"
      assert merge(["right-1", "inset-x-1", "inset-y-1"]) == "inset-x-1 inset-y-1"
      assert merge(["inset-x-1", "hover:left-1", "inset-1"]) == "hover:left-1 inset-1"
    end

    test "ring and shadow classes do not create conflict" do
      assert merge(["ring", "shadow"]) == "ring shadow"
      assert merge(["ring-2", "shadow-md"]) == "ring-2 shadow-md"
      assert merge(["shadow", "ring"]) == "shadow ring"
      assert merge(["shadow-md", "ring-2"]) == "shadow-md ring-2"
    end

    test "touch classes do create conflicts correctly" do
      assert merge("touch-pan-x touch-pan-right") == "touch-pan-right"
      assert merge("touch-none touch-pan-x") == "touch-pan-x"
      assert merge("touch-pan-x touch-none") == "touch-none"
      assert merge(["touch-pan-x", "touch-pan-y", "touch-pinch-zoom"]) == "touch-pan-x touch-pan-y touch-pinch-zoom"
      assert merge(["touch-manipulation", "touch-pan-x", "touch-pan-y", "touch-pinch-zoom"]) == "touch-pan-x touch-pan-y touch-pinch-zoom"
      assert merge(["touch-pan-x", "touch-pan-y", "touch-pinch-zoom", "touch-auto"]) == "touch-auto"
    end

    test "line-clamp classes do create conflicts correctly" do
      assert merge(["overflow-auto", "inline", "line-clamp-1"]) == "line-clamp-1"
      assert merge(["line-clamp-1", "overflow-auto", "inline"]) == "line-clamp-1 overflow-auto inline"
    end
  end

  describe "arbitrary values" do
    test "handles simple conflicts with arbitrary values correctly" do
      assert merge("m-[2px] m-[10px]") == "m-[10px]"

      assert merge([
               "m-[2px]",
               "m-[11svmin]",
               "m-[12in]",
               "m-[13lvi]",
               "m-[14vb]",
               "m-[15vmax]",
               "m-[16mm]",
               "m-[17%]",
               "m-[18em]",
               "m-[19px]",
               "m-[10dvh]"
             ]) == "m-[10dvh]"

      assert merge(["h-[10px]", "h-[11cqw]", "h-[12cqh]", "h-[13cqi]", "h-[14cqb]", "h-[15cqmin]", "h-[16cqmax]"]) == "h-[16cqmax]"
      assert merge("z-20 z-[99]") == "z-[99]"
      assert merge("my-[2px] m-[10rem]") == "m-[10rem]"
      assert merge("cursor-pointer cursor-[grab]") == "cursor-[grab]"
      assert merge("m-[2px] m-[calc(100%-var(--arbitrary))]") == "m-[calc(100%-var(--arbitrary))]"
      assert merge("m-[2px] m-[length:var(--mystery-var)]") == "m-[length:var(--mystery-var)]"
      assert merge("opacity-10 opacity-[0.025]") == "opacity-[0.025]"
      assert merge("scale-75 scale-[1.7]") == "scale-[1.7]"
      assert merge("brightness-90 brightness-[1.75]") == "brightness-[1.75]"
      assert merge("min-h-[0.5px] min-h-[0]") == "min-h-[0]"
      assert merge("text-[0.5px] text-[color:0]") == "text-[0.5px] text-[color:0]"
      assert merge("text-[0.5px] text-[--my-0]") == "text-[0.5px] text-[--my-0]"
    end

    test "handles arbitrary length conflicts with labels and modifiers correctly" do
      assert merge("hover:m-[2px] hover:m-[length:var(--c)]") == "hover:m-[length:var(--c)]"
      assert merge("hover:focus:m-[2px] focus:hover:m-[length:var(--c)]") == "focus:hover:m-[length:var(--c)]"

      assert merge("border-b border-[color:rgb(var(--color-gray-500-rgb)/50%))]") ==
               "border-b border-[color:rgb(var(--color-gray-500-rgb)/50%))]"

      assert merge("border-[color:rgb(var(--color-gray-500-rgb)/50%))] border-b") ==
               "border-[color:rgb(var(--color-gray-500-rgb)/50%))] border-b"

      assert merge(["border-b", "border-[color:rgb(var(--color-gray-500-rgb)/50%))]", "border-some-coloooor"]) ==
               "border-b border-some-coloooor"
    end

    test "handles complex arbitrary value conflicts correctly" do
      assert merge("grid-rows-[1fr,auto] grid-rows-2") == "grid-rows-2"
      assert merge("grid-rows-[repeat(20,minmax(0,1fr))] grid-rows-3") == "grid-rows-3"
    end

    test "handles ambiguous arbitrary values correctly" do
      assert merge("mt-2 mt-[calc(theme(fontSize.4xl)/1.125)]") == "mt-[calc(theme(fontSize.4xl)/1.125)]"
      assert merge("p-2 p-[calc(theme(fontSize.4xl)/1.125)_10px]") == "p-[calc(theme(fontSize.4xl)/1.125)_10px]"
      assert merge("mt-2 mt-[length:theme(someScale.someValue)]") == "mt-[length:theme(someScale.someValue)]"
      assert merge("mt-2 mt-[theme(someScale.someValue)]") == "mt-[theme(someScale.someValue)]"
      assert merge("text-2xl text-[length:theme(someScale.someValue)]") == "text-[length:theme(someScale.someValue)]"
      assert merge("text-2xl text-[calc(theme(fontSize.4xl)/1.125)]") == "text-[calc(theme(fontSize.4xl)/1.125)]"
      assert merge(["bg-cover", "bg-[percentage:30%]", "bg-[length:200px_100px]"]) == "bg-[length:200px_100px]"

      assert merge(["bg-none", "bg-[url(.)]", "bg-[image:.]", "bg-[url:.]", "bg-[linear-gradient(.)]", "bg-gradient-to-r"]) ==
               "bg-gradient-to-r"
    end
  end

  describe "arbitrary properties" do
    test "handles arbitrary property conflicts correctly" do
      assert merge("[paint-order:markers] [paint-order:normal]") == "[paint-order:normal]"

      assert merge(["[paint-order:markers]", "[--my-var:2rem]", "[paint-order:normal]", "[--my-var:4px]"]) ==
               "[paint-order:normal] [--my-var:4px]"
    end

    test "handles arbitrary property conflicts with modifiers correctly" do
      assert merge("[paint-order:markers] hover:[paint-order:normal]") == "[paint-order:markers] hover:[paint-order:normal]"
      assert merge("hover:[paint-order:markers] hover:[paint-order:normal]") == "hover:[paint-order:normal]"
      assert merge("hover:focus:[paint-order:markers] focus:hover:[paint-order:normal]") == "focus:hover:[paint-order:normal]"

      assert merge(["[paint-order:markers]", "[paint-order:normal]", "[--my-var:2rem]", "lg:[--my-var:4px]"]) ==
               "[paint-order:normal] [--my-var:2rem] lg:[--my-var:4px]"
    end

    test "handles complex arbitrary property conflicts correctly" do
      assert merge("[-unknown-prop:::123:::] [-unknown-prop:url(https://hi.com)]") == "[-unknown-prop:url(https://hi.com)]"
    end

    test "handles important modifier correctly" do
      assert merge("![some:prop] [some:other]") == "![some:prop] [some:other]"
      assert merge("![some:prop] [some:other] [some:one] ![some:another]") == "[some:one] ![some:another]"
    end
  end

  describe "pseudo variants" do
    test "handles pseudo variants conflicts properly" do
      assert merge(["empty:p-2", "empty:p-3"]) == "empty:p-3"
      assert merge(["hover:empty:p-2", "hover:empty:p-3"]) == "hover:empty:p-3"
      assert merge(["read-only:p-2", "read-only:p-3"]) == "read-only:p-3"
    end

    test "handles pseudo variant group conflicts properly" do
      assert merge(["group-empty:p-2", "group-empty:p-3"]) == "group-empty:p-3"
      assert merge(["peer-empty:p-2", "peer-empty:p-3"]) == "peer-empty:p-3"
      assert merge(["group-empty:p-2", "peer-empty:p-3"]) == "group-empty:p-2 peer-empty:p-3"
      assert merge(["hover:group-empty:p-2", "hover:group-empty:p-3"]) == "hover:group-empty:p-3"
      assert merge(["group-read-only:p-2", "group-read-only:p-3"]) == "group-read-only:p-3"
    end
  end

  describe "arbitrary variants" do
    test "basic arbitrary variants" do
      assert merge("[&>*]:underline [&>*]:line-through") == "[&>*]:line-through"
      assert merge(["[&>*]:underline", "[&>*]:line-through", "[&_div]:line-through"]) == "[&>*]:line-through [&_div]:line-through"
      assert merge("supports-[display:grid]:flex supports-[display:grid]:grid") == "supports-[display:grid]:grid"
    end

    test "arbitrary variants with modifiers" do
      assert merge("dark:lg:hover:[&>*]:underline dark:lg:hover:[&>*]:line-through") == "dark:lg:hover:[&>*]:line-through"
      assert merge("dark:lg:hover:[&>*]:underline dark:hover:lg:[&>*]:line-through") == "dark:hover:lg:[&>*]:line-through"
      assert merge("hover:[&>*]:underline [&>*]:hover:line-through") == "hover:[&>*]:underline [&>*]:hover:line-through"

      assert merge(["hover:dark:[&>*]:underline", "dark:hover:[&>*]:underline", "dark:[&>*]:hover:line-through"]) ==
               "dark:hover:[&>*]:underline dark:[&>*]:hover:line-through"
    end

    test "arbitrary variants with complex syntax in them" do
      assert merge(["[@media_screen{@media(hover:hover)}]:underline", "[@media_screen{@media(hover:hover)}]:line-through"]) ==
               "[@media_screen{@media(hover:hover)}]:line-through"

      assert merge("hover:[@media_screen{@media(hover:hover)}]:underline hover:[@media_screen{@media(hover:hover)}]:line-through") ==
               "hover:[@media_screen{@media(hover:hover)}]:line-through"
    end

    test "arbitrary variants with attribute selectors" do
      assert merge("[&[data-open]]:underline [&[data-open]]:line-through") == "[&[data-open]]:line-through"
    end

    test "arbitrary variants with multiple attribute selectors" do
      assert merge(["[&[data-foo][data-bar]:not([data-baz])]:underline", "[&[data-foo][data-bar]:not([data-baz])]:line-through"]) ==
               "[&[data-foo][data-bar]:not([data-baz])]:line-through"
    end

    test "multiple arbitrary variants" do
      assert merge("[&>*]:[&_div]:underline [&>*]:[&_div]:line-through") == "[&>*]:[&_div]:line-through"
      assert merge(["[&>*]:[&_div]:underline", "[&_div]:[&>*]:line-through"]) == "[&>*]:[&_div]:underline [&_div]:[&>*]:line-through"

      assert merge(["hover:dark:[&>*]:focus:disabled:[&_div]:underline", "dark:hover:[&>*]:disabled:focus:[&_div]:line-through"]) ==
               "dark:hover:[&>*]:disabled:focus:[&_div]:line-through"

      assert merge(["hover:dark:[&>*]:focus:[&_div]:disabled:underline", "dark:hover:[&>*]:disabled:focus:[&_div]:line-through"]) ==
               "hover:dark:[&>*]:focus:[&_div]:disabled:underline dark:hover:[&>*]:disabled:focus:[&_div]:line-through"
    end

    test "arbitrary variants with arbitrary properties" do
      assert merge("[&>*]:[color:red] [&>*]:[color:blue]") == "[&>*]:[color:blue]"

      assert merge([
               "[&[data-foo][data-bar]:not([data-baz])]:nod:noa:[color:red]",
               "[&[data-foo][data-bar]:not([data-baz])]:noa:nod:[color:blue]"
             ]) == "[&[data-foo][data-bar]:not([data-baz])]:noa:nod:[color:blue]"
    end
  end

  describe "content utilities" do
    test "merges content utilities correctly" do
      assert merge(["content-['hello']", "content-[attr(data-content)]"]) == "content-[attr(data-content)]"
    end
  end

  describe "important modifier" do
    test "merges tailwind classes with important modifier correctly" do
      assert merge(["!font-medium", "!font-bold"]) == "!font-bold"
      assert merge(["!font-medium", "!font-bold", "font-thin"]) == "!font-bold font-thin"
      assert merge(["!right-2", "!-inset-x-px"]) == "!-inset-x-px"
      assert merge(["focus:!inline", "focus:!block"]) == "focus:!block"
    end
  end

  describe "modifiers" do
    test "conflicts across prefix modifiers" do
      assert merge("hover:block hover:inline") == "hover:inline"
      assert merge(["hover:block", "hover:focus:inline"]) == "hover:block hover:focus:inline"
      assert merge(["hover:block", "hover:focus:inline", "focus:hover:inline"]) == "hover:block focus:hover:inline"
      assert merge("focus-within:inline focus-within:block") == "focus-within:block"
    end

    test "conflicts across postfix modifiers" do
      assert merge("text-lg/7 text-lg/8") == "text-lg/8"
      assert merge(["text-lg/none", "leading-9"]) == "text-lg/none leading-9"
      assert merge(["leading-9", "text-lg/none"]) == "text-lg/none"
      assert merge("w-full w-1/2") == "w-1/2"
    end
  end

  describe "negative values" do
    test "handles negative value conflicts correctly" do
      assert merge(["-m-2", "-m-5"]) == "-m-5"
      assert merge(["-top-12", "-top-2000"]) == "-top-2000"
    end

    test "handles conflicts between positive and negative values correctly" do
      assert merge(["-m-2", "m-auto"]) == "m-auto"
      assert merge(["top-12", "-top-69"]) == "-top-69"
    end

    test "handles conflicts across groups with negative values correctly" do
      assert merge(["-right-1", "inset-x-1"]) == "inset-x-1"
      assert merge(["hover:focus:-right-1", "focus:hover:inset-x-1"]) == "focus:hover:inset-x-1"
    end
  end

  describe "non-tailwind" do
    test "does not alter non-tailwind classes" do
      assert merge(["non-tailwind-class", "inline", "block"]) == "non-tailwind-class block"
      assert merge(["inline", "block", "inline-1"]) == "block inline-1"
      assert merge(["inline", "block", "i-inline"]) == "block i-inline"
      assert merge(["focus:inline", "focus:block", "focus:inline-1"]) == "focus:block focus:inline-1"
    end
  end

  describe "join/1" do
    test "strings" do
      assert join("") == ""
      assert join("foo") == "foo"
      assert join(false && "foo") == ""
    end

    test "strings (variadic)" do
      assert join([""]) == ""
      assert join(["foo", "bar"]) == "foo bar"
      assert join([false && "foo", "bar", "baz", ""]) == "bar baz"
    end

    test "arrays" do
      assert join([]) == ""
      assert join(["foo"]) == "foo"
      assert join(["foo", "bar"]) == "foo bar"
    end

    test "arrays (nested)" do
      assert join([[[]]]) == ""
      assert join([[["foo"]]]) == "foo"
      assert join([false, [["foo"]]]) == "foo"
      assert join(["foo", ["bar", ["", [["baz"]]]]]) == "foo bar baz"
    end

    test "arrays (variadic)" do
      assert join([[], []]) == ""
      assert join([["foo"], ["bar"]]) == "foo bar"
      assert join([["foo"], nil, ["baz", ""], false, "", []]) == "foo baz"
    end
  end
end
