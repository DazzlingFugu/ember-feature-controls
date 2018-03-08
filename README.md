# ember-feature-controls

[![Build Status](https://travis-ci.org/peopledoc/ember-feature-controls.svg?branch=master)](https://travis-ci.org/peopledoc/ember-feature-controls)

Hot plug your features.

## Installation

```
ember install ember-feature-controls
```

## Usage

This addon will display a standard HTML table with the possibility to enable/disable a feature flag.

![Screenshot](/docs/screenshot.png)

This addon works with [ember-feature-flags](https://github.com/kategengler/ember-feature-flags).

### Within a template

This will only display the table with actions buttons.

You need to call the component `feature-controls` in a template:

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

You can configure a set of metadata for your feature flags in your app's `config/environment.js` file. This is an easy way to change settings for a given environment. For example:

```js
// config/environment.js
module.exports = function(environment) {
  var ENV = {
    featureFlags: {
      'show-spinners': true,
      'download-cats': false
    },
    featureControls: {
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
