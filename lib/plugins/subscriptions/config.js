var _ = require('lodash');
var Joi = require('joi');


exports = module.exports = {};
exports.subscriptions = function (plugin, options) {
  var def = {
    validate: {
      payload: {
        channels: Joi.array().includes(Joi.object().keys({
           id: Joi.string(),
           status: Joi.string().allow('on', 'off').default('on')
         })).required()
      },
      query:{
        user: Joi.string().required()
      },
      params: {
        profileId: Joi.string().optional()
      }
    }
  };

  return _.merge(def, options.config);
};
