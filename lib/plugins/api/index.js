var async = require('async');
var methods = require('./methods');

exports = module.exports = { };
exports.register = function (plugin, options, next) {
  var arr = [
    methods.register
  ];

  async.eachSeries(arr, function (fn, done) {
    return fn(plugin, options, done);
  }, next);
};

exports.register.attributes = {
  pkg: require('./package.json')
};
