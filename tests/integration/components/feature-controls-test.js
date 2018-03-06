import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | feature-controls', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('features', {
      _flags: []
    });
    await render(hbs`{{feature-controls features=features}}`);
    assert.ok(this.element.querySelector('table'), '');
  });
});
