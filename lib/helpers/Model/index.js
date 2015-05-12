// Dependencies
var factory = require('./factory');
var callsite = require('callsite');
var chalk = require('chalk');
var prefix = false;
var defaultStorage;

// Just to check the instanceof
var Storage = require('../Storage');

// Supported types, minus object
// object has a special check
var types = ['string', 'boolean', 'number', 'any', 'object'];

var Model = {};

// Throw a red error
function throwError (error) {
  throw new Error(chalk.red.bold(error));
}

Model.extend = function (options) {
  if (!prefix) {
    return throwError('First you need to set a prefix (good practice) before starting extending Model class');
  }

  options = options || {};

  options.prefix = prefix;

  // If user didnt set a name for the model
  // we will get the name of the file that called this function
  if (!options.name || typeof options.name !== 'string') {
    var stack = callsite();
    return throwError('You need to define a valid name for the model in ' + stack[1].getFileName());
  }

  if (!options.props || options.props.length <= 0) {
    return throwError('Model ' + options.name + ': must have at least one property defined');
  }

  if (!options.keys || options.keys.length <= 0) {
    return throwError('Model ' + options.name + ': must have at least one key defined');
  }

  options.strict = typeof options.strict !== 'undefined' ? options.strict : true;

  // check if all properties types are supported
  for (var k in options.props) {
    if (options.props.hasOwnProperty(k)) {
      var t;

      // If its a object
      // lazy check
      // TO-DO: improve this
      if (typeof options.props[k] === 'object') {
        t = 1;
      } else {
        t = types.indexOf(options.props[k]);
      }

      // Check if type is supported
      if (t < 0) {
        return throwError('Model ' + options.name + ': The type of the property ' + k + ' isn\'t supported -> ' + options.props[k]);
      }
    }
  }

  // Keys check
  options.keys.forEach(function (key) {
    // keys can only be root properties
    if (key.indexOf('.') > 0) {
      return throwError('Model ' + options.name + ': The keys of a model can only be root properties');
    }

    if (!options.props[key]) {
      return throwError('Model ' + options.name + ': The keys of a model must be a defined property in Model.extend');
    }
  });

  options.storage = options.storage || defaultStorage;

  if (!(options.storage && options.storage instanceof Storage)) {
    return throwError('Model ' + options.name + ': needs a valid storage instance');
  }

  return factory(options);
};

Model.setPrefix = function (name) {
  if (!prefix) {
    prefix = name;
  } else {
    return throwError('You can set only one time the prefix for preventing inconsistencies');
  }
};

Model.setStorage = function (storage) {
  if (!defaultStorage) {
    defaultStorage = storage;
  } else {
    return throwError('You can set only one time the storage for preceting inconsistencies, if you want ' +
    'to use a different storage for this model, use "storage" in Model.extend');
  }
};

module.exports = Model;
