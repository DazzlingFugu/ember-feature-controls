import { module, test } from "qunit"
import { setupApplicationTest } from "ember-qunit"
import { visit, click } from "@ember/test-helpers"
import config from "dummy/config/environment"
import { _resetStorages } from "ember-local-storage/helpers/storage"
import windowUtil from "ember-feature-controls/utils/window"

const baseConfig = config.featureControls

const originalWindowReload = windowUtil.reload

module("Acceptance | local storage env", function(hooks) {
  setupApplicationTest(hooks)

  hooks.beforeEach(function() {
    windowUtil.reload = function() {}
  })

  hooks.afterEach(function() {
    windowUtil.reload = originalWindowReload
    config.featureControls = baseConfig
    window.localStorage.clear()
    _resetStorages()
  })

  test("it saves to local storage when specified in config", async function(assert) {
    config.featureControls.useLocalStorage = true
    await visit("/__features")
    await click("[data-test-checkbox-flag=showBacon]")
    assert.equal(
      window.localStorage.getItem("storage:feature-controls"),
      '{"showBacon":true}',
      "local storage has an item"
    )
  })

  test("it does not save to local storage when specified in config", async function(assert) {
    config.featureControls.useLocalStorage = false
    await visit("/__features")
    await click("[data-test-checkbox-flag=showBacon]")
    assert.equal(
      window.localStorage.getItem("storage:feature-controls"),
      null,
      "local storage is empty"
    )
  })
})
