var DiscoveryStepAction = function (options) {
  options = options || {};

  this.id = 'a-' + options.step + '-' + options.index;
  this.type = options.type;
  this.params = options.params;
};

DiscoveryStepAction.prototype.export = function (options) {
  options = options || {};
  var version = options.version || 1;

  switch (version) {
    case 1:
      /* falls through */
    default:
      return {
        id: this.id,
        type: this.type,
        params: this.params
      };
  }
};

exports = module.exports = DiscoveryStepAction;