import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { camelize } from '@ember/string';
import { _resetStorages } from 'ember-local-storage/helpers/storage';

const featuresMock = function(assert) {
  return {
    flags: [camelize('flag-true'), camelize('flag-false')],
    isEnabled(key) {
      return key === camelize('flag-true');
    },
    _normalizeFlag(key) {
      return camelize(key);
    },
    disable() {
      assert.ok(true, 'featuresMock.disable() called');
    },
    enable() {
      assert.ok(true, 'featuresMock.enable() called');
    }
  };
};

const featureFlags = {
  'flag-true': true,
  'flag-false': false
};

const featureControls = {
  useLocalStorage: false,
  metadata: [
    {
      key: 'flag-true',
      description: 'Show a bear'
    },
    {
      key: 'flag-false',
      description: 'Show some bacon'
    }
  ]
}

const storageMock = function(assert) {
  return {
    reset() {
      assert.ok(true, 'storageMock.reset() called');
    }
  }
}

module('Integration | Component | feature-controls', function(hooks) {
  setupRenderingTest(hooks);

  hooks.afterEach(function() {
    window.localStorage.clear();
    _resetStorages();
  });

  test('it renders multiple flags', async function(assert) {
    this.setProperties({
      features: featuresMock(assert),
      featureControls,
      featureFlags,
      featuresLS: storageMock(assert)
    });
    await render(
      hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags featuresLS=featuresLS}}`
    );
    assert.ok(this.element.querySelector('table'));
    assert.equal(this.element.querySelectorAll('tbody tr').length, 2);
  });

  test('it renders with reset and refresh button by default', async function(assert) {
    this.setProperties({
      features: featuresMock(assert),
      featureFlags
    });
    await render(hbs`{{feature-controls}}`);
    assert.ok(this.element.querySelector('[data-test-button-refresh]'));
    assert.ok(this.element.querySelector('[data-test-button-reset]'));
  });

  test('it does not render reset and refresh button when specified', async function(assert) {
    this.setProperties({
      features: featuresMock(assert),
      featureControls,
      featureFlags,
      featuresLS: storageMock(assert)
    });
    await render(hbs`{{feature-controls featureControls=featureControls showRefresh=false showReset=false featuresLS=featuresLS}}`);
    assert.notOk(this.element.querySelector('[data-test-button-refresh]'));
    assert.notOk(this.element.querySelector('[data-test-button-reset]'));
  });

  test('it changes feature flags', async function(assert) {
    // 2 assertions are enable and disable functions from featuresMock
    assert.expect(10);

    this.setProperties({
      features: featuresMock(assert),
      featureControls,
      featureFlags,
      featuresLS: storageMock(assert)
    });
    await render(
      hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags featuresLS=featuresLS}}`
    );
    assert.ok(
      this.element.querySelector('[data-test-checkbox-flag="flagTrue"]').checked
    );
    assert.notOk(
      this.element.querySelector('[data-test-checkbox-flag="flagFalse"]')
        .checked
    );
    assert.equal(
      this.element
        .querySelector('[data-test-label-flag="flagTrue"]')
        .textContent.trim(),
      ''
    );
    assert.equal(
      this.element
        .querySelector('[data-test-label-flag="flagFalse"]')
        .textContent.trim(),
      ''
    );
    await click('[data-test-checkbox-flag="flagTrue"]');
    assert.notOk(
      this.element.querySelector('[data-test-checkbox-flag="flagTrue"]').checked
    );
    assert.equal(
      this.element
        .querySelector('[data-test-label-flag="flagTrue"]')
        .textContent.trim(),
      '❗'
    );
    await click('[data-test-checkbox-flag="flagFalse"]');
    assert.ok(
      this.element.querySelector('[data-test-checkbox-flag="flagFalse"]')
        .checked
    );
    assert.equal(
      this.element
        .querySelector('[data-test-label-flag="flagFalse"]')
        .textContent.trim(),
      '❗'
    );
  });

  test('pressing the reset button rolls back to default state', async function(assert) {
    // 2 assert are called from featuresMock
    assert.expect(8);
    this.setProperties({
      features: featuresMock(assert),
      featureControls,
      featureFlags,
      featuresLS: storageMock(assert)
    });
    await render(hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags featuresLS=featuresLS}}`);

    await click('[data-test-checkbox-flag="flagTrue"]');
    await click('[data-test-checkbox-flag="flagFalse"]');
    assert.notOk(this.element.querySelector('[data-test-checkbox-flag="flagTrue"]').checked, 'flagTrue should not be checked');
    assert.ok(this.element.querySelector('[data-test-checkbox-flag="flagFalse"]').checked, 'flagFalse should be checked');

    await click('[data-test-button-reset]');
    assert.ok(this.element.querySelector('[data-test-checkbox-flag="flagTrue"]').checked, 'flagTrue should be checked after reset');
    assert.notOk(this.element.querySelector('[data-test-checkbox-flag="flagFalse"]').checked, 'flagFalse should not be checked after reset');
  });

  test('pressing refresh updates the model', async function(assert) {
    this.setProperties({
      features: featuresMock(assert),
      featureControls,
      featureFlags,
      featuresLS: storageMock(assert)
    });
    await render(
      hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags featuresLS=featuresLS}}`
    );
    assert.ok(
      this.element.querySelector('[data-test-checkbox-flag="flagTrue"]').checked
    );
    assert.equal(
      this.element
        .querySelector('[data-test-label-flag="flagTrue"]')
        .textContent.trim(),
      ''
    );
    assert.notOk(
      this.element.querySelector('[data-test-checkbox-flag="flagFalse"]')
        .checked
    );
    assert.equal(
      this.element
        .querySelector('[data-test-label-flag="flagFalse"]')
        .textContent.trim(),
      ''
    );

    this.set('featureFlags', {
      'flag-true': false,
      'flag-false': true
    });

    await click('[data-test-button-refresh]');
    assert.ok(
      this.element.querySelector('[data-test-checkbox-flag="flagTrue"]').checked
    );
    assert.equal(
      this.element
        .querySelector('[data-test-label-flag="flagTrue"]')
        .textContent.trim(),
      '❗'
    );
    assert.notOk(
      this.element.querySelector('[data-test-checkbox-flag="flagFalse"]')
        .checked
    );
    assert.equal(
      this.element
        .querySelector('[data-test-label-flag="flagFalse"]')
        .textContent.trim(),
      '❗'
    );
  });

});
