var routes = require('./routes');
var storage = require('./storage/abstract');

var uris = {
  auth: '/authorization',
  authWithProfile: '/profiles/{profileId}/authorization/',
  intro: '/discovery/{user}',
  introWithProfile: '/profiles/{profileId}/discovery/user/{user}',
  step: '/discovery/{context}/step/{step}'
};

function register(plugin, options, next) {
  if (!options.intro || !options.intro.config || typeof options.intro.config.handler !== 'function') {
    return next(new Error('options must have an \'intro\' handler function'));
  }

  if (!options.getStep || !options.getStep.config || typeof options.getStep.config.handler !== 'function') {
    return next(new Error('options must have a \'getStep\' handler function'));
  }

  if (!options.postStep || !options.postStep.config || typeof options.postStep.config.handler !== 'function') {
    return next(new Error('options must have a \'postStep\' handler function'));
  }

  if (options.storage) {
    storage.setStorageEngine(options.storage);
  }

  if (options.auth) {
    plugin.route({
      path: options.auth.uri, // /authorization or something else
      method: 'GET',
      config: routes.auth(plugin, options.auth)
    });
  }

  plugin.route({
    path: options.intro.uri || uris.intro, // /discovery/{user}
    method: 'GET',
    config: routes.intro(plugin, options.intro)
  });

  plugin.route({
    path: uris.step, // /discovery/{context}/step/{step}
    method: 'GET',
    config: routes.getStep(plugin, options.getStep)
  });
  plugin.route({
    path: uris.step, // /discovery/{context}/step/{step}
    method: 'POST',
    config: routes.postStep(plugin, options.postStep)
  });
  return next();
}

exports = module.exports = {};

exports.register = register;
exports.register.attributes = {
  pkg: require('./package.json')
};
exports.uris = uris;

exports.models = {
  Discovery: require('./models/Discovery'),
  DiscoveryStep: require('./models/DiscoveryStep'),
  DiscoveryStepAction: require('./models/DiscoveryStepAction'),
  DiscoveryResult: require('./models/DiscoveryResult')
};

exports.storage = {
  memory: require('./storage/memory'),
  redis: require('./storage/redis')
};
