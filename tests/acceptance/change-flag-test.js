import { module, test } from "qunit";
import { visit, click } from "@ember/test-helpers";
import { setupApplicationTest } from "ember-qunit";
import { _resetStorages } from "ember-local-storage/helpers/storage";
import { initialize } from "ember-feature-controls/instance-initializers/load-feature-controls";
import config from "dummy/config/environment";
import windowUtil from "ember-feature-controls/utils/window";

const baseConfig = config.featureControls;

const originalWindowReload = windowUtil.reload;

// Simulates the instructions done at page reload
const reloadPage = function(appInstance) {
  const features = appInstance.lookup("service:features");
  Object.keys(config.featureFlags).forEach(flag => {
    config.featureFlags[flag] ? features.enable(flag) : features.disable(flag);
  });
  initialize(appInstance);
};

module("Acceptance | change flag", function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    windowUtil.reload = function() {};
  });

  hooks.afterEach(function() {
    windowUtil.reload = originalWindowReload;
    config.featureControls = baseConfig;
    window.localStorage.clear();
    _resetStorages();
  });

  test("it initializes the app with bear on and bacon off", async function(assert) {
    await visit("/");
    assert.dom('img[alt="bear"]').exists();
    assert.dom('img[alt="bacon"]').doesNotExist();
    await visit("/__features");
    assert.dom("[data-test-label-flag=showBear]").hasText("");
    assert.dom("[data-test-label-flag=showBacon]").hasText("");
  });

  test("it changes feature flags", async function(assert) {
    await visit("/__features");
    await click("[data-test-checkbox-flag=showBear]");
    assert.dom("[data-test-label-flag=showBear]").hasText("❗");
    await click("[data-test-checkbox-flag=showBacon]");
    assert.dom("[data-test-label-flag=showBacon]").hasText("❗");
  });

  test("it persists the changes at link to another page", async function(assert) {
    await visit("/__features");
    await click("[data-test-checkbox-flag=showBacon]");
    await click("[data-test-link-index]");
    assert.dom('img[alt="bear"]').exists();
    assert.dom('img[alt="bacon"]').exists();
    await click("[data-test-link-features]");
    await click("[data-test-checkbox-flag=showBear]");
    await click("[data-test-link-index]");
    assert.dom('img[alt="bear"]').doesNotExist();
    assert.dom('img[alt="bacon"]').exists();
  });

  test("it persists the flags when clicking on refresh button", async function(assert) {
    await visit("/__features");
    await click("[data-test-checkbox-flag=showBacon]");
    await click("[data-test-button-refresh]");
    assert.dom("[data-test-label-flag=showBacon]").hasText("❗");
  });

  test("it resets feature flags when clicking on reset button", async function(assert) {
    await visit("/__features");
    await click("[data-test-checkbox-flag=showBear]");
    await click("[data-test-checkbox-flag=showBacon]");
    await click("[data-test-button-reset]");
    assert.dom("[data-test-label-flag=showBacon]").hasText("");
    assert.dom("[data-test-label-flag=showBacon]").hasText("");
  });

  test("it doesn't reload page when clicking on a not reloadable feature flag", async function(assert) {
    assert.expect(0);
    windowUtil.reload = function() {
      assert.ok(true, "Reload function is called");
    };
    await visit("/__features");
    await click("[data-test-checkbox-flag=showBear]");
  });

  test("it reloads page when clicking on a reloadable feature flag", async function(assert) {
    assert.expect(1);
    windowUtil.reload = function() {
      assert.ok(true, "Reload function is called");
    };
    await visit("/__features");
    await click("[data-test-checkbox-flag=showBacon]");
  });

  test("with localStorage | it persists the changes when loading another URL", async function(assert) {
    config.featureControls.useLocalStorage = true;
    await visit("/__features");
    await click("[data-test-checkbox-flag=showBacon]");
    reloadPage(this.get("owner"));
    await visit("/");
    assert.dom('img[alt="bear"]').exists();
    assert.dom('img[alt="bacon"]').exists();
    await visit("/__features");
    await click("[data-test-checkbox-flag=showBear]");
    reloadPage(this.get("owner"));
    await visit("/");
    assert.dom('img[alt="bear"]').doesNotExist();
    assert.dom('img[alt="bacon"]').exists();
  });

  test("with localStorage | it persists the flags when reloading after a refresh", async function(assert) {
    config.featureControls.useLocalStorage = true;
    await visit("/__features");
    await click("[data-test-checkbox-flag=showBacon]");
    await click("[data-test-button-refresh]");
    await visit("/");
    reloadPage(this.get("owner"));
    await visit("/__features");
    assert.dom("[data-test-label-flag=showBacon]").hasText("❗");
  });

  test("with localStorage | it persists the flags when reloading after a reset", async function(assert) {
    config.featureControls.useLocalStorage = true;
    await visit("/__features");
    await click("[data-test-checkbox-flag=showBear]");
    await click("[data-test-checkbox-flag=showBacon]");
    await click("[data-test-button-reset]");
    await visit("/");
    reloadPage(this.get("owner"));
    await visit("/__features");
    assert.dom("[data-test-label-flag=showBear]").hasText("");
    assert.dom("[data-test-label-flag=showBacon]").hasText("");
  });

  test("with localStorage | it won't load unknown flags", async function(assert) {
    window.localStorage.setItem(
      "storage:feature-controls",
      '{"fakeFlag":true}'
    );
    config.featureControls.useLocalStorage = true;
    await visit("/__features");
    assert
      .dom("[data-test-checkbox-flag=fakeFlag]")
      .doesNotExist("fakeFlag is not registered");
  });

  test("without localStorage | it resets the changes when loading another URL", async function(assert) {
    config.featureControls.useLocalStorage = false;
    await visit("/__features");
    await click("[data-test-checkbox-flag=showBear]");
    await click("[data-test-checkbox-flag=showBacon]");
    reloadPage(this.get("owner"));
    await visit("/");
    assert.dom('img[alt="bear"]').exists();
    assert.dom('img[alt="bacon"]').doesNotExist();
  });

  test("without localStorage | it resets the flags when reloading after a refresh", async function(assert) {
    config.featureControls.useLocalStorage = false;
    await visit("/__features");
    await click("[data-test-checkbox-flag=showBacon]");
    await click("[data-test-button-refresh]");
    await visit("/");
    reloadPage(this.get("owner"));
    await visit("/__features");
    assert.dom("[data-test-label-flag=showBacon]").hasText("");
  });
});
