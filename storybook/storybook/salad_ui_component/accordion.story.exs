defmodule Storybook.SaladUIComponents.Accordion do
  @moduledoc false
  use PhoenixStorybook.Story, :component

  def function, do: &SaladUI.Accordion.accordion/1

  def imports,
    do: [
      {SaladUI.Accordion, [accordion_item: 1, accordion_trigger: 1, accordion_content: 1]},
      {SaladUI.Button, [button: 1]},
      {SaladUI.Input, input: 1},
      {SaladUI.Label, [label: 1]},
      {SaladUI.Checkbox, [checkbox: 1]}
    ]

  def variations do
    [
      %Variation{
        id: :single_accordion,
        attributes: %{
          id: "faq-accordion",
          type: "single",
          "default-value": "item-1"
        },
        description: "A single-type accordion where only one item can be open at a time",
        slots: [
          """
          <.accordion_item value="item-1">
            <.accordion_trigger>
              Is it accessible?
            </.accordion_trigger>
            <.accordion_content>
              Yes. It adheres to the WAI-ARIA design pattern.
            </.accordion_content>
          </.accordion_item>
          <.accordion_item value="item-2">
            <.accordion_trigger>
              Is it styled?
            </.accordion_trigger>
            <.accordion_content>
              Yes. It comes with default styles that matches the other components' aesthetic.
            </.accordion_content>
          </.accordion_item>
          <.accordion_item value="item-3">
            <.accordion_trigger>
              Is it animated?
            </.accordion_trigger>
            <.accordion_content>
              Yes. It's animated by default, but you can disable it if you prefer.
            </.accordion_content>
          </.accordion_item>
          """
        ]
      },
      %Variation{
        id: :multiple_accordion,
        attributes: %{
          id: "multi-accordion",
          type: "multiple",
          "default-value": ["item-1", "item-3"]
        },
        description: "A multiple-type accordion where multiple items can be open simultaneously",
        slots: [
          """
          <.accordion_item value="item-1">
            <.accordion_trigger>
              First Item
            </.accordion_trigger>
            <.accordion_content>
              Content for the first item. Multiple items can be open at once.
            </.accordion_content>
          </.accordion_item>
          <.accordion_item value="item-2">
            <.accordion_trigger>
              Second Item
            </.accordion_trigger>
            <.accordion_content>
              Content for the second item.
            </.accordion_content>
          </.accordion_item>
          <.accordion_item value="item-3">
            <.accordion_trigger>
              Third Item
            </.accordion_trigger>
            <.accordion_content>
              Content for the third item.
            </.accordion_content>
          </.accordion_item>
          """
        ]
      },
      %Variation{
        id: :disabled_accordion,
        attributes: %{
          id: "disabled-accordion",
          type: "single",
          disabled: true
        },
        description: "A disabled accordion where no items can be interacted with",
        slots: [
          """
          <.accordion_item value="item-1">
            <.accordion_trigger>
              Disabled Item 1
            </.accordion_trigger>
            <.accordion_content>
              This content cannot be accessed because the accordion is disabled.
            </.accordion_content>
          </.accordion_item>
          <.accordion_item value="item-2">
            <.accordion_trigger>
              Disabled Item 2
            </.accordion_trigger>
            <.accordion_content>
              This content cannot be accessed because the accordion is disabled.
            </.accordion_content>
          </.accordion_item>
          """
        ]
      },
      %Variation{
        id: :partial_disabled_accordion,
        attributes: %{
          id: "partial-disabled-accordion",
          type: "single"
        },
        description: "An accordion with some disabled items",
        slots: [
          """
          <.accordion_item value="item-1">
            <.accordion_trigger>
              Regular Item
            </.accordion_trigger>
            <.accordion_content>
              This is a regular item that can be expanded/collapsed.
            </.accordion_content>
          </.accordion_item>
          <.accordion_item value="item-2" disabled>
            <.accordion_trigger>
              Disabled Item
            </.accordion_trigger>
            <.accordion_content>
              This item is disabled and cannot be interacted with.
            </.accordion_content>
          </.accordion_item>
          <.accordion_item value="item-3">
            <.accordion_trigger>
              Another Regular Item
            </.accordion_trigger>
            <.accordion_content>
              This is another regular item that can be expanded/collapsed.
            </.accordion_content>
          </.accordion_item>
          """
        ]
      },
      %Variation{
        id: :with_form,
        description:
          "An accordion containing a form to demonstrate complex interactive content handling and accessibility.",
        attributes: %{
          id: "form-accordion",
          type: "single",
          "default-value": "personal-info"
        },
        slots: [
          """
          <.accordion_item value="personal-info">
            <.accordion_trigger>
              Personal Information
            </.accordion_trigger>
            <.accordion_content>
              <.form for={%{}} as={:user} phx-submit="save_personal_info" class="space-y-4 py-2">
                <div class="space-y-2">
                  <.label for="user_name">Full Name</.label>
                  <.input id="user_name" name="user[name]" type="text" />
                </div>
                <div class="space-y-2">
                  <.label for="user_email">Email Address</.label>
                  <.input id="user_email" name="user[email]" type="email" />
                </div>
                <div class="space-y-2">
                  <.label for="user_phone">Phone Number</.label>
                  <.input id="user_phone" name="user[phone]" type="tel" />
                </div>
                <.button type="submit">Save Personal Info</.button>
              </.form>
            </.accordion_content>
          </.accordion_item>

          <.accordion_item value="address">
            <.accordion_trigger>
              Address Information
            </.accordion_trigger>
            <.accordion_content>
              <.form for={%{}} as={:address} phx-submit="save_address" class="space-y-4 py-2">
                <div class="space-y-2">
                  <.label for="address_street">Street Address</.label>
                  <.input id="address_street" name="address[street]" type="text" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <.label for="address_city">City</.label>
                    <.input id="address_city" name="address[city]" type="text" />
                  </div>
                  <div class="space-y-2">
                    <.label for="address_state">State/Province</.label>
                    <.input id="address_state" name="address[state]" type="text" />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <.label for="address_zip">Postal Code</.label>
                    <.input id="address_zip" name="address[zip]" type="text" />
                  </div>
                  <div class="space-y-2">
                    <.label for="address_country">Country</.label>
                    <.input id="address_country" name="address[country]" type="text" />
                  </div>
                </div>
                <div class="pt-2">
                  <.checkbox id="address_primary" name="address[primary]" label="Set as primary address" />
                </div>
                <.button type="submit">Save Address</.button>
              </.form>
            </.accordion_content>
          </.accordion_item>

          <.accordion_item value="preferences" disabled={true}>
            <.accordion_trigger>
              Preferences (Disabled)
            </.accordion_trigger>
            <.accordion_content>
              This section is disabled and cannot be accessed.
            </.accordion_content>
          </.accordion_item>
          """
        ]
      }
    ]
  end
end
