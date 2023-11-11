'use strict'

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon')

module.exports = function (defaults) {
  const app = new EmberAddon(defaults, {
    'ember-cli-babel': { enableTypeScriptTransform: true },

    // Add options here
  })

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */
  app.import('node_modules/milligram/dist/milligram.css')

  const { maybeEmbroider } = require('@embroider/test-setup')
  return maybeEmbroider(app, {
    skipBabel: [
      {
        package: 'qunit',
      },
    ],

    /**
     * See:
     * - https://github.com/embroider-build/embroider/issues/823
     * - https://discordapp.com/channels/480462759797063690/568935504288940056/901170716949512233
     * - https://discordapp.com/channels/480462759797063690/568935504288940056/902484167915364433
     *
     * TODO: to remove once the following PR is released:
     *       https://github.com/mansona/ember-get-config/pull/29
     */
    compatAdapters: new Map([
      ['ember-get-config', null], // eslint-disable-line prettier/prettier
    ]),
  })
}
