export function initialize(appInstance) {
  const features = appInstance.lookup('service:features')
  const { featureControls } =
    appInstance.resolveRegistration('config:environment')
  if (featureControls && featureControls.useLocalStorage) {
    const storageService = appInstance.lookup(
      'service:feature-controls-storage'
    )
    // result of storageService.get('featuresLS') is an ObjectProxy we need to use "content"
    let { content: featureControls } = storageService.get('featuresLS')
    if (featureControls) {
      Object.keys(featureControls).forEach((flag) => {
        if (features.get('flags').includes(flag)) {
          console.log(`i ${flag} => ${featureControls[flag]}`)
          featureControls[flag] ? features.enable(flag) : features.disable(flag)
        }
      })
    }
  }
}

export default {
  initialize,
}
