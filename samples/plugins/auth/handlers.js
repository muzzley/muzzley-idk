// Dependencies
var config = require('config');
var Provider = require('lib/provider');
var Boom = require('boom');

var handlers = {};

handlers.login = function (request, reply) {
  // Crete new provider object with muzzley id
  var provider = new Provider({muzzleyId: request.query.user});

  // Authenticate and add token
  provider.addToken(request.payload.email, request.payload.password, function (err, credentials) {
    if (err) {
      return reply(Boom.badRequest('an error occurred, please try again later'));
    }

    if (!credentials) {
      return reply(Boom.badRequest('Invalid user credentials'));
    }

    request.redirectToAuthorization(credentials.providerId);
  });
};

handlers.authorization = function (request, reply) {
  var provider = new Provider({
    muzzleyId: request.query.user,
    providerId: request.query.providerId
  });

  // If user didn't allow
  if (!request.payload || !request.payload.choice || request.payload.choice != 'permit') {
    // Delete user token
    provider.removeToken(function () {
      return reply().redirect(config.muzzley.api.url + '/authorization?success=false');
    });
  } else {
    // If user allowed
    // Get all devices/channels and stores them
    provider.storeAllChannels(function (err) {
      if (err) {
        return reply().redirect(config.muzzley.api.url + '/authorization?success=false');
      }

      return reply().redirect(config.muzzley.api.url + '/authorization?success=true&user=' + request.query.user);
    });
  }
};

module.exports = handlers;
