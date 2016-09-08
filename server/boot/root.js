const async = require('async')
  , debug = require("debug")('ms:profile');

module.exports = function (app) {
  var router = app.loopback.Router();
  router.get('/', app.loopback.status());
  app.use(router);
};
