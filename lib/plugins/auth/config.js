var _ = require('lodash');
var path = require('path');
var Joi = require('joi');
var empty = function () { };

function prefix(request, plugin) {
  // Maintaining backwards compability, 'plugin.config' is the right way, the other two are hacks 
  var route = (plugin.config && plugin.config.route) || request._route._env || request._route.env;
  var url = route && route.prefix || '/';
  return url;
}

function wrap(plugin, request, reply) {
  request.redirectToAuthorization = function (providerId) {
    var user = request.query.user;
    var href = path.normalize(prefix(request, plugin) + '/authorization');
    href += '?user=' + user;
    if(providerId) {
      href += '&providerId=' +providerId;
    }
    return reply.redirect(href);
  };
}

exports = module.exports = {};
exports.url = function (plugin, options) {
  function handler(request, reply) {
    var user = request.query.user;
    var href = path.normalize(prefix(request, plugin) + '/authentication');
    href += '?user=' + user;

    return reply({ authorizationUrl: options.url + href });
  }

  return {
    auth: false,
    validate: {
      query: {
        user: Joi.string().required()
      }
    },
    handler: handler
  };
};

exports.authentication = function (plugin, options) {
  function handler(request, reply) {
    var context = _.clone(options.auth);
    context.crumb = request.server.plugins.crumb.generate(request, reply);
    context.prefix = prefix(request, plugin);
    return reply.view('authentication', context);
  }

  return {
    auth: false,
    validate: {
      query: {
        user: Joi.string().required()
      }
    },
    handler: handler
  };
};

exports.confirm = function (plugin, options) {
  var payload = { };
  var inputs = _.clone(options.auth.inputs);
  for (var key in inputs) {
    payload[key] = Joi.string().required();
  }
  payload.crumb = Joi.string();

  var def = {
    auth: false,
    validate: {
      query: {
        user: Joi.string().required()
      },
      payload: payload
    }
  };

  var config = _.merge(def, options.auth.config);
  var handler = options.auth.config.handler || empty;
  config.handler = function (request, reply) {
    wrap(plugin, request, reply);
    return handler(request, reply);
  };
  return config;
};

exports.authorization = function (plugin, options) {
  function handler(request, reply) {
    var context = _.clone(options.authz);
    context.crumb = request.server.plugins.crumb.generate(request, reply);
    context.prefix = prefix(request, plugin);
    return reply.view('authorization', context);
  }

  return {
    auth: false,
    validate: {
      query: {
        user: Joi.string().required(),
        providerId: Joi.string()
      }
    },
    handler: handler
  };
};

exports.authorize = function (plugin, options) {
  var def = {
    auth: false,
    validate: {
      query: {
        user: Joi.string().required(),
        providerId: Joi.string()
      },
      payload: {
        choice: Joi.string().valid('cancel', 'permit').required(),
        crumb: Joi.string()
      }
    }
  };

  var config = _.merge(def, options.authz.config);
  var handler = config.handler;
  config.handler = function (request, reply) {
    wrap(plugin, request, reply);
    return handler(request, reply);
  };
  return config;
};
