var properties = require('./package.json');
var config = require('./config');

exports = module.exports = {};
exports.name = properties.name;
exports.version = properties.version;

exports.register = function (plugin, options, next) {

  plugin.route({
    method: 'GET',
    path: '/images/{filename*}',
    config: config.list(plugin, options)
  });

  next();
};

exports.register.attributes = {
  pkg: properties
};
