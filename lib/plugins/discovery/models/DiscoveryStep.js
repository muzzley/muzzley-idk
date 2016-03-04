var DiscoveryStepAction = require('./DiscoveryStepAction');

var DiscoveryStep = function (options) {
  options = options || {};

  if (!options.discovery) {
    throw new Error('The `discovery` parameter is mandatory when instantiating a DiscoveryStep');
  }

  this.context = options.discovery.context;

  this.step = options.step;
  this.title = options.title || '';
  this.resultUrl = options.discovery.getStepUrl({ step: this.step });

  this.actions = [];
};

DiscoveryStep.Types = {
  HTTP: 'http',
  UPNP_DISCOVERY: 'upnp-discovery'
};

DiscoveryStep.prototype.createAction = function (options) {
  var actionIndex = this.actions.length + 1;
  var action = new DiscoveryStepAction({
    index: actionIndex,
    step: this.step,
    type: options.type,
    params: options.params
  });
  this.actions.push(action);

  return action;
};

DiscoveryStep.prototype.export = function (options) {
  options = options || {};
  var version = options.version || 1;

  switch (version) {
    case 1:
    /* falls through */
    default:
      var actions = [];
      if (Array.isArray(this.actions)) {
        actions = this.actions.map(function (action) {
          // Get the versioned presenter of each action
          return action.export({ version: version });
        });
      }

      return {
        context: this.context,
        step: this.step,
        title: this.title,
        resultUrl: this.resultUrl,
        actions: actions
      };
  }
};

DiscoveryStep.prototype.respond = function (hapiReplyFunc) {
  hapiReplyFunc(this.export());
};

exports = module.exports = DiscoveryStep;
