var async = require('async');
var exts = require('./exts');
var methods = require('./methods');
var config = require('./config');
var routes = require('./routes');

exports = module.exports = {};
function register (plugin, options, next) {
  var crumbOptions = {
    autoGenerate: false
  };

  plugin.register({
      plugin: require('crumb'),
      options: crumbOptions
    }, function () {
      plugin.route({
        path: '/',
        method: 'GET',
        config: config.url(plugin, options)
      });

      plugin.views({
        engines: { swig: require('swig') },
        path: [__dirname, 'views'].join('/')
      });

      return next();
    }
  );
}

exports.register = function (plugin, options, next) {
  options.paths = exports.paths;

  var arr = [
    exts.register,
    methods.register,
    routes.register,
    register
  ];

  async.eachSeries(arr, function (fn, done) {
    return fn(plugin, options, done);
  }, next);
};

exports.register.attributes = {
  pkg: require('./package.json')
};
