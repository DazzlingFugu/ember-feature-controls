import { module, test, assert } from 'qunit'
import { setupRenderingTest } from 'dummy/tests/helpers'
import { click, render } from '@ember/test-helpers'
import { hbs } from 'ember-cli-htmlbars'
import { camelize } from '@ember/string'
import resetStorages from 'ember-local-storage/test-support/reset-storage'
import Service from '@ember/service'

class MockFeatureService extends Service {
  flags = [camelize('flag-true'), camelize('flag-false')]
  isEnabled(key) {
    return key === camelize('flag-true')
  }
  _normalizeFlag(key) {
    return camelize(key)
  }
  disable() {
    assert.ok(true, 'featuresMock.disable() called')
  }
  enable() {
    assert.ok(true, 'featuresMock.enable() called')
  }
}

class MockStorageService extends Service {
  featuresLS = {
    reset() {
      assert.ok(true, 'storageMock.reset() called')
    },
  }
}

const testProperties = {
  featureControls: {
    useLocalStorage: false,
    metadata: [
      {
        key: 'flag-true',
        description: 'Flag True',
      },
      {
        key: 'flag-false',
        description: 'Flag False',
      },
      {
        key: 'flag-hide',
        description: 'Flag Hide',
        hide: true,
      },
    ],
  },
  featureFlags: {
    'flag-true': true,
    'flag-false': false,
    'flag-hide': false,
  },
}

module('Integration | Component | feature-controls', function (hooks) {
  setupRenderingTest(hooks)

  hooks.beforeEach(function () {
    this.owner.unregister('service:features')
    this.owner.register('service:features', MockFeatureService)

    this.owner.unregister('service:feature-controls-storage')
    this.owner.register('service:feature-controls-storage', MockStorageService)

    this.setProperties(testProperties)
  })

  hooks.afterEach(function () {
    window.localStorage?.clear()
    window.sessionStorage?.clear()

    resetStorages()
  })

  test('it renders with reset and refresh button by default', async function (assert) {
    await render(hbs`<FeatureControls />`)

    assert.dom('[data-test-button-refresh]').exists()
    assert.dom('[data-test-button-reset]').exists()
  })

  test('it does not render reset and refresh button when specified', async function (assert) {
    await render(hbs`<FeatureControls @showRefresh={{false}} @showReset={{false}} />`)

    assert.dom('[data-test-button-refresh]').doesNotExist()
    assert.dom('[data-test-button-reset]').doesNotExist()
  })

  test('it renders multiple flags', async function (assert) {
    await render(
      hbs`<FeatureControls @featureControls={{this.featureControls}} @featureFlags={{this.featureFlags}} />`,
    )

    assert.dom('table').exists('there should be a table element')

    assert.dom('tbody tr').exists({ count: 2 }, 'the table should contain 2 lines')

    assert.dom('[data-test-checkbox-flag="flagTrue"]').isChecked('flagTrue should be checked')

    assert
      .dom('[data-test-checkbox-flag="flagFalse"]')
      .isNotChecked('flagFalse should be unchecked')

    assert.dom('[data-test-checkbox-flag="flagHide"]').doesNotExist('flagFalse is not rendered')

    assert.dom('[data-test-label-flag="flagTrue"]').hasText('', "flagTrue's label should be empty")

    assert
      .dom('[data-test-label-flag="flagFalse"]')
      .hasText('', "flagFalse's label should be empty")

    assert.dom('[data-test-label-flag="flagHide"]').doesNotExist("flagHide's label is not rendered")
  })

  test('it changes flags : 1 more assertion called when a flag is enabled', async function (assert) {
    await render(
      hbs`<FeatureControls @featureControls={{this.featureControls}} @featureFlags={{this.featureFlags}} />`,
    )

    await click('[data-test-checkbox-flag="flagFalse"]')

    assert
      .dom('[data-test-checkbox-flag="flagFalse"]')
      .isChecked('flagFalse should be checked after click')

    assert
      .dom(this.element.querySelector('[data-test-label-flag="flagFalse"]'))
      .hasText('❗', "flagFalse's label should have a content")
  })

  test('it changes flags : 1 more assertion called when a flag is disabled', async function (assert) {
    await render(
      hbs`<FeatureControls @featureControls={{this.featureControls}} @featureFlags={{this.featureFlags}} />`,
    )

    await click('[data-test-checkbox-flag="flagTrue"]')

    assert
      .dom('[data-test-checkbox-flag="flagTrue"]')
      .isNotChecked('flagTrue should be unchecked after click')

    assert
      .dom('[data-test-label-flag="flagTrue"]')
      .hasText('❗', "flagTrue's label should have a content")
  })

  test('without localStorage | it resets the flag at click on reset button : enable flag x1, disable flag x2', async function (assert) {
    await render(
      hbs`<FeatureControls @featureControls={{this.featureControls}} @featureFlags={{this.featureFlags}} />`,
    )

    await click('[data-test-checkbox-flag="flagTrue"]')
    await click('[data-test-button-reset]')

    assert
      .dom('[data-test-checkbox-flag="flagTrue"]')
      .isChecked('flagTrue should be checked after reset')
  })

  test('with localStorage | it resets the flag at click on reset button : enable flag x1, disable flag x2, reset storage x1', async function (assert) {
    this.set('featureControls.useLocalStorage', true)

    await render(
      hbs`<FeatureControls @featureControls={{this.featureControls}} @featureFlags={{this.featureFlags}} />`,
    )

    await click('[data-test-checkbox-flag="flagTrue"]')
    await click('[data-test-button-reset]')

    assert
      .dom('[data-test-checkbox-flag="flagTrue"]')
      .isChecked('flagTrue should be checked after reset')
  })

  test('it updates the model at click on refresh', async function (assert) {
    await render(
      hbs`<FeatureControls @featureControls={{this.featureControls}} @featureFlags={{this.featureFlags}} />`,
    )

    this.set('featureFlags', {
      'flag-true': false,
      'flag-false': true,
    })

    await click('[data-test-button-refresh]')

    assert
      .dom('[data-test-checkbox-flag="flagTrue"]')
      .isChecked('flagTrue should be checked after refresh')

    assert.dom('[data-test-label-flag="flagTrue"]').hasText('❗')

    assert
      .dom('[data-test-checkbox-flag="flagFalse"]')
      .isNotChecked('flagFalse should be checked after refresh')

    assert.dom('[data-test-label-flag="flagFalse"]').hasText('❗')
  })
})
