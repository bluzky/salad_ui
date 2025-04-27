defmodule SaladStorybookWeb.Demo.Demo do
  @moduledoc false
  use SaladStorybookWeb, :live_view

  import SaladUI.Select

  def mount(_params, _session, socket) do
    socket =
      socket
      |> assign(:selected_fruit, "apple")
      |> assign(:selected_country, nil)
      |> assign(:selected_skills, ["elixir"])
      |> assign(:form_data, %{})

    {:ok, socket}
  end

  def render(assigns) do
    ~H"""
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-6">Select Component Demo</h1>

      <div class="grid grid-cols-2 gap-8">
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Fruit Selector</h2>

          <.select
            :let={builder}
            id="fruit-select"
            value={@selected_fruit}
            name="fruit"
            on_value_changed="handle_fruit_select"
          >
            <.select_trigger class="w-[180px]">
              <.select_value placeholder="Select a fruit" />
            </.select_trigger>
            <.select_content builder={builder}>
              <.select_group>
                <.select_label>Fruits</.select_label>
                <.select_item value="apple">Apple</.select_item>
                <.select_item value="banana">Banana</.select_item>
                <.select_item value="blueberry">Blueberry</.select_item>
                <.select_separator />
                <.select_item disabled value="grapes">Grapes</.select_item>
                <.select_item value="pineapple">Pineapple</.select_item>
              </.select_group>
            </.select_content>
          </.select>

          <div class="mt-4">
            <%= if @selected_fruit do %>
              <p>You selected: <span class="font-semibold">{@selected_fruit}</span></p>
            <% end %>
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Country Selector</h2>

          <.select
            :let={builder}
            id="country-select"
            value={@selected_country}
            name="country"
            on_value_changed="handle_country_select"
          >
            <.select_trigger class="w-[180px]">
              <.select_value placeholder="Select your country" />
            </.select_trigger>
            <.select_content builder={builder}>
              <.select_group>
                <.select_label>Americas</.select_label>
                <.select_item value="us">United States</.select_item>
                <.select_item value="ca">Canada</.select_item>
                <.select_item value="mx">Mexico</.select_item>
                <.select_separator />
                <.select_label>Europe</.select_label>
                <.select_item value="uk">United Kingdom</.select_item>
                <.select_item value="fr">France</.select_item>
                <.select_item value="de">Germany</.select_item>
              </.select_group>
            </.select_content>
          </.select>

          <div class="mt-4">
            <%= if @selected_country do %>
              <p>Country selected: <span class="font-semibold">{@selected_country}</span></p>
            <% end %>
          </div>
        </div>
        <div class="mt-8">
          <.select
            :let={builder}
            id="skills-select"
            name="skills"
            multiple={true}
            value={@selected_skills}
            on_value_changed="handle_skills_select"
          >
            <.select_trigger>
              <.select_value placeholder="Select skills" />
            </.select_trigger>
            <.select_content builder={builder}>
              <.select_group>
                <.select_label>Programming</.select_label>
                <.select_item value="javascript">JavaScript</.select_item>
                <.select_item value="python">Python</.select_item>
                <.select_item value="elixir">Elixir</.select_item>
              </.select_group>
            </.select_content>
          </.select>
        </div>
      </div>

      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-4">Form Example</h2>

        <form phx-change="form_changed" phx-submit="submit_form" class="max-w-sm">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Favorite Fruit</label>
            <.select
              :let={builder}
              id="form-fruit-select"
              name="favorite_fruit"
              value={@selected_fruit}
            >
              <.select_trigger>
                <.select_value placeholder="Choose a fruit" />
              </.select_trigger>
              <.select_content builder={builder}>
                <.select_item value="apple">Apple</.select_item>
                <.select_item value="banana">Banana</.select_item>
                <.select_item value="orange">Orange</.select_item>
                <.select_item value="strawberry">Strawberry</.select_item>
              </.select_content>
            </.select>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Country</label>
            <.select :let={builder} id="form-country-select" name="country" value={@selected_country}>
              <.select_trigger>
                <.select_value placeholder="Select a country" />
              </.select_trigger>
              <.select_content builder={builder}>
                <.select_item value="us">United States</.select_item>
                <.select_item value="ca">Canada</.select_item>
                <.select_item value="uk">United Kingdom</.select_item>
              </.select_content>
            </.select>
          </div>

          <div class="mb-4 text-sm">
            <p>Current form values (updated live with phx-change):</p>
            <pre class="mt-2 p-2 bg-gray-100 rounded"><%= Jason.encode!(Map.take(assigns, [:form_data]), pretty: true) %></pre>
          </div>

          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">
            Submit
          </button>
        </form>
      </div>
    </div>
    """
  end

  def handle_event("handle_fruit_select", %{"value" => value}, socket) do
    {:noreply, assign(socket, :selected_fruit, value)}
  end

  def handle_event("handle_country_select", %{"value" => value}, socket) do
    {:noreply, assign(socket, :selected_country, value)}
  end

  def handle_event("handle_skills_select", %{"value" => value}, socket) do
    {:noreply, assign(socket, :selected_skills, value)}
  end

  def handle_event("form_changed", params, socket) do
    # Update the form data in the socket assigns
    {:noreply, assign(socket, :form_data, params)}
  end

  def handle_event("submit_form", params, socket) do
    # Process the form submission with the selected values
    IO.inspect(params, label: "Form Submission")
    {:noreply, put_flash(socket, :info, "Form submitted successfully!")}
  end
end
