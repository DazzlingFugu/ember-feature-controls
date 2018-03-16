import Application from 'dummy/app';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setApplication } from '@ember/test-helpers';
import config from 'dummy/config/environment';

module('Acceptance | local storage env', function(hooks) {

  // set again a new application as in `tests/test-helper.js`
  // because it seems to be the ony way to set the config environment
  config.featureControls.saveInLocalStorage = false;
  setApplication(Application.create(config.APP));
  setupApplicationTest(hooks);

  test('does not save to local storage when specified in config', async function(assert) {
    assert.notOk(window.localStorage.length, 'local storage is empty')
    // reset config to its default value, otherwise other tests fail
    config.featureControls.saveInLocalStorage = true;
  })
});
