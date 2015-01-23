var factory = require('./factory');
var managerName = false;

var Model = {};


Model.extend = function(options) {
  if(!managerName) {
    throw new Error('First you need to set a manager name before starting extending Model class');
  }

  options = options || {};

  if(!(options.storage && options.storage.client &&
  typeof options.storage.client === 'function')) {
    throw new Error('Model needs a valid storage instance');
  }

  var storage = options.storage.client;

  return factory()
};

Model.setManagerName = function(name) {
  if(!managerName) {
    managerName = name;
  } else {
    throw new Error('You can only set one time the manager name for good practice');
  }
};


module.exports = Model;
