defmodule SaladUI.Progress do
  @moduledoc false
  use SaladUI, :component

  @doc """
  Render progress bar

  ## Example


      <.progress class="w-[60%]" value={20}/>

  """
  attr(:class, :string, default: nil)
  attr(:value, :integer, default: 0, doc: "")
  attr(:rest, :global)

  def progress(assigns) do
    ~H"""
    <div
      class={classes(["relative h-4 w-full overflow-hidden rounded-full bg-secondary", @class])}
      {@rest}
    >
      <div
        class="h-full w-full flex-1 bg-primary transition-all"
        style={"transform: translateX(-#{100 - (@value || 0)}%)"}
      >
      </div>
    </div>
    """
  end
end
