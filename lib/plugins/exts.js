exports = module.exports = {};

function onRequestExt(plugin, options) {
  return function (request, next) {
    var basePath = options.basePath;
    if (!basePath) {
      return next();
    }

    if (request.path.indexOf(basePath) === 0) {
      request.setUrl(request.path.slice(basePath.length));
    }
    return next();
  };
}

exports.register = function (plugin, options, next) {
  plugin.ext('onRequest', onRequestExt(plugin, options));
  next();
};
