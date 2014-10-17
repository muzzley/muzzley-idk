var _ = require('lodash');
var Joi = require('joi');

exports = module.exports = {};
exports.list = function (plugin, options) {
  var def = {
    
  };

  return _.merge(def, options.config);
};
