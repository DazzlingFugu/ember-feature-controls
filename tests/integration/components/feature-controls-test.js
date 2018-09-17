import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render, click } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import { camelize } from "@ember/string";
import { _resetStorages } from "ember-local-storage/helpers/storage";

const featuresMock = function(assert) {
  return {
    flags: [camelize("flag-true"), camelize("flag-false")],
    isEnabled(key) {
      return key === camelize("flag-true");
    },
    _normalizeFlag(key) {
      return camelize(key);
    },
    disable() {
      assert.ok(true, "featuresMock.disable() called");
    },
    enable() {
      assert.ok(true, "featuresMock.enable() called");
    }
  };
};

const featureFlags = {
  "flag-true": true,
  "flag-false": false
};

const featureControls = {
  useLocalStorage: false,
  metadata: [
    {
      key: "flag-true",
      description: "Show a bear"
    },
    {
      key: "flag-false",
      description: "Show some bacon"
    }
  ]
};

const storageMock = function(assert) {
  return {
    reset() {
      assert.ok(true, "storageMock.reset() called");
    }
  };
};

const testProperties = function(assert) {
  return {
    features: featuresMock(assert),
    featureControls,
    featureFlags,
    featuresLS: storageMock(assert)
  };
};

module("Integration | Component | feature-controls", function(hooks) {
  setupRenderingTest(hooks);

  hooks.afterEach(function() {
    window.localStorage.clear();
    _resetStorages();
  });

  test("it renders with reset and refresh button by default", async function(assert) {
    assert.expect(2);
    await render(hbs`{{feature-controls}}`);
    assert.dom("[data-test-button-refresh]").exists();
    assert.dom("[data-test-button-reset]").exists();
  });

  test("it does not render reset and refresh button when specified", async function(assert) {
    assert.expect(2);
    await render(hbs`{{feature-controls showRefresh=false showReset=false}}`);
    assert.dom("[data-test-button-refresh]").doesNotExist();
    assert.dom("[data-test-button-reset]").doesNotExist();
  });

  test("it renders multiple flags", async function(assert) {
    assert.expect(6);
    this.setProperties(testProperties(assert));
    await render(
      hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags}}`
    );
    assert.dom("table").exists("there should be a table element");
    assert
      .dom("tbody tr")
      .exists({ count: 2 }, "the table should contain 2 lines");
    assert
      .dom('[data-test-checkbox-flag="flagTrue"]')
      .isChecked("flagTrue should be checked");
    assert
      .dom('[data-test-checkbox-flag="flagFalse"]')
      .isNotChecked("flagFalse should be unchecked");
    assert
      .dom('[data-test-label-flag="flagTrue"]')
      .hasText("", "flagTrue's label should be empty");
    assert
      .dom('[data-test-label-flag="flagFalse"]')
      .hasText("", "flagFalse's label should be empty");
  });

  test("it changes flags : 1 more assertion called when a flag is enabled", async function(assert) {
    assert.expect(3);
    this.setProperties(testProperties(assert));
    await render(
      hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags featuresLS=featuresLS}}`
    );
    await click('[data-test-checkbox-flag="flagFalse"]');
    assert
      .dom('[data-test-checkbox-flag="flagFalse"]')
      .isChecked("flagFalse should be checked after click");
    assert
      .dom(this.element.querySelector('[data-test-label-flag="flagFalse"]'))
      .hasText("❗", "flagFalse's label should have a content");
  });

  test("it changes flags : 1 more assertion called when a flag is disabled", async function(assert) {
    assert.expect(3);
    this.setProperties(testProperties(assert));
    await render(
      hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags featuresLS=featuresLS}}`
    );
    await click('[data-test-checkbox-flag="flagTrue"]');
    assert
      .dom('[data-test-checkbox-flag="flagTrue"]')
      .isNotChecked("flagTrue should be unchecked after click");
    assert
      .dom('[data-test-label-flag="flagTrue"]')
      .hasText("❗", "flagTrue's label should have a content");
  });

  test("without localStorage | it resets the flag at click on reset button : enable flag x1, disable flag x2", async function(assert) {
    assert.expect(4);
    this.setProperties(testProperties(assert));
    await render(
      hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags featuresLS=featuresLS}}`
    );
    await click('[data-test-checkbox-flag="flagTrue"]');
    await click("[data-test-button-reset]");
    assert
      .dom('[data-test-checkbox-flag="flagTrue"]')
      .isChecked("flagTrue should be checked after reset");
  });

  test("with localStorage | it resets the flag at click on reset button : enable flag x1, disable flag x2, reset storage x1", async function(assert) {
    assert.expect(5);
    this.setProperties(testProperties(assert));
    this.set("featureControls.useLocalStorage", true);
    await render(
      hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags featuresLS=featuresLS}}`
    );
    await click('[data-test-checkbox-flag="flagTrue"]');
    await click("[data-test-button-reset]");
    assert
      .dom('[data-test-checkbox-flag="flagTrue"]')
      .isChecked("flagTrue should be checked after reset");
  });

  test("it updates the model at click on refresh", async function(assert) {
    this.setProperties(testProperties(assert));
    await render(
      hbs`{{feature-controls featureControls=featureControls features=features featureFlags=featureFlags}}`
    );
    this.set("featureFlags", {
      "flag-true": false,
      "flag-false": true
    });
    await click("[data-test-button-refresh]");
    assert
      .dom('[data-test-checkbox-flag="flagTrue"]')
      .isChecked("flagTrue should be checked after refresh");
    assert.dom('[data-test-label-flag="flagTrue"]').hasText("❗");
    assert
      .dom('[data-test-checkbox-flag="flagFalse"]')
      .isNotChecked("flagFalse should be checked after refresh");
    assert.dom('[data-test-label-flag="flagFalse"]').hasText("❗");
  });
});
