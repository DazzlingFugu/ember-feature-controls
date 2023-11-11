import { module, test } from 'qunit'
import { click, visit } from '@ember/test-helpers'
import { setupApplicationTest } from 'dummy/tests/helpers'
import resetStorages from 'ember-local-storage/test-support/reset-storage'
import windowUtil from 'ember-feature-controls/utils/window'

const originalWindowReload = windowUtil.reload

module('Acceptance | change flag', function (hooks) {
  setupApplicationTest(hooks)

  hooks.beforeEach(function () {
    windowUtil.reload = function () {}
  })

  hooks.afterEach(function () {
    windowUtil.reload = originalWindowReload

    window.localStorage?.clear()
    window.sessionStorage?.clear()

    resetStorages()
  })

  test('it initializes the app with bear on and bacon off', async function (assert) {
    await visit('/')

    assert.dom('img[alt="bear"]').exists()
    assert.dom('img[alt="bacon"]').doesNotExist()

    await visit('/__features')

    assert.dom('[data-test-label-flag=showBear]').hasText('')
    assert.dom('[data-test-label-flag=showBacon]').hasText('')
  })

  test('it changes feature flags', async function (assert) {
    await visit('/__features')

    await click('[data-test-checkbox-flag=showBear]')

    assert.dom('[data-test-label-flag=showBear]').hasText('❗')

    await click('[data-test-checkbox-flag=showBacon]')

    assert.dom('[data-test-label-flag=showBacon]').hasText('❗')
  })

  test('it persists the changes at link to another page', async function (assert) {
    await visit('/__features')

    await click('[data-test-checkbox-flag=showBacon]')
    await click('[data-test-link-index]')

    assert.dom('img[alt="bear"]').exists()
    assert.dom('img[alt="bacon"]').exists()

    await click('[data-test-link-features]')
    await click('[data-test-checkbox-flag=showBear]')
    await click('[data-test-link-index]')

    assert.dom('img[alt="bear"]').doesNotExist()
    assert.dom('img[alt="bacon"]').exists()
  })

  test('it persists the flags when clicking on refresh button', async function (assert) {
    await visit('/__features')

    await click('[data-test-checkbox-flag=showBacon]')
    await click('[data-test-button-refresh]')

    assert.dom('[data-test-label-flag=showBacon]').hasText('❗')
  })

  test('it resets feature flags when clicking on reset button', async function (assert) {
    await visit('/__features')

    await click('[data-test-checkbox-flag=showBear]')
    await click('[data-test-checkbox-flag=showBacon]')
    await click('[data-test-button-reset]')

    assert.dom('[data-test-label-flag=showBacon]').hasText('')
    assert.dom('[data-test-label-flag=showBacon]').hasText('')
  })

  test("it doesn't reload page when clicking on a not reloadable feature flag", async function (assert) {
    assert.expect(0)

    windowUtil.reload = function () {
      assert.ok(true, 'Reload function is called')
    }

    await visit('/__features')
    await click('[data-test-checkbox-flag=showBear]')
  })

  test('it reloads page when clicking on a reloadable feature flag', async function (assert) {
    windowUtil.reload = function () {
      assert.step('Reload function is called')
    }

    await visit('/__features')
    await click('[data-test-checkbox-flag=showBacon]')

    assert.verifySteps(['Reload function is called'])
  })
})
