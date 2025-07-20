defmodule SaladStorybookWeb.PageControllerTest do
  use SaladStorybookWeb.ConnCase

  test "GET /", %{conn: conn} do
    conn = get(conn, ~p"/")
    assert redirected_to(conn) == "/welcome"
  end
end
