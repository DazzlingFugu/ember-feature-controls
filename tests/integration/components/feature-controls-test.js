import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { camelize } from '@ember/string';
import { _resetStorages } from 'ember-local-storage/helpers/storage';

const featuresMock = function(assert) { // eslint-disable-line no-unused-vars
  return {
    flags: [camelize('flag-true'), camelize('flag-false')],
    isEnabled(key) {
      return key === camelize('flag-true');
    },
    _normalizeFlag(key) {
      return camelize(key);
    },
    disable() {
      assert.ok(true);
    },
    enable() {
      assert.ok(true);
    }
  };
};

const featureFlags = {
  'flag-true': true,
  'flag-false': false
};

const storageMock = function(assert) {
  return {
    reset() {
      assert.ok(true)
    }
  }
}

module('Integration | Component | feature-controls', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    window.localStorage.clear();
    _resetStorages();
  });

  test('it renders multiple flags', async function(assert) {
    this.setProperties({
      features: featuresMock(assert),
      featureFlags,
      savedConf: storageMock(assert)
    });
    await render(
      hbs`{{feature-controls features=features featureFlags=featureFlags savedConf=savedConf}}`
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
      featureFlags,
      savedConf: storageMock(assert)
    });
    await render(hbs`{{feature-controls showRefresh=false showReset=false savedConf=savedConf}}`);
    assert.notOk(this.element.querySelector('[data-test-button-refresh]'));
    assert.notOk(this.element.querySelector('[data-test-button-reset]'));
  });

  test('it changes feature flags', async function(assert) {
    // 2 assertions are enable and disable functions from featuresMock
    assert.expect(10);

    this.setProperties({
      features: featuresMock(assert),
      featureFlags,
      savedConf: storageMock(assert)
    });
    await render(
      hbs`{{feature-controls features=features featureFlags=featureFlags savedConf=savedConf}}`
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
    assert.expect(9);

    this.setProperties({
      features: featuresMock(assert),
      featureFlags,
      savedConf: storageMock(assert)
    });

    await render(
      hbs`{{feature-controls features=features featureFlags=featureFlags savedConf=savedConf}}`
    );
    await click('[data-test-checkbox-flag="flagTrue"]');
    assert.notOk(
      this.element.querySelector('[data-test-checkbox-flag="flagTrue"]').checked
    );
    await click('[data-test-checkbox-flag="flagFalse"]');
    assert.ok(
      this.element.querySelector('[data-test-checkbox-flag="flagFalse"]')
        .checked
    );

    await click('[data-test-button-reset]');

    assert.ok(
      this.element.querySelector('[data-test-checkbox-flag="flagTrue"]').checked
    );
    assert.notOk(
      this.element.querySelector('[data-test-checkbox-flag="flagFalse"]')
        .checked
    );
  });

  test('pressing refresh updates the model', async function(assert) {
    this.setProperties({
      features: featuresMock(assert),
      featureFlags,
      savedConf: storageMock(assert)
    });
    await render(
      hbs`{{feature-controls features=features featureFlags=featureFlags savedConf=savedConf}}`
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

  test('changing a feature flag and clicking the refresh button persists the changes', async function(assert) {
    this.setProperties({
      features: featuresMock(assert),
      featureFlags,
      savedConf: storageMock(assert)
    });

    await render(
      hbs`{{feature-controls features=features featureFlags=featureFlags savedConf=savedConf}}`
    );

    await click('[data-test-checkbox-flag="flagFalse"]');

    assert.ok(
      this.element.querySelector('[data-test-checkbox-flag="flagFalse"]')
          .checked
    );

    await click('[data-test-button-refresh]');

    assert.ok(
      this.element.querySelector('[data-test-checkbox-flag="flagFalse"]')
          .checked
    );
  })
});
