defmodule SaladUI.InputTest do
  use ComponentCase

  import SaladUI.Input

  describe "Test Input" do
    test "It renders text input correctly" do
      assigns = %{}

      html =
        ~H"""
        <.input type="text" placeholder="Enter your name" />
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<input class=\"flex px-3 py-2 rounded-md ring-offset-background border-input bg-background text-sm w-full h-10 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 file:border-0 file:bg-transparent file:font-medium file:text-sm border\" type=\"text\" placeholder=\"Enter your name\">"
    end

    test "It renders email input correctly" do
      assigns = %{}

      html =
        ~H"""
        <.input type="email" placeholder="Enter your email" />
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<input class=\"flex px-3 py-2 rounded-md ring-offset-background border-input bg-background text-sm w-full h-10 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 file:border-0 file:bg-transparent file:font-medium file:text-sm border\" type=\"email\" placeholder=\"Enter your email\">"
    end

    test "It renders password input correctly" do
      assigns = %{}

      html =
        ~H"""
        <.input type="password" placeholder="Enter your password" />
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<input class=\"flex px-3 py-2 rounded-md ring-offset-background border-input bg-background text-sm w-full h-10 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 file:border-0 file:bg-transparent file:font-medium file:text-sm border\" type=\"password\" placeholder=\"Enter your password\">"
    end

    test "It renders dates input correctly" do
      assigns = %{}

      html =
        ~H"""
        <.input type="date" placeholder="yyy-mm-dd" />
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<input class=\"flex px-3 py-2 rounded-md ring-offset-background border-input bg-background text-sm w-full h-10 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 file:border-0 file:bg-transparent file:font-medium file:text-sm border\" type=\"date\" placeholder=\"yyy-mm-dd\">"
    end

    test "It renders datetime-local input correctly" do
      assigns = %{}

      html =
        ~H"""
        <.input type="datetime-local" placeholder="Date time" />
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<input class=\"flex px-3 py-2 rounded-md ring-offset-background border-input bg-background text-sm w-full h-10 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 file:border-0 file:bg-transparent file:font-medium file:text-sm border\" type=\"datetime-local\" placeholder=\"Date time\">"
    end

    test "It renders file input correctly" do
      assigns = %{}

      html =
        ~H"""
        <.input type="file" placeholder="Select file" />
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<input class=\"flex px-3 py-2 rounded-md ring-offset-background border-input bg-background text-sm w-full h-10 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 file:border-0 file:bg-transparent file:font-medium file:text-sm border\" type=\"file\" placeholder=\"Select file\">"
    end

    test "It renders hidden input correctly" do
      assigns = %{}

      html =
        ~H"""
        <.input type="hidden" name="secret" value="hard to get in" />
        """
        |> rendered_to_string()
        |> clean_string()

      assert html =~
               "<input class=\"flex px-3 py-2 rounded-md ring-offset-background border-input bg-background text-sm w-full h-10 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 file:border-0 file:bg-transparent file:font-medium file:text-sm border\" name=\"secret\" type=\"hidden\" value=\"hard to get in\">"
    end
  end
end
