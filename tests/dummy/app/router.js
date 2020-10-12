import EmberRouter from "@ember/routing/router"
import config from "./config/environment"
import featureControlsRouteSetup from "ember-feature-controls/route-setup"

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
})

Router.map(function() {
  this.route("index", { path: "/" })
  featureControlsRouteSetup(this, { path: "__features" })
})

export default Router
