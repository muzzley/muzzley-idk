var _ = require('lodash');
var Joi = require('joi');

exports = module.exports = {};
exports.list = function (plugin, options) {
  var def = {
    validate: {
      query: {
        user: Joi.string().required()
      }
    }
  };

  return _.merge(def, options.config);
};
