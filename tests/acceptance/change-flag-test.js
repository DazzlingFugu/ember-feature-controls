import { module, test } from 'qunit';
import { visit, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | change flag', function(hooks) {
  setupApplicationTest(hooks);

  test('changes feature flags', async function(assert) {
    await visit('/');
    assert.ok(find('img[alt="bear"]'));
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBacon]'));
    await visit('/');
    assert.ok(find('img[alt="bear"]'));
    assert.ok(find('img[alt="bacon"]'));
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBear]'));
    await visit('/');
    assert.ok(find('img[alt="bacon"]'));
  });

  test('reset feature flags', async function(assert) {
    await visit('/');
    assert.ok(find('img[alt="bear"]'));
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBear]'));
    await click(find('[data-test-checkbox-flag=showBacon]'));
    await visit('/');
    assert.ok(find('img[alt="bacon"]'));
    await visit('/__features');
    await click(find('[data-test-button-reset]'));
    await visit('/');
    assert.ok(find('img[alt="bear"]'));
  });
});
