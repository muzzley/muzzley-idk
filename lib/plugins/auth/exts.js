var _ = require('lodash');
exports = module.exports = {};

function prefix(request, plugin) {
  // Maintaining backwards compability, 'plugin.config' is the right way, the other two are hacks
  var route = (plugin.config && plugin.config.route) || request._route._env || request._route.env;
  var url = route && route.prefix || '/';
  return url;
}

var l = '/authentication';
function response(plugin, options) {
  return function (request, reply) {
    if (request.route.path.indexOf(l, this.length - l.length) !== -1) {
      var output = request.response.output;
      if (output && output.statusCode === 400) {
        var values = {};
        for (var key in request.payload) {
          values[key] = {
            value: request.payload[key]
          };
        }

        var context = _.clone(options.auth);
        context.inputs = _.merge(_.clone(values), context.inputs);
        context.crumb = request.server.plugins.crumb.generate(request, reply);
        context.prefix = prefix(request, plugin);

        var validation = output.payload.validation || {};
        context.validation = validation.keys || [];
        context.message = output.payload.message;
        delete context.inputs.crumb;

        return reply.view('authentication', context);
      }
    }
    return reply();
  };
}

exports.register = function (plugin, options, next) {
  plugin.ext('onPreResponse', response(plugin, options));
  next();
};
