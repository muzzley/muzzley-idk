var async = require('async');
var methods = require('./methods');
var config = require('./config');

function register (plugin, options, next) {
  if (options.subscriptions) {
    plugin.route({
      method: 'POST',
      path: options.subscriptions.uri,
      config: config.subscriptions(plugin, options.subscriptions)
    });
    return next();
  }

  plugin.route({
    method: 'POST',
    path: '/subscriptions',
    config: config.subscriptions(plugin, options)
  });

  return next();
}

exports = module.exports = {};
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
