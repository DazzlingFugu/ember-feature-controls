import Service from '@ember/service'
import { storageFor } from "ember-local-storage"

export default class FeatureControlStorageService extends Service {
  @storageFor("feature-controls") featuresLS
}
