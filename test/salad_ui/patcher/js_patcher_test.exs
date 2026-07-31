defmodule SaladUI.Patcher.JSPatcherTest do
  use ExUnit.Case

  alias SaladUI.Patcher.JSPatcher

  describe "patch_js/3" do
    test "adds imports after the last import and registers hooks" do
      js_content = """
      import {Socket} from \"phoenix\";
      import {LiveSocket} from \"phoenix_live_view\";

      let liveSocket = new LiveSocket(\"/live\", Socket, {params: {_csrf_token: csrfToken}})
      """

      import_content = "import SaladUI from \"salad_ui\";\n"
      hooks = "SaladUI: SaladUI.SaladUIHook"

      patched_content = JSPatcher.patch_js(js_content, import_content, hooks)

      assert patched_content =~ ~s(import {LiveSocket} from "phoenix_live_view";\nimport SaladUI from "salad_ui";)
      assert patched_content =~ "hooks: { SaladUI: SaladUI.SaladUIHook }"
    end

    test "adds hooks to existing hooks object without duplicating existing hook" do
      js_content = """
      import {LiveSocket} from \"phoenix_live_view\";

      let liveSocket = new LiveSocket(\"/live\", Socket, {
        hooks: {Existing: ExistingHook}
      })
      """

      patched_content = JSPatcher.patch_js(js_content, "", "SaladUI: SaladUI.SaladUIHook")
      repatched_content = JSPatcher.patch_js(patched_content, "", "SaladUI: SaladUI.SaladUIHook")

      assert patched_content =~ "Existing: ExistingHook"
      assert patched_content =~ "SaladUI: SaladUI.SaladUIHook"
      assert repatched_content == patched_content
    end
  end
end
