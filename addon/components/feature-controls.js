import Component from "@ember/component";
import layout from "../templates/components/feature-controls";
import { inject as service } from "@ember/service";
import { set, get } from "@ember/object";
import { assign } from "@ember/polyfills";
import { storageFor } from "ember-local-storage";
import config from "ember-get-config";
import windowUtil from "ember-feature-controls/utils/window";

const { featureFlags, featureControls } = config;

export default Component.extend({
  layout,
  tagName: '',
  features: service(),
  featuresLS: storageFor("feature-controls"),
  showRefresh: true,
  showReset: true,
  featureControls,
  featureFlags,
  init() {
    this._super(...arguments);
    this.refresh();
  },
  _normalizeFlag(key) {
    return get(this, "features._normalizeFlag")(key);
  },
  // Refresh the state of the feature flags list component
  refresh() {
    // Take the existing flags from the config and put them in a list of default values
    let featureFlags = this.get("featureFlags");
    let defaults = {};
    for (let key in featureFlags) {
      defaults[this._normalizeFlag(key)] = featureFlags[key];
    }
    // Model is a local copy of the list of flags register for features service, used to compute properties on the full list
    let model = (get(this, "features.flags") || []).map(key => {
      let meta =
        ((featureControls && this.get("featureControls.metadata")) || []).find(
          obj => {
            return this._normalizeFlag(obj.key) === key;
          }
        ) || {};
      if (meta.hide === true) {
        return undefined;
      }
      let isFlagLS =
        this.get("featureControls.useLocalStorage") &&
        this.get(`featuresLS.${key}`) !== undefined;
      let featureFlag = {
        key,
        isEnabled: isFlagLS
          ? this.get(`featuresLS.${key}`)
          : get(this, "features").isEnabled(key),
        default: defaults[key] || false
      };
      return assign({}, meta, featureFlag);
    });
    set(this, "model", model.filter(item => item !== undefined));
  },
  reset() {
    // Reset the flags from the features service to the default value in the config
    let featureFlags = this.get("featureFlags");
    Object.keys(featureFlags).forEach(key => {
      this.updateFeature(this._normalizeFlag(key), featureFlags[key]);
    });
    // If we use local storage then we want to clear the stored data
    if (this.get("featureControls.useLocalStorage")) {
      this.get("featuresLS").reset();
    }
  },
  updateFeature(key, isEnabled) {
    if (isEnabled) {
      get(this, "features").enable(key);
    } else {
      get(this, "features").disable(key);
    }
    // Update the local model accordingly
    let model = get(this, "model");
    let modelFlag = model.find(obj => {
      return obj.key === key;
    });
    if (modelFlag) {
      set(modelFlag, "isEnabled", isEnabled);
      set(this, "model", model);
      if (modelFlag.reload) {
        windowUtil.reload();
      }
    }
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
      if (this.get("featureControls.useLocalStorage")) {
        this.set(`featuresLS.${key}`, !checkboxState);
      }
    }
  }
});
