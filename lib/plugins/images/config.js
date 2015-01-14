var _ = require('lodash');

exports = module.exports = {};
exports.list = function (plugin, options) {
  var def = {
    auth: false    
  };

  return _.merge(def, options.config);
};
