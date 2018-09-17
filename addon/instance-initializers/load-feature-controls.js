import { getStorage } from "ember-local-storage/helpers/storage";
import config from "ember-get-config";

const { featureControls } = config;

export function initialize(appInstance) {
  const features = appInstance.lookup("service:features");
  if (featureControls.useLocalStorage) {
    let featureControlsJSON = getStorage("local")["storage:feature-controls"];
    if (featureControlsJSON) {
      const flags = JSON.parse(featureControlsJSON);
      if (flags) {
        Object.keys(flags).forEach(flag => {
          if (features.get("flags").includes(flag)) {
            flags[flag] ? features.enable(flag) : features.disable(flag);
          }
        });
      }
    }
  }
}

export default {
  initialize
};
