var _ = require('lodash');
var Joi = require('joi');

exports = module.exports = {};
exports.auth = function (plugin, options) {

  function defaultHandler(request, reply) {
    var user = request.query.user;

    // Respond that our authorization URL is at
    // muzdiscovery://host/discovery/123
    var schema = options.schema || 'muzdiscovery';
    var host = options.host || request.info.host;
    var discoveryUri = require('./index').uris.intro;
    if (request.params && request.params.profileId) {
      discoveryUri = require('./index').uris.introWithProfile;
      discoveryUri = discoveryUri.replace('{profileId}', request.params.profileId);
    }
    discoveryUri = discoveryUri.replace('{user}', user);
    var url = schema + '://' + host + discoveryUri;
    return reply({ authorizationUrl: url });
  }

  var def = {
    validate: {
      query: {
        user: Joi.string().required()
      }
    },
    handler: defaultHandler
  };

  return _.merge(def, options.config);
};

exports.intro = function (plugin, options) {
  // function handler(request, reply) {
  //   options.intro.handler(request, reply);
  // }

  var def = {
    validate: {
      params: {
        profileId: Joi.string(),
        user: Joi.string().required()
      }
    }
    // ,handler: handler
  };

  return _.merge(def, options.config);
};

var stepParamValidation = {
  context: Joi.string().required(),
  step: Joi.number().integer().min(1).required()
};

exports.getStep = function (plugin, options) {
  // function handler(request, reply) {
  //   options.getStep.handler(request, reply);
  // }

  var def = {
    validate: {
      params: stepParamValidation
    }
    // , handler: handler
  };

  return _.merge(def, options.config);
};

exports.postStep = function (plugin, options) {
  // function handler(request, reply) {
  //   options.postStep.handler(request, reply);
  // }

  var def = {
    validate: {
      params: stepParamValidation
    }
    // , plugins: {
    //   crumb: false
    // }
    // , handler: handler
  };

  return _.merge(def, options.config);
};
