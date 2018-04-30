import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { find, visit, click } from '@ember/test-helpers';
import config from 'dummy/config/environment';
import { _resetStorages } from 'ember-local-storage/helpers/storage';

let baseConfig = config.featureControls;

module('Acceptance | local storage env', function(hooks) {

  setupApplicationTest(hooks);

  hooks.afterEach(function() {
    config.featureControls = baseConfig;
    window.localStorage.clear();
    _resetStorages();
  });

  test('it saves to local storage when specified in config', async function(assert) {
    config.featureControls.useLocalStorage = true;
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBacon]'));
    assert.equal(
      window.localStorage.getItem('storage:feature-controls'),
      "{\"showBacon\":true}",
      'local storage has an item'
    );
  });

  test('it does not save to local storage when specified in config', async function(assert) {
    config.featureControls.useLocalStorage = false;
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBacon]'));
    assert.equal(
      window.localStorage.getItem('storage:feature-controls'),
      null,
      'local storage is empty'
    );
  });

});
