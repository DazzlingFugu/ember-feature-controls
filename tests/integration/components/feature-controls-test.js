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

const testProperties = function(assert) {
  return {
    features: featuresMock(assert),
    featureControls,
    featureFlags,
    featuresLS: storageMock(assert)
  }
}

module('Integration | Component | feature-controls', function(hooks) {
  setupRenderingTest(hooks);

  hooks.afterEach(function() {
    window.localStorage.clear();
    _resetStorages();
  });

  test('it renders with reset and refresh button by default', async function(assert) {
    assert.expect(2);
    await render(hbs`{{feature-controls}}`);
    assert.ok(this.element.querySelector('[data-test-button-refresh]'));
    assert.ok(this.element.querySelector('[data-test-button-reset]'));
  });

  test('it does not render reset and refresh button when specified', async function(assert) {
    assert.expect(2);
    await render(hbs`{{feature-controls showRefresh=false showReset=false}}`);
    assert.notOk(this.element.querySelector('[data-test-button-refresh]'));
    assert.notOk(this.element.querySelector('[data-test-button-reset]'));
  });

  test('it renders multiple flags', async function(assert) {
    assert.expect(6);
    this.setProperties(testProperties(assert));
    await render(hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags}}`);
    assert.ok(this.element.querySelector('table'), 'there should be a table element');
    assert.equal(this.element.querySelectorAll('tbody tr').length, 2, 'the table should contain 2 lines');
    assert.ok(this.element.querySelector('[data-test-checkbox-flag="flagTrue"]').checked, 'flagTrue should be checked');
    assert.notOk(this.element.querySelector('[data-test-checkbox-flag="flagFalse"]').checked, 'flagFalse should be unchecked');
    assert.equal(this.element.querySelector('[data-test-label-flag="flagTrue"]').textContent.trim(), '', 'flagTrue\'s label should be empty');
    assert.equal(this.element.querySelector('[data-test-label-flag="flagFalse"]').textContent.trim(), '', 'flagFalse\'s label should be empty');
  });

  test('it changes flags : 1 more assertion called when a flag is enabled', async function(assert) {
    assert.expect(3);
    this.setProperties(testProperties(assert));
    await render(hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags featuresLS=featuresLS}}`);
    await click('[data-test-checkbox-flag="flagFalse"]');
    assert.ok(this.element.querySelector('[data-test-checkbox-flag="flagFalse"]').checked, 'flagFalse should be checked after click');
    assert.equal(this.element.querySelector('[data-test-label-flag="flagFalse"]').textContent.trim(), '❗', 'flagFalse\'s label should have a content');
  });

  test('it changes flags : 1 more assertion called when a flag is disabled', async function(assert) {
    assert.expect(3);
    this.setProperties(testProperties(assert));
    await render(hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags featuresLS=featuresLS}}`);
    await click('[data-test-checkbox-flag="flagTrue"]');
    assert.notOk(this.element.querySelector('[data-test-checkbox-flag="flagTrue"]').checked, 'flagTrue should be unchecked after click');
    assert.equal(this.element.querySelector('[data-test-label-flag="flagTrue"]').textContent.trim(), '❗', 'flagTrue\'s label should have a content');
  });

  test('without localStorage | it resets the flag at click on reset button : enable flag x1, disable flag x2', async function(assert) {
    assert.expect(4);
    this.setProperties(testProperties(assert));
    await render(hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags featuresLS=featuresLS}}`);
    await click('[data-test-checkbox-flag="flagTrue"]');
    await click('[data-test-button-reset]');
    assert.ok(this.element.querySelector('[data-test-checkbox-flag="flagTrue"]').checked, 'flagTrue should be checked after reset');
  });

  test('with localStorage | it resets the flag at click on reset button : enable flag x1, disable flag x2, reset storage x1', async function(assert) {
    assert.expect(5);
    this.setProperties(testProperties(assert));
    this.set('featureControls.useLocalStorage', true);
    await render(hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags featuresLS=featuresLS}}`);
    await click('[data-test-checkbox-flag="flagTrue"]');
    await click('[data-test-button-reset]');
    assert.ok(this.element.querySelector('[data-test-checkbox-flag="flagTrue"]').checked, 'flagTrue should be checked after reset');
  });

  test('it updates the model at click on refresh', async function(assert) {
    this.setProperties(testProperties(assert));
    await render(hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags}}`);
    this.set('featureFlags', {
      'flag-true': false,
      'flag-false': true
    });
    await click('[data-test-button-refresh]');
    assert.ok(this.element.querySelector('[data-test-checkbox-flag="flagTrue"]').checked);
    assert.equal(this.element.querySelector('[data-test-label-flag="flagTrue"]').textContent.trim(), '❗');
    assert.notOk(this.element.querySelector('[data-test-checkbox-flag="flagFalse"]').checked);
    assert.equal(this.element.querySelector('[data-test-label-flag="flagFalse"]').textContent.trim(), '❗');
  });

});
