defmodule Storybook.Examples.Sidebar do
  @moduledoc false
  use PhoenixStorybook.Story, :example
 
  @impl true
  def mount(_params, _session, socket) do
    {:ok, socket}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="space-y-12">
      <.section
        url="/demo/sidebar-one"
        source_ulr=""
        title="A simple sidebar with navigation grouped by section."
      />
      <.section url="/demo/sidebar-two" source_ulr="" title="A sidebar with collapsible sections." />
      <.section url="/demo/sidebar-three" source_ulr="" title="A sidebar with submenus." />
      <.section url="/demo/sidebar-four" source_ulr="" title="A floating sidebar with submenus." />
      <.section url="/demo/sidebar-five" source_ulr="" title="A sidebar with collapsible submenus." />
      <.section url="/demo/sidebar-six" source_ulr="" title="A sidebar that collapses to icons." />
    </div>
    """
  end

  attr :url, :string, required: true
  attr :source_url, :string, default: nil
  attr :title, :string

  defp section(assigns) do
    ~H"""
    <div class="my-4 space-y-3">
      <h1 class="text-2xl font-bold mb-4">{@title}</h1>
      <div>
        <a href={@url} class="text-primary">
          <Lucideicons.link class="w-4 h-4 inline-block mr-2" /> View full page
        </a>

        <a href={@source_url} class="text-primary ml-6" target="_blank">
          <Lucideicons.code_xml class="w-4 h-4 inline-block mr-2" /> Source code
        </a>
      </div>
      <div class="border rounded-lg overflow-hidden mb-12">
        <iframe src={@url} class="w-full h-[80vh]"></iframe>
      </div>
    </div>
    """
  end
end
