var Boom = require('boom');

var DiscoveryResult = function (options) {
  options = options || {};
  if (!options.discovery) {
    throw new Error('The `discovery` parameter is mandatory when instantiating a DiscoveryResult');
  }
  this.context = options.discovery.context;
  this.message = options.message;
  this.success = (typeof options.success === 'boolean') ? options.success : false;
};

DiscoveryResult.prototype.respond = function (hapiReplyFunc) {
  DiscoveryResult.respond({ message: this.message, success: this.success}, hapiReplyFunc);
};

/**
 * [respond description]
 * @param  {object} options       - message: the result description message
 *                                - success: true/false
 * @param  {Function} hapiReplyFunc The hapi 'reply' function
 * @return {undefined}
 */
DiscoveryResult.respond = function (options, hapiReplyFunc) {
  options = options || {};
  var success = (typeof options.success === 'boolean') ? options.success : false;
  var message = options.message;

  if (success) {
    // Respond 201 Created
    var response = {
      statusCode: 201,
      success: true,
      message: message || 'Discovery was successful.'
    };
    hapiReplyFunc(response).code(201);
  } else {
    // Respond 401 Unauthorized
    // {
    //   "statusCode": 401,
    //   "error": "Unauthorized",
    //   "message": "Discovery process was not successful"
    // }
    hapiReplyFunc(Boom.unauthorized(message || 'Discovery process was not successful!'));
  }
};

DiscoveryResult.prototype.export = function () {
  return {
    result: {
      success: this.success
    }
  };
};

exports = module.exports = DiscoveryResult;