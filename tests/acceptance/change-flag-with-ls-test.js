import { module, test } from 'qunit'
import { visit, click } from '@ember/test-helpers'
import { setupApplicationTest } from 'dummy/tests/helpers'
import resetStorages from 'ember-local-storage/test-support/reset-storage'
import { initialize } from 'ember-feature-controls/instance-initializers/load-feature-controls'
import config from 'dummy/config/environment'
import windowUtil from 'ember-feature-controls/utils/window'

const baseConfig = config.featureControls

const originalWindowReload = windowUtil.reload

// Simulates the instructions done at page reload
const reloadPage = function (appInstance) {
  const features = appInstance.lookup('service:features')
  Object.keys(config.featureFlags).forEach((flag) => {
    config.featureFlags[flag] ? features.enable(flag) : features.disable(flag)
  })
  initialize(appInstance)
}

module('Acceptance | change flag (with localStorage)', function (hooks) {
  setupApplicationTest(hooks)

  hooks.beforeEach(function () {
    windowUtil.reload = function () {}
    config.featureControls.useLocalStorage = true
    reloadPage(this.owner)
  })

  hooks.afterEach(function () {
    windowUtil.reload = originalWindowReload
    config.featureControls = baseConfig
    if (window.localStorage) {
      window.localStorage.clear()
    }
    if (window.sessionStorage) {
      window.sessionStorage.clear()
    }
    resetStorages()
  })

  test('with localStorage | it persists the changes when loading another URL', async function (assert) {
    await visit('/__features')
    await click('[data-test-checkbox-flag=showBacon]')
    reloadPage(this.owner)
    await visit('/')
    assert.dom('img[alt="bear"]').exists()
    assert.dom('img[alt="bacon"]').exists()
    await visit('/__features')
    await click('[data-test-checkbox-flag=showBear]')
    reloadPage(this.owner)
    await visit('/')
    assert.dom('img[alt="bear"]').doesNotExist()
    assert.dom('img[alt="bacon"]').exists()
  })

  test('with localStorage | it persists the flags when reloading after a refresh', async function (assert) {
    await visit('/__features')
    await click('[data-test-checkbox-flag=showBacon]')
    await click('[data-test-button-refresh]')
    await visit('/')
    reloadPage(this.owner)
    await visit('/__features')
    assert.dom('[data-test-label-flag=showBacon]').hasText('❗')
  })

  test('with localStorage | it persists the flags when reloading after a reset', async function (assert) {
    await visit('/__features')
    await click('[data-test-checkbox-flag=showBear]')
    await click('[data-test-checkbox-flag=showBacon]')
    await click('[data-test-button-reset]')
    await visit('/')
    reloadPage(this.owner)
    await visit('/__features')
    assert.dom('[data-test-label-flag=showBear]').hasText('')
    assert.dom('[data-test-label-flag=showBacon]').hasText('')
  })

  test("with localStorage | it won't load unknown flags", async function (assert) {
    window.localStorage.setItem('storage:feature-controls', '{"fakeFlag":true}')
    await visit('/__features')
    assert
      .dom('[data-test-checkbox-flag=fakeFlag]')
      .doesNotExist('fakeFlag is not registered')
  })
})
