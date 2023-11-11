import Component from '@glimmer/component'
import { get, set, action } from '@ember/object'
import { service } from '@ember/service'
import { camelize } from '@ember/string'
import { assign } from '@ember/polyfills'
import windowUtil from 'ember-feature-controls/utils/window'
import { getOwner } from '@ember/application'

export default class FeatureControlsComponent extends Component {
  @service features
  @service featureControlsStorage

  get featureFlags() {
    return this.args.featureFlags ? this.args.featureFlags : this._featureFlags
  }

  get featureControls() {
    return this.args.featureControls ? this.args.featureControls : this._featureControls
  }

  get showRefresh() {
    return this.args.showRefresh ?? true
  }

  get showReset() {
    return this.args.showReset ?? true
  }

  constructor() {
    super(...arguments)

    let { featureFlags, featureControls } = getOwner(this).resolveRegistration('config:environment')

    this._featureFlags = featureFlags
    this._featureControls = featureControls
    this.refresh()
  }

  _normalizeFlag(key) {
    return this.features._normalizeFlag(key) || camelize(key)
  }

  // Refresh the state of the feature flags list component
  @action
  refresh() {
    // Take the existing flags from the config and put them in a list of default values
    let featureFlags = this.featureFlags
    let defaults = {}

    Object.keys(featureFlags).forEach(
      (key) => (defaults[this._normalizeFlag(key)] = featureFlags[key]),
    )

    // Model is a local copy of the list of flags register for features service, used to compute properties on the full list
    let model = (this.features.flags || []).map((key) => {
      let meta =
        ((this.featureControls && this.featureControls.metadata) || []).find((obj) => {
          return this._normalizeFlag(obj.key) === key
        }) || {}

      if (meta.hide === true) {
        return undefined
      }

      let isFlagLS =
        this.featureControls.useLocalStorage &&
        get(this, `featureControlsStorage.featuresLS.${key}`) !== undefined

      let featureFlag = {
        key,
        isEnabled: isFlagLS
          ? get(this, `featureControlsStorage.featuresLS.${key}`)
          : this.features.isEnabled(key),
        default: defaults[key] || false,
      }

      return assign({}, meta, featureFlag)
    })

    set(
      this,
      'model',
      model.filter((item) => item !== undefined),
    )
  }

  @action
  reset() {
    // Reset the flags from the features service to the default value in the config
    let featureFlags = this.featureFlags

    Object.keys(featureFlags).forEach((key) => {
      this.updateFeature(this._normalizeFlag(key), featureFlags[key])
    })

    // If we use local storage then we want to clear the stored data
    if (this.featureControls.useLocalStorage) {
      this.featureControlsStorage.featuresLS.reset()
    }
  }

  @action
  updateFeature(key, isEnabled) {
    if (isEnabled) {
      this.features.enable(key)
    } else {
      this.features.disable(key)
    }

    // Update the local model accordingly
    let modelFlag = this.model.find((obj) => {
      return obj.key === key
    })

    if (modelFlag) {
      set(modelFlag, 'isEnabled', isEnabled)

      if (modelFlag.reload) {
        windowUtil.reload()
      }
    }
  }

  @action
  doToggleFeature(key, checkboxState) {
    this.updateFeature(key, !checkboxState)

    if (this.featureControls.useLocalStorage) {
      set(this, `featureControlsStorage.featuresLS.${key}`, !checkboxState)
    }
  }
}
