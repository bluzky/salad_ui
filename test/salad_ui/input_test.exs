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

      for class <-
            ~w(flex px-3 py-2 rounded-md ring-offset-background border-input bg-background text-sm w-full h-10 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 file:border-0 file:bg-transparent file:font-medium file:text-sm border) do
        assert html =~ class
      end

      assert html =~ "text"
      assert html =~ "Enter your name"
    end

    test "It renders email input correctly" do
      assigns = %{}

      html =
        ~H"""
        <.input type="email" placeholder="Enter your email" />
        """
        |> rendered_to_string()
        |> clean_string()

      for class <-
            ~w(flex px-3 py-2 rounded-md ring-offset-background border-input bg-background text-sm w-full h-10 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 file:border-0 file:bg-transparent file:font-medium file:text-sm border) do
        assert html =~ class
      end

      assert html =~ "email"
      assert html =~ "Enter your email"
    end

    test "It renders password input correctly" do
      assigns = %{}

      html =
        ~H"""
        <.input type="password" placeholder="Enter your password" />
        """
        |> rendered_to_string()
        |> clean_string()

      for class <-
            ~w(flex px-3 py-2 rounded-md ring-offset-background border-input bg-background text-sm w-full h-10 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 file:border-0 file:bg-transparent file:font-medium file:text-sm border) do
        assert html =~ class
      end

      assert html =~ "password"
      assert html =~ "Enter your password"
    end

    test "It renders dates input correctly" do
      assigns = %{}

      html =
        ~H"""
        <.input type="date" placeholder="yyy-mm-dd" />
        """
        |> rendered_to_string()
        |> clean_string()

      for class <-
            ~w(flex px-3 py-2 rounded-md ring-offset-background border-input bg-background text-sm w-full h-10 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 file:border-0 file:bg-transparent file:font-medium file:text-sm border) do
        assert html =~ class
      end

      assert html =~ "date"
      assert html =~ "yyy-mm-dd"
    end

    test "It renders datetime-local input correctly" do
      assigns = %{}

      html =
        ~H"""
        <.input type="datetime-local" placeholder="Date time" />
        """
        |> rendered_to_string()
        |> clean_string()

      for class <-
            ~w(flex px-3 py-2 rounded-md ring-offset-background border-input bg-background text-sm w-full h-10 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 file:border-0 file:bg-transparent file:font-medium file:text-sm border) do
        assert html =~ class
      end

      assert html =~ "datetime-local"
      assert html =~ "Date time"
    end

    test "It renders file input correctly" do
      assigns = %{}

      html =
        ~H"""
        <.input type="file" placeholder="Select file" />
        """
        |> rendered_to_string()
        |> clean_string()

      for class <-
            ~w(flex px-3 py-2 rounded-md ring-offset-background border-input bg-background text-sm w-full h-10 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 file:border-0 file:bg-transparent file:font-medium file:text-sm border) do
        assert html =~ class
      end

      assert html =~ "file"
      assert html =~ "Select file"
    end

    test "It renders hidden input correctly" do
      assigns = %{}

      html =
        ~H"""
        <.input type="hidden" name="secret" value="hard to get in" />
        """
        |> rendered_to_string()
        |> clean_string()

      for class <-
            ~w(flex px-3 py-2 rounded-md ring-offset-background border-input bg-background text-sm w-full h-10 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 file:border-0 file:bg-transparent file:font-medium file:text-sm border) do
        assert html =~ class
      end

      assert html =~ "hidden"
      assert html =~ "secret"
      assert html =~ "hard to get in"
    end
  end
end
