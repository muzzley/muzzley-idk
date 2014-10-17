exports = module.exports = {};
exports.register = function (plugin, options, next) {
  plugin.method('authorization', function (next) {
    next();
  });
  next();
};
