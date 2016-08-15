'use strict';
const etcdRegistry = require('etcd-registry'),
    logger = require('../lib/logger');
/**
 * Service discovering
 */
module.exports = function (app) {
    const etcd_host = app.get('etcd_host');
    const http_port = app.get('http_port');
    const me = app.get('ms_name');
    const registry = app.registry = etcdRegistry(`${etcd_host}:4001`);
    app.once('started', () => {
        registry.join(me, { port: http_port });
        setTimeout(() => {
            registry.lookup(me, function (err, service) {
                if (service) {
                    logger.info(`Service ${me} registered in etcd`);
                    logger.info(`Key: ${me}\t\u2192\tUrl: ${service.url}`);
                } else {
                    logger.error(`Service on ${me} registration failed`);
                    // don't throw here, etcd-registry will try to reconnect
                }
            });
        }, 1000);
    });
};
