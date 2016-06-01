"use strtict"
const boot = require('loopback-boot')
    , http = require('http')
    , loopback = require('loopback')
    , app = module.exports = loopback()
    , debug = require('debug')('profile');

var http_port = process.env.HTTP_PORT || 3005,
    etcd_host = process.env.ETCD_HOST || '192.168.99.100', // etcd in prod
    rabbit_host = process.env.BROCKER_HOST || '192.168.99.100', // // rabbit in prod
    mongo_host = process.env.DBSOURCE_HOST || '127.0.0.1';

app.set('http_port', http_port);
app.set('etcd_host', etcd_host);
app.set('rabbit_host', rabbit_host);
app.set("ms_name", 'profile');
app.set("mongo_host", mongo_host);

boot(app, __dirname, (err) => {
    if (err) throw err;
    app.start = function () {
        var httpServer = http.createServer(app).listen(http_port, () => {          
            app.emit('started');
            app.close = (done) => {
                app.removeAllListeners('started');
                app.removeAllListeners('loaded');
            };
        });
    };
    if (require.main === module)
        app.start();
    app.loaded = true;
    app.emit('loaded');
});
