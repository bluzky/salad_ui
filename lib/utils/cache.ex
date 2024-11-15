defmodule SaladUI.Cache do
  @moduledoc false
  use GenServer

  alias SaladUI.Merge.ClassTree

  @default_table_name :turboprop_cache

  @doc false
  def default_table_name, do: @default_table_name

  def start_link(default) when is_list(default) do
    GenServer.start_link(__MODULE__, default)
  end

  @impl true
  def init(opts \\ []) do
    table_name = Keyword.get(opts, :cache_table_name, @default_table_name)
    create_table(table_name)

    insert(:class_tree, ClassTree.generate())

    {:ok, []}
  end

  def create_table(table_name \\ @default_table_name) do
    :ets.new(table_name, [:set, :public, :named_table, read_concurrency: true])
  end

  def insert(key, value, table_name \\ @default_table_name) do
    :ets.insert(table_name, {key, value})
  end

  def retrieve(key, table_name \\ @default_table_name) do
    case :ets.lookup(table_name, key) do
      [{^key, value}] -> value
      [] -> nil
    end
  end

  def purge(table_name \\ @default_table_name) do
    :ets.delete_all_objects(table_name)
  end
end
