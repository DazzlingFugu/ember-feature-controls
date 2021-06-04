import { module, test } from 'qunit'
import { setupTest } from 'ember-qunit'

module('Unit | Service | feature-control-storage', function (hooks) {
  setupTest(hooks)

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:feature-control-storage')
    assert.ok(service)
  })
})
