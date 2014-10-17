var Api = require('../../api');

exports = module.exports = {};
exports.register = function (plugin, options, next) {
  if (typeof options.id !== 'string') {
    return next(new Error('options must have an \'id\' string'));
  }

  if (typeof options.key !== 'string') {
    return next(new Error('options must have a \'key\' string'));
  }

  var api = new Api(options.id, options.key, options.options);
  plugin.method('api', function () {
    return api;
  });

  plugin.expose('api', api);
  return next();
};
