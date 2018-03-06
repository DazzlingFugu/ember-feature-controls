import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from '../templates/components/feature-controls';
import { set, get } from '@ember/object';
import { assign } from '@ember/polyfills';
import config from 'ember-get-config';

const { featureFlags, featureControls } = config;

export default Component.extend({
  layout,
  features: service(),
  showRefresh: true,
  showReset: true,
  init() {
    this._super(...arguments);
    this.refresh();
  },
  _normalizeFlag(key) {
    return get(this, 'features._normalizeFlag')(key);
  },
  refresh() {
    // Computed property is not possible, model is a local copy of feature flags
    let model = (get(this, 'features.flags') || []).map(key => {
      let meta =
        (featureControls && featureControls.metadata || []).find(obj => {
          return this._normalizeFlag(obj.key) === key;
        }) || {};
      let featureFlag = {
        key,
        isEnabled: get(this, 'features').isEnabled(key)
      };
      return assign({}, meta, featureFlag);
    });
    set(this, 'model', model);
  },
  reset() {
    Object.keys(featureFlags).forEach(key => {
      this.updateFeature(this._normalizeFlag(key), featureFlags[key]);
    });
  },
  updateFeature(key, isEnabled) {
    if (isEnabled) {
      get(this, 'features').enable(key);
    } else {
      get(this, 'features').disable(key);
    }
    // Update the local model accordingly
    let model = get(this, 'model');
    set(
      model.find(obj => {
        return obj.key === key;
      }),
      'isEnabled',
      isEnabled
    );
    set(this, 'model', model);
  },
  actions: {
    refresh() {
      this.refresh();
    },
    reset() {
      this.reset();
    },
    doToggleFeature(key, checkboxState) {
      this.updateFeature(key, !checkboxState);
    }
  }
});
