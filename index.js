'use strict';

/**
 * This file declares a plugin for the Serverless framework.
 *
 * This lets us define variables and helpers to simplify creating PHP applications.
 */

class ServerlessPlugin {
    constructor(serverless, options) {
        const fs = require("fs");
        const path = require('path');
        const filename = path.resolve(__dirname, 'layers.json');
        const layers = JSON.parse(fs.readFileSync(filename));

        // Override the variable resolver to declare our own variables
        const delegate = serverless.variables
            .getValueFromSource.bind(serverless.variables);
        serverless.variables.getValueFromSource = (variableString) => {
            if (variableString.startsWith('bref:extra.')) {
                const region = serverless.getProvider('aws').getRegion();
                const layerName = variableString.substr('bref:extra.'.length);
                if (! (layerName in layers)) {
                    throw `Unknown Bref extra layer named "${layerName}"`;
                }
                if (! (region in layers[layerName])) {
                    throw `There is no Bref extra layer named "${layerName}" in region "${region}"`;
                }
                const version = layers[layerName][region];
                return `arn:aws:lambda:${region}:403367587399:layer:${layerName}:${version}`;
            }

            return delegate(variableString);
        }
    }
}

module.exports = ServerlessPlugin;

