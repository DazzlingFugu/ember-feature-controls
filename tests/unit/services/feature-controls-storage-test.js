import { module, test } from 'qunit'
import { setupTest } from 'ember-qunit'

module('Unit | Service | feature-controls-storage', function (hooks) {
  setupTest(hooks)

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:feature-controls-storage')
    assert.ok(service)
  })
})
