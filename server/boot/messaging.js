"use strict"
const rabbit = require('rabbot')
    , debug = require("debug")("ms:tracker")
    , logger = require("../lib/logger");


module.exports = function (app) {
    const handle = () => {
        app.rabbit = rabbit;
        logger.info(`Service ${app.get('ms_name')} joined rabbit network`);
    }

    app.once('started', () => {
        require('../lib/topology')(rabbit, {
            name: app.get('ms_name'),
            host: app.get("rabbit_host")
        })
            .then(handle)
            .catch((err) => {
                logger.error(`Error when joining rabbit network: ${err}`);
                throw err;
            })
    });
}
