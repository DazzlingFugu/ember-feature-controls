import config from 'ember-get-config'

const { featureControls } = config

export function initialize(appInstance) {
  const features = appInstance.lookup('service:features')
  if (featureControls && featureControls.useLocalStorage) {
    const controlStorageService = appInstance.lookup(
      'service:feature-control-storage'
    )
    // result of controlStorageService.get('featuresLS') is an ObjectProxy we need to use "content"
    let { content: featureControls } = controlStorageService.get('featuresLS')
    if (featureControls) {
      Object.keys(featureControls).forEach((flag) => {
        if (features.get('flags').includes(flag)) {
          featureControls[flag] ? features.enable(flag) : features.disable(flag)
        }
      })
    }
  }
}

export default {
  initialize,
}
