import { module, test } from 'qunit';
import { visit, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { _resetStorages } from 'ember-local-storage/helpers/storage';

module('Acceptance | change flag', function(hooks) {
  setupApplicationTest(hooks);

  hooks.afterEach(function() {
    window.localStorage.clear();
    _resetStorages();
  });

  test('it initializes the app with bear on and bacon off', async function(assert) {
    await visit('/');
    assert.ok(find('img[alt="bear"]'));
    assert.notOk(find('img[alt="bacon"]'));
    await visit('/__features');
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '');
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '');
  });

  test('it changes feature flags', async function(assert) {
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBacon]'));
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '❗');
    await visit('/');
    assert.ok(find('img[alt="bear"]'));
    assert.ok(find('img[alt="bacon"]'));
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBear]'));
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '❗');
    await visit('/');
    assert.notOk(find('img[alt="bear"]'));
    assert.ok(find('img[alt="bacon"]'));
  });

  test('it resets feature flags', async function(assert) {
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBear]'));
    await click(find('[data-test-checkbox-flag=showBacon]'));
    await click(find('[data-test-button-reset]'));
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '');
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '');
    await visit('/');
    assert.ok(find('img[alt="bear"]'));
    assert.notOk(find('img[alt="bacon"]'));
  });

  test('it persists the flags when clicking on refresh button', async function(assert) {
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBacon]'));
    await click(find('[data-test-button-refresh]'));
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '❗');
    await visit('/');
    assert.ok(find('img[alt="bacon"]'));
  });

  test('it persists the flags when refreshing the page', async function(assert) {
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBear]'));
    await visit('/');
    assert.notOk(find('img[alt="bear"]'));
    await click('[data-test-link]');
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '❗');
  });

});
