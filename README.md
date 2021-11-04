# ember-feature-controls

[![CI](https://github.com/peopledoc/ember-feature-controls/actions/workflows/ci.yml/badge.svg)](https://github.com/peopledoc/ember-feature-controls/actions/workflows/ci.yml) [![Ember Observer Score](https://emberobserver.com/badges/ember-feature-controls.svg)](https://emberobserver.com/addons/ember-feature-controls)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Hot plug your features: `ember-feature-controls` provides an administration panel to enable or disable feature flags.

- Demo is available here: [https://peopledoc.github.io/ember-feature-controls/](https://peopledoc.github.io/ember-feature-controls/).

- To learn more about feature flags and how you can use them in your Ember app, read [this article](https://tech.people-doc.com/feature-flags-spa.html) by Xavier Cambar.

## Compatibility

* Ember.js v3.20 or above
* Ember CLI v3.20 or above
* Node.js v12 or above

## Installation

```
ember install ember-feature-controls
```

## Usage

This addon works with [ember-feature-flags](https://github.com/kategengler/ember-feature-flags).
It displays an administration panel to enable or disable feature flags.

![Screenshot](/docs/screenshot.png)

### Within a template

The addon provides a component `{{feature-controls}}` to add in a template of your app.
This component basically displays the table with actions buttons.

```hbs
{{feature-controls}}
```

#### Options

```hbs
{{feature-controls showRefresh=false showReset=false}}
```

- `showRefresh`: Show the refresh button, true by default
- `showReset`: Show the refresh button, true by default

### Within the router

You can configure a route for feature-controls in your app. This will add a route under the name `features-list` and the path `features` by default. You can use an object as second parameter to configure the route like any route in your app. For example:

```js
// app/router.js
import EmberRouter from "@ember/routing/router";
import config from "./config/environment";
import featureControlsRouteSetup from "ember-feature-controls/route-setup";

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  featureControlsRouteSetup(this, { path: "__features" });
});

export default Router;
```

## Configuration

`config.featureFlags`

Define a set of custom feature flags by defining the `featureFlags` property in `config/environment.js`.

Then, you can configure a set of metadata for your feature flags by defining the property `featureControls`. This is an easy way to change settings for a given environment. For example:

```js
// config/environment.js
module.exports = function(environment) {
  var ENV = {
    featureFlags: {
      "show-spinners": true,
      "download-cats": false
    },
    featureControls: {
      useLocalStorage: true,
      metadata: [
        {
          key: "show-spinners",
          description: "Show spinners"
        },
        {
          key: "download-cats",
          description: "Add button to download cats image",
          reload: true
        },
        {
          key: "easter-egg",
          hide: true
        }
      ]
    }
  };

  return ENV;
};
```

About `useLocalStorage`: this property is not mandatory, but setting it to true register the new value of some flag in the local storage. This way, the values for all flags remain the same after refreshing your application.

About `reload`: this property is not mandatory. It forces the browser to reload if this flag change. This is needed for flags involved in the setup of your application.

About `hide`: this property is not mandatory. It forces to hide the feature flag in the listing.

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## Contributors ✨

[//]: contributor-faces
<a href="https://github.com/GreatWizard"><img src="https://avatars.githubusercontent.com/u/1322081?v=4" title="GreatWizard" width="80" height="80"></a>
<a href="https://github.com/MrChocolatine"><img src="https://avatars.githubusercontent.com/u/47531779?v=4" title="MrChocolatine" width="80" height="80"></a>
<a href="https://github.com/BlueCutOfficial"><img src="https://avatars.githubusercontent.com/u/22059380?v=4" title="BlueCutOfficial" width="80" height="80"></a>
<a href="https://github.com/saintsebastian"><img src="https://avatars.githubusercontent.com/u/8288415?v=4" title="saintsebastian" width="80" height="80"></a>
<a href="https://github.com/yonmey"><img src="https://avatars.githubusercontent.com/u/3025706?v=4" title="yonmey" width="80" height="80"></a>
<a href="https://github.com/romgere"><img src="https://avatars.githubusercontent.com/u/13900970?v=4" title="romgere" width="80" height="80"></a>
<a href="https://github.com/cah-danmonroe"><img src="https://avatars.githubusercontent.com/u/11519684?v=4" title="cah-danmonroe" width="80" height="80"></a>
<a href="https://github.com/amessinger"><img src="https://avatars.githubusercontent.com/u/3007703?v=4" title="amessinger" width="80" height="80"></a>
<a href="https://github.com/Pixelik"><img src="https://avatars.githubusercontent.com/u/1423394?v=4" title="Pixelik" width="80" height="80"></a>

[//]: contributor-faces

## License

This project is licensed under the [MIT License](LICENSE.md).
