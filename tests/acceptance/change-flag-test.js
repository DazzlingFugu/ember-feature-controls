import { module, test } from 'qunit';
import { visit, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { _resetStorages } from 'ember-local-storage/helpers/storage';
import { initialize } from 'ember-feature-controls/instance-initializers/load-feature-controls';
import config from 'dummy/config/environment';
let baseConfig = config.featureControls;

// Simulates the instructions done at page reload
const reloadPage = function(appInstance) {
  const features = appInstance.lookup('service:features');
  Object.keys(config.featureFlags).forEach(flag => {
    config.featureFlags[flag] ? features.enable(flag) : features.disable(flag);
  });
  initialize(appInstance);
}

module('Acceptance | change flag', function(hooks) {
  setupApplicationTest(hooks);

  hooks.afterEach(function() {
    config.featureControls = baseConfig;
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
    await click(find('[data-test-checkbox-flag=showBear]'));
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '❗');
    await click(find('[data-test-checkbox-flag=showBacon]'));
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '❗');
  });

  test('it persists the changes at link to another page', async function(assert) {
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBacon]'));
    await click('[data-test-link-index]');
    assert.ok(find('img[alt="bear"]'));
    assert.ok(find('img[alt="bacon"]'));
    await click('[data-test-link-features]');
    await click(find('[data-test-checkbox-flag=showBear]'));
    await click('[data-test-link-index]');
    assert.notOk(find('img[alt="bear"]'));
    assert.ok(find('img[alt="bacon"]'));
  });

  test('it persists the flags when clicking on refresh button', async function(assert) {
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBacon]'));
    await click(find('[data-test-button-refresh]'));
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '❗');
  });

  test('it resets feature flags when clicking on reset button', async function(assert) {
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBear]'));
    await click(find('[data-test-checkbox-flag=showBacon]'));
    await click(find('[data-test-button-reset]'));
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '');
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '');
  });

  test('with localStorage | it persists the changes when loading another URL', async function(assert) {
    config.featureControls.useLocalStorage = true;
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBacon]'));
    reloadPage(this.get('owner'));
    await visit('/');
    assert.ok(find('img[alt="bear"]'));
    assert.ok(find('img[alt="bacon"]'));
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBear]'));
    reloadPage(this.get('owner'));
    await visit('/');
    assert.notOk(find('img[alt="bear"]'));
    assert.ok(find('img[alt="bacon"]'));
  });

  test('with localStorage | it persists the flags when reloading after a refresh', async function(assert) {
    config.featureControls.useLocalStorage = true;
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBacon]'));
    await click(find('[data-test-button-refresh]'));
    await visit('/');
    reloadPage(this.get('owner'));
    await visit('/__features');
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '❗');
  });

  test('with localStorage | it persists the flags when reloading after a reset', async function(assert) {
    config.featureControls.useLocalStorage = true;
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBear]'));
    await click(find('[data-test-checkbox-flag=showBacon]'));
    await click(find('[data-test-button-reset]'));
    await visit('/');
    reloadPage(this.get('owner'));
    await visit('/__features');
    assert.equal(find('[data-test-label-flag=showBear]').innerText.trim(), '');
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '');
  });

  test('without localStorage | it resets the changes when loading another URL', async function(assert) {
    config.featureControls.useLocalStorage = false;
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBear]'));
    await click(find('[data-test-checkbox-flag=showBacon]'));
    reloadPage(this.get('owner'));
    await visit('/');
    assert.ok(find('img[alt="bear"]'));
    assert.notOk(find('img[alt="bacon"]'));
  });

  test('without localStorage | it resets the flags when reloading after a refresh', async function(assert) {
    config.featureControls.useLocalStorage = false;
    await visit('/__features');
    await click(find('[data-test-checkbox-flag=showBacon]'));
    await click(find('[data-test-button-refresh]'));
    await visit('/');
    reloadPage(this.get('owner'));
    await visit('/__features');
    assert.equal(find('[data-test-label-flag=showBacon]').innerText.trim(), '');
  });

});
