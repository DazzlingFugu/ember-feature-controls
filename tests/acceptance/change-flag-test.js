import { module, test } from 'qunit';
import { visit, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { _resetStorages } from 'ember-local-storage/helpers/storage';

module('Acceptance | change flag', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    window.localStorage.clear();
    _resetStorages();
  });

  test('changes feature flags', async function(assert) {
    await visit('/');
    assert.ok(find('img[alt="bear"]'));
    await visit('/__features');
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '');
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '');
    await click(find('[data-test-checkbox-flag=showBacon]'));
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '❗');
    await visit('/');
    assert.ok(find('img[alt="bear"]'));
    assert.ok(find('img[alt="bacon"]'));
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBear]'));
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '❗');
    await visit('/');
    assert.ok(find('img[alt="bacon"]'));
  });

  test('reset feature flags', async function(assert) {
    await visit('/');
    assert.ok(find('img[alt="bear"]'));
    await visit('/__features');
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '');
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '');
    await click(find('[data-test-checkbox-flag=showBear]'));
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '❗');
    await click(find('[data-test-checkbox-flag=showBacon]'));
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '❗');
    await visit('/');
    assert.ok(find('img[alt="bacon"]'));
    await visit('/__features');
    await click(find('[data-test-button-reset]'));
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '');
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '');
    await visit('/');
    assert.ok(find('img[alt="bear"]'));
  });

  test('change a feature flag and refresh the page persists the flags', async function(assert) {
    await visit('/');
    assert.ok(find('img[alt="bear"]'));

    await visit('/__features');
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '');
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '');

    await click(find('[data-test-checkbox-flag=showBear]'));
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '❗');

    await visit('/');
    assert.notOk(find('img[alt="bear"]'));

    await click('[data-test-link]');
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '❗');
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '');
  })
});
