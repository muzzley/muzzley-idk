var bunyan = require('bunyan');

module.exports = function(config) {
  return bunyan.createLogger(config);
};