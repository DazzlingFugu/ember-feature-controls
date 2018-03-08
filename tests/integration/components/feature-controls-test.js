import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { camelize } from '@ember/string';

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

module('Integration | Component | feature-controls', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders multiple flags', async function(assert) {
    this.setProperties({
      features: featuresMock(assert),
      featureFlags
    });
    await render(
      hbs`{{feature-controls features=features featureFlags=featureFlags}}`
    );
    assert.ok(this.element.querySelector('table'));
    assert.equal(this.element.querySelectorAll('tbody tr').length, 2);
  });

  test('it changes feature flags', async function(assert) {
    // 2 assertions are enable and disable functions from featuresMock
    assert.expect(10);

    this.setProperties({
      features: featuresMock(assert),
      featureFlags
    });
    await render(
      hbs`{{feature-controls features=features featureFlags=featureFlags}}`
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
});
