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
          <svg viewBox="0 0 24 24" class="h-4 w-4 mr-2" fill="currentColor" aria-hidden="true">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18A10.9 10.9 0 0 1 12 5.51c.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.82 1.19 3.08 0 4.42-2.7 5.39-5.26 5.68.41.35.78 1.05.78 2.12v3.73c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
          </svg>
          Visit GitHub
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
    <div class="flex min-h-screen w-full flex-col border border-border rounded-lg overflow-hidden">
      <iframe src="/demo/dashboard-two" class="w-full h-[100vh]" />
    </div>
    """
  end
end
