import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';
import featureControlsRouteSetup from 'ember-feature-controls/route-setup'

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('index', { path: '/' })
  featureControlsRouteSetup(this, { path: '__features' })
});
