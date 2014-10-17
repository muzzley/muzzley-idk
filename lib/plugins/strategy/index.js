var Boom = require('boom');

exports.register = function (plugin, options, next) {
  plugin.register(require('hapi-auth-hawk'), function (err) {
    if (err) {
      return next(err);
    }

    plugin.auth.strategy('default', 'hawk', {
      getCredentialsFunc: function (id, callback) {
        var api = plugin.plugins['api-plugin'].api;
        if (!api) {
          return callback(null, { });
        }

        if (id !== api.credentials.id) {
          return callback(Boom.unauthorized());
        }

        api.hawk(function (err, credentials) {
          if (err) {
            return callback(err);
          }

          if (!credentials) {
            return callback(Boom.unauthorized());
          }

          return callback(null, credentials);
        });
      }
    });

    plugin.servers.forEach(function (server) {
      server.auth.default('default');
    });

    next();
  });
};

exports.register.attributes = {
  pkg: require('./package.json')
};
