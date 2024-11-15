defmodule SaladUI.Merge.ValidatorTest do
  use ExUnit.Case

  import SaladUI.Merge.Validator

  test "length?" do
    assert length?("1")
    assert length?("1023713")
    assert length?("1.5")
    assert length?("1231.503761")
    assert length?("px")
    assert length?("full")
    assert length?("screen")
    assert length?("1/2")
    assert length?("123/345")

    refute length?("[3.7%]")
    refute length?("[481px]")
    refute length?("[19.1rem]")
    refute length?("[50vw]")
    refute length?("[56vh]")
    refute length?("[length:var(--arbitrary)]")
    refute length?("1d5")
    refute length?("[1]")
    refute length?("[12px")
    refute length?("12px]")
    refute length?("one")
  end

  test "arbitrary_length?" do
    assert arbitrary_length?("[3.7%]")
    assert arbitrary_length?("[481px]")
    assert arbitrary_length?("[19.1rem]")
    assert arbitrary_length?("[50vw]")
    assert arbitrary_length?("[56vh]")
    assert arbitrary_length?("[length:var(--arbitrary)]")

    refute arbitrary_length?("1")
    refute arbitrary_length?("3px")
    refute arbitrary_length?("1d5")
    refute arbitrary_length?("[1]")
    refute arbitrary_length?("[12px")
    refute arbitrary_length?("12px]")
    refute arbitrary_length?("one")
  end

  test "integer?" do
    assert integer?("1")
    assert integer?("123")
    assert integer?("8312")

    refute integer?("[8312]")
    refute integer?("[2]")
    refute integer?("[8312px]")
    refute integer?("[8312%]")
    refute integer?("[8312rem]")
    refute integer?("8312.2")
    refute integer?("1.2")
    refute integer?("one")
    refute integer?("1/2")
    refute integer?("1%")
    refute integer?("1px")
  end

  test "arbitrary_value?" do
    assert arbitrary_value?("[1]")
    assert arbitrary_value?("[bla]")
    assert arbitrary_value?("[not-an-arbitrary-value?]")
    assert arbitrary_value?("[auto,auto,minmax(0,1fr),calc(100vw-50%)]")

    refute arbitrary_value?("[]")
    refute arbitrary_value?("[1")
    refute arbitrary_value?("1]")
    refute arbitrary_value?("1")
    refute arbitrary_value?("one")
    refute arbitrary_value?("o[n]e")
  end

  test "any?" do
    assert any?()
    assert any?("")
    assert any?("something")
  end

  test "tshirt_size?" do
    assert tshirt_size?("xs")
    assert tshirt_size?("sm")
    assert tshirt_size?("md")
    assert tshirt_size?("lg")
    assert tshirt_size?("xl")
    assert tshirt_size?("2xl")
    assert tshirt_size?("2.5xl")
    assert tshirt_size?("10xl")

    refute tshirt_size?("")
    refute tshirt_size?("hello")
    refute tshirt_size?("1")
    refute tshirt_size?("xl3")
    refute tshirt_size?("2xl3")
    refute tshirt_size?("-xl")
    refute tshirt_size?("[sm]")
  end

  test "arbitrary_size?" do
    assert arbitrary_size?("[size:2px]")
    assert arbitrary_size?("[size:bla]")
    assert arbitrary_size?("[length:bla]")
    assert arbitrary_size?("[percentage:bla]")

    refute arbitrary_size?("[2px]")
    refute arbitrary_size?("[bla]")
    refute arbitrary_size?("size:2px")
  end

  test "arbitrary_position?" do
    assert arbitrary_position?("[position:2px]")
    assert arbitrary_position?("[position:bla]")

    refute arbitrary_position?("[2px]")
    refute arbitrary_position?("[bla]")
    refute arbitrary_position?("position:2px")
  end

  test "arbitrary_image?" do
    assert arbitrary_image?("[url:var(--my-url)]")
    assert arbitrary_image?("[url(something)]")
    assert arbitrary_image?("[url:bla]")
    assert arbitrary_image?("[image:bla]")
    assert arbitrary_image?("[linear-gradient(something)]")
    assert arbitrary_image?("[repeating-conic-gradient(something)]")

    refute arbitrary_image?("[var(--my-url)]")
    refute arbitrary_image?("[bla]")
    refute arbitrary_image?("url:2px")
    refute arbitrary_image?("url(2px)")
  end

  test "arbitrary_number?" do
    assert arbitrary_number?("[number:black]")
    assert arbitrary_number?("[number:bla]")
    assert arbitrary_number?("[number:230]")
    assert arbitrary_number?("[450]")

    refute arbitrary_number?("[2px]")
    refute arbitrary_number?("[bla]")
    refute arbitrary_number?("[black]")
    refute arbitrary_number?("black")
    refute arbitrary_number?("450")
  end

  test "arbitrary_shadow?" do
    assert arbitrary_shadow?("[0_35px_60px_-15px_rgba(0,0,0,0.3)]")
    assert arbitrary_shadow?("[inset_0_1px_0,inset_0_-1px_0]")
    assert arbitrary_shadow?("[0_0_#00f]")
    assert arbitrary_shadow?("[.5rem_0_rgba(5,5,5,5)]")
    assert arbitrary_shadow?("[-.5rem_0_#123456]")
    assert arbitrary_shadow?("[0.5rem_-0_#123456]")
    assert arbitrary_shadow?("[0.5rem_-0.005vh_#123456]")
    assert arbitrary_shadow?("[0.5rem_-0.005vh]")

    refute arbitrary_shadow?("[rgba(5,5,5,5)]")
    refute arbitrary_shadow?("[#00f]")
    refute arbitrary_shadow?("[something-else]")
  end

  test "percent?" do
    assert percent?("1%")
    assert percent?("100.001%")
    assert percent?(".01%")
    assert percent?("0%")

    refute percent?("0")
    refute percent?("one%")
  end
end
