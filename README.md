# ember-feature-controls

[![Build Status](https://travis-ci.org/peopledoc/ember-feature-controls.svg?branch=master)](https://travis-ci.org/peopledoc/ember-feature-controls) [![Ember Observer Score](https://emberobserver.com/badges/ember-feature-controls.svg)](https://emberobserver.com/addons/ember-feature-controls)

Hot plug your features: `ember-feature-controls` provides an administration panel to enable or disable feature flags.

- Demo is available here: [https://peopledoc.github.io/ember-feature-controls/](https://peopledoc.github.io/ember-feature-controls/).

- To learn more about feature flags and how you can use them in your Ember app, read [this article](https://tech.people-doc.com/feature-flags-spa.html) by Xavier Cambar. 

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

* `showRefresh`: Show the refresh button, true by default
* `showReset`: Show the refresh button, true by default

### Within the router

You can configure a route for feature-controls in your app. This will add a route under the name `features-list` and the path `features` by default. You can use an object as second parameter to configure the route like any route in your app. For example:

```js
// app/router.js
import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import featureControlsRouteSetup from 'ember-feature-controls/route-setup';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  featureControlsRouteSetup(this, { path: '__features' });
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
      'show-spinners': true,
      'download-cats': false
    },
    featureControls: {
      useLocalStorage: true,
      metadata: [
        {
          key: 'show-spinners',
          description: 'Show spinners'
        },
        {
          key: 'download-cats',
          description: 'Add button to download cats image'
        }
      ]
    }
  };

  return ENV;
};
```
About `useLocalStorage`: this property is not mandatory, but setting it to true register the new value of some flag in the local storage. This way, the values for all flags remain the same after refreshing your application.

## Contributing

### Installation

* `git clone git@github.com:peopledoc/ember-feature-controls.git`
* `cd ember-feature-controls`
* `npm install`

### Linting

* `npm run lint:js`
* `npm run lint:js -- --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `npm test` – Runs `ember try:each` to test your addon against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## License

This project is licensed under the [MIT License](LICENSE.md).
