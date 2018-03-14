import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from '../templates/components/feature-controls';
import { set, get } from '@ember/object';
import { assign } from '@ember/polyfills';
import config from 'ember-get-config';
import { storageFor } from 'ember-local-storage';

const { featureFlags, featureControls } = config;

export default Component.extend({
  layout,
  features: service(),
  savedConf: storageFor('feature-controls'),
  showRefresh: true,
  showReset: true,
  featureFlags,
  init() {
    this._super(...arguments);
    this.refresh();
  },
  _normalizeFlag(key) {
    return get(this, 'features._normalizeFlag')(key);
  },
  refresh() {
    let featureFlags = this.get('featureFlags');
    // Compute default values
    let defaults = {};
    for (let key in featureFlags) {
      defaults[this._normalizeFlag(key)] = featureFlags[key];
    }

    // Computed property is not possible, model is a local copy of feature flags
    let model = (get(this, 'features.flags') || []).map(key => {
      let meta =
        ((featureControls && featureControls.metadata) || []).find(obj => {
          return this._normalizeFlag(obj.key) === key;
        }) || {};
      let featureFlag = {
        key,
        isEnabled: this.get(`savedConf.${key}`) !== undefined ? this.get(`savedConf.${key}`) : get(this, 'features').isEnabled(key),
        default: defaults[key] || false
      };
      return assign({}, meta, featureFlag);
    });
    set(this, 'model', model);
  },
  reset() {
    let featureFlags = this.get('featureFlags');
    Object.keys(featureFlags).forEach(key => {
      this.updateFeature(this._normalizeFlag(key), featureFlags[key]);
    });
    this.get('savedConf').reset();
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
      if(featureControls.saveInLocalStorage) {
        this.set(`savedConf.${key}`, !checkboxState);
      }
    }
  }
});
