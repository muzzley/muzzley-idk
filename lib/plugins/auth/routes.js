var config = require('./config');

exports = module.exports = {};
exports.register = function (plugin, options, next) {
  if (typeof options.auth !== 'object' ||
    typeof options.authz !== 'object') {
    return next();
  }

  plugin.route({
    path: '/authentication',
    method: 'GET',
    config: config.authentication(plugin, options)
  });

  plugin.route({
    path: '/authentication',
    method: 'POST',
    config: config.confirm(plugin, options)
  });

  plugin.route({
    path: '/authorization',
    method: 'GET',
    config: config.authorization(plugin, options)
  });

  plugin.route({
    path: '/authorization',
    method: 'POST',
    config: config.authorize(plugin, options)
  });

  plugin.route({
    path: '/public/views/{p*}',
    method: 'GET',
    config: {
      auth: false
    },
    handler: {
      directory: {
        path: [__dirname, 'views', 'public'].join('/')
      }
    }
  });

  next();
};

