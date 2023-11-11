import { module, test } from 'qunit'
import { setupApplicationTest } from 'dummy/tests/helpers'
import { click, visit } from '@ember/test-helpers'
import config from 'dummy/config/environment'
import resetStorages from 'ember-local-storage/test-support/reset-storage'
import windowUtil from 'ember-feature-controls/utils/window'

const baseConfig = config.featureControls

const originalWindowReload = windowUtil.reload

module('Acceptance | local storage env', function (hooks) {
  setupApplicationTest(hooks)

  hooks.beforeEach(function () {
    windowUtil.reload = function () {}
  })

  hooks.afterEach(function () {
    windowUtil.reload = originalWindowReload
    config.featureControls = baseConfig

    window.localStorage?.clear()
    window.sessionStorage?.clear()

    resetStorages()
  })

  test('it saves to local storage when specified in config', async function (assert) {
    config.featureControls.useLocalStorage = true

    await visit('/__features')

    await click('[data-test-checkbox-flag=showBacon]')

    assert.strictEqual(
      window.localStorage.getItem('storage:feature-controls'),
      '{"showBacon":true}',
      'local storage has an item',
    )
  })

  test('it does not save to local storage when specified in config', async function (assert) {
    config.featureControls.useLocalStorage = false

    await visit('/__features')

    await click('[data-test-checkbox-flag=showBacon]')

    assert.strictEqual(
      window.localStorage.getItem('storage:feature-controls'),
      '{}',
      'local storage is empty',
    )
  })
})
