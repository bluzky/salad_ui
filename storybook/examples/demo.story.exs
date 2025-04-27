defmodule Storybook.Examples.Demo do
  @moduledoc false
  use PhoenixStorybook.Story, :example

  @impl true
  def mount(_params, _session, socket) do
    {:ok, socket}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="my-4">
      <h1 class="text-2xl font-bold mb-4">Dashboard one</h1>
      <a href="/demo/dashboard-one" class="text-primary">
        <Lucideicons.link class="w-4 h-4 inline-block mr-2" /> View full page
      </a>
    </div>
    <div class="border rounded-lg overflow-hidden mb-12">
      <iframe src="/demo/dashboard-one" class="w-full h-[80vh]"></iframe>
    </div>

    <div class="my-4">
      <h1 class="text-2xl font-bold mb-4">Dashboard two</h1>
      <a href="/demo/dashboard-two" class="text-primary">
        <Lucideicons.link class="w-4 h-4 inline-block mr-2" /> View full page
      </a>
    </div>
    <div class="border rounded-lg overflow-hidden mb-12">
      <iframe src="/demo/dashboard-two" class="w-full h-[80vh]"></iframe>
    </div>

    <div class="my-4">
      <h1 class="text-2xl font-bold mb-4">Dashboard three</h1>
      <a href="/demo/dashboard-three" class="text-primary">
        <Lucideicons.link class="w-4 h-4 inline-block mr-2" /> View full page
      </a>
    </div>
    <div class="border rounded-lg overflow-hidden mb-12">
      <iframe src="/demo/dashboard-three" class="w-full h-[80vh]"></iframe>
    </div>
    """
  end
end
