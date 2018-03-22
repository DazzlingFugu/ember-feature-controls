import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { find, visit, click } from '@ember/test-helpers';
import config from 'dummy/config/environment';
import { _resetStorages } from 'ember-local-storage/helpers/storage';

let oldConfig = config.featureControls;

module('Acceptance | local storage env', function(hooks) {

  setupApplicationTest(hooks);

  hooks.afterEach(function() {
    config.featureControls = oldConfig;
    window.localStorage.clear();
    _resetStorages();
  });

  test('does save to local storage when specified in config', async function(assert) {
    config.featureControls.saveInLocalStorage = true;
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBacon]'));

    assert.equal(
      window.localStorage.getItem('storage:feature-controls'),
      "{\"showBacon\":true}",
      'local storage has an item'
    );
  });

  test('does not save to local storage when specified in config', async function(assert) {
    config.featureControls.saveInLocalStorage = false;
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBacon]'));

    assert.equal(
      window.localStorage.getItem('storage:feature-controls'),
      '{}',
      'local storage is empty'
    );
  })
});
