defmodule Storybook.MyPage do
  # See https://hexdocs.pm/phoenix_storybook/PhoenixStorybook.Story.html for full story
  # documentation.
  @moduledoc false
  use PhoenixStorybook.Story, :page

  # This is a dummy fonction that you should replace with your own HEEx content.
  def render(assigns) do
    ~H"""
    <div class="text-center pt-20 pb-32">
      <h1 class="text-4xl font-bold">Build your LiveView component library</h1>
      <p class="text-lg text-muted-foreground">
        Fully customizable elements to build your own Phoenix LiveView components
      </p>
      <div class="flex w-full items-center justify-center space-x-4 py-8 md:pb-10">
        <a
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors text-primary border border-input bg-secondary shadow-sm h-9 px-4 py-2"
          href="/examples/demo"
        >
          Examples
        </a>

        <a
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors text-white border border-input bg-primary shadow-sm h-9 px-4 py-2"
          href="https://github.com/bluzky/salad_ui"
        >
          <Lucideicons.github class="h-4 w-4 mr-2" />Visit GitHub
        </a>
      </div>
      <div class="text-center pb-8 flex justify-center">
        <a href="https://ko-fi.com/F1F1CEZ91" target="_blank">
          <img
            height="36"
            style="border:0px;height:36px;"
            src="https://storage.ko-fi.com/cdn/kofi2.png?v=6"
            border="0"
            alt="Buy Me a Coffee at ko-fi.com"
          />
        </a>
      </div>
    </div>
    <div class="flex min-h-screen w-full flex-col border rounded-lg overflow-hidden">
      <iframe src="/demo/dashboard-two" class="w-full h-[100vh]" />
    </div>
    """
  end
end
