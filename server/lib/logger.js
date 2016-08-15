var winston = require('winston');
var _ = require('lodash');

var customColors = {
  debug: 'cyan',
  verbose: 'gray',
  info: 'magenta', //green
  warn: 'yellow',
  error: 'red',
  fatal: 'red'
};

const logger = new (winston.Logger)({
  colors: customColors,
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    verbose: 4,
    debug: 5
  },
  transports: [
    new (winston.transports.Console)({
      level: process.env.LOG_LEVEL,
      colorize: true,
      timestamp: true,
    }),
    new (winston.transports.File)({
      name: 'error-log',
      filename: 'filelog-error.log',
      json: true,
      level: 'error'
    })
  ]
});

winston.addColors(customColors);

// Extend logger object to properly log 'Error' types
var origLog = logger.log;

logger.log = function (level, msg) {
  var objType = Object.prototype.toString.call(msg);
  if (objType === '[object Error]') {
    origLog.call(logger, level, msg.toString());
  } else {
    origLog.call(logger, level, msg);
  }
};

/* LOGGER EXAMPLES
    logger.trace('testing');
    logger.debug('testing');
    logger.info('testing');
    logger.warn('testing');
    logger.error('testing');
    logger.fatal('testing');
*/

module.exports = logger;