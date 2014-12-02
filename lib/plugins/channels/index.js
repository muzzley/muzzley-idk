var async = require('async');
var methods = require('./methods');
var config = require('./config');

exports = module.exports = {};
function register(plugin, options, next) {
  if (options.channels) {
    plugin.route({
      method: 'GET',
      path: options.channels.uri,
      config: config.list(plugin, options.channels)
    });
    return next();
  }

  plugin.route({
    method: 'get',
    path: '/channels',
    config: config.list(plugin, options)
  });

  return next();
}

/**
 * This method is used to register the plugin on an hapi server.
 *
 * @param  {Object}   plugin  Plugin object created by hapi server
 * @param  {Object}   options Plugin object passed by the developer when calling
 *                            pack.register.
 * @param  {Function} next    This function must be called when the plugin registration
 *                            is complete. The first argument is the error, if any
 *                            ocurred.
 * @return {undefined}        None
 */
exports.register = function (plugin, options, next) {
  var arr = [
    methods.register,
    register
  ];

  async.eachSeries(arr, function (fn, done) {
    return fn(plugin, options, done);
  }, next);
};

exports.register.attributes = {
  pkg: require('./package.json')
};
