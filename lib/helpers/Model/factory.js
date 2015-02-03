// Dependency
var chalk = require('chalk');

// Throw a cool red error
function throwError(error) {
  throw new Error(chalk.red.bold('Model '+this.name+': '+error));
}

var generateKeyFunct = function(prefix, name, keys) {
  return function(obj) {
    if(!obj) {
      return throwError('When using methods, the object keys must be set with all the model keys');
    }

    var k = prefix+':'+name+':';
    keys.forEach(function(key) {
      if(obj[key]) {
        k += obj[key]+':';
      } else {
        return throwError('Missing the key '+key+' from the keys object');
      }
    });

    return k.slice(0, -1);
  };
};

var generateConstructor = function(extendOptions) {
  var name = extendOptions.name;
  var props = extendOptions.props;
  var required = extendOptions.keys;

  throwError = throwError.bind({name: extendOptions.name});

  if(typeof extendOptions.required === 'object') {
    extendOptions.required.forEach(function(key) {
      if(required.indexOf(key) < 0) {
        required.push(key);
      }
    });
  }


  var recursiveValidation = function(opt, properties, strict) {
    var propertiesObject = {};

    for (var prop in opt) {
      if (opt.hasOwnProperty(prop)) {

        // Is it a object ?
        if(typeof properties[prop] === 'object') {
          // Just to be sure we dont
          // break anything
          if(typeof opt[prop] === 'object') {
            // call self
            propertiesObject[prop] = recursiveValidation(opt[prop], properties[prop]);
            continue;
          } else {
            return throwError('The property ' + prop + ' must be an object');
          }
        }

        if(strict) {
          if(typeof properties[prop] === 'undefined') {
            return throwError('The strict mode is on, so you can only construct the model with properties defiend');
          }

          // Type validation
          if(properties[prop] !== typeof opt[prop]) {
            return throwError('The property ' + prop + ' must be a '+ properties[prop]);
          }
        } else {
          // Strict mode is off
          // so we only check the type
          // of the properties defined
          // on extend
          if(typeof properties[prop] !== 'undefined') {
            // Type validation
            if(properties[prop] !== typeof opt[prop]) {
              return throwError('The property ' + prop + ' must be a '+ properties[prop]);
            }
          }
        }

        // Add it!
        propertiesObject[prop] = opt[prop];
      }
    }

    return propertiesObject;
  };

  var recursiveObjRequired = function(array, obj) {
    var result = false;

    array.forEach(function(reqObj, i) {
      if(i + 1 !== array.length) {
        if(obj[reqObj]) {
          obj = obj[reqObj];
        } else {
          return;
        }
      } else {
        if(obj[reqObj]) {
          result = true;
        }
      }
    });

    return result;
  };

  return function(options, strictObj) {
    options = options || {};
    strictObj = strictObj || {};

    var reqList = required.slice();
    var strict = strictObj.strict || extendOptions.strict;
    var err;

    // Recursive construction and validation of the object
    options = recursiveValidation(options, props, strict);

    reqList = reqList.filter(function(req) {
      // Is the requred property an
      // object ?
      if(req.indexOf('.') > 0) {
        var reqArray = req.split('.');
          if(recursiveObjRequired(reqArray, options)) {
            return false;
          }
      } else {
        if(options[req]) {
          return false;
        }
      }

      return true;
    });


    // More detailed error message
    // for required properties
    if(reqList.length > 0) {
      err = 'Model '+name+': ';
      if(reqList.length === 1) {
        err += 'The property ' + reqList[0] + ' is required';
      } else {
        err += 'The following properties are required -> ';

        reqList.forEach(function(p) {
          err += p+', ';
        });
        err = err.substr(0, err.length - 2);
      }
    }

    // Error throw
    if(err) {
      throw new Error(chalk.red.bold(err));
    }


    // Passing attributes to this
    // object
    for (var prop in options) {
      if (options.hasOwnProperty(prop)) {
        this[prop] = options[prop];
      }
    }
  };
};


module.exports = function(options) {

  /**
   * Constructor
   * @type {Prototype}
   */
  var Proto = generateConstructor(options);

  /**
  * Save the newly created Channel object
  *
  * @param {Function} callback
  * @access public
  * @returns {undefined}
  */
  Proto.prototype.save = function (callback) {
    var key = Proto.key(this);

    Proto.storage.client().set(key, JSON.stringify(this), callback);
  };


  /////////////// Methods ////////////////////

  // Important functions
  Proto.storage = options.storage;
  Proto.key = generateKeyFunct(options.prefix, options.name, options.keys);


  /**
  * Get one specific object
  *
  * @param {number|string} channelId
  * @param {Channel~callback} callback
  * @access public
  * @returns {undefined}
  */
  Proto.get = function (keyObj, callback) {
    var key = Proto.key(keyObj);
    Proto.storage.client().get(key, function (err, propsJson) {
      if (err) {
        return callback(new Error('Error loading channel: ' + err));
      }
      // If empty return empty callback
      if(!propsJson) {
        return callback();
      }

      var properties = JSON.parse(propsJson);
      var channel = new Proto(properties, {strict: false});

      return callback(null, channel);
    });
  };


  /**
  * Get multiple objects
  * @param {[type]}   key [description]
  * @param {Function} cb  [description]
  */
  Proto.mget = function(keyObj, cb) {
    var key = Proto.key(keyObj);
    Proto.storage.client().keys(key, function (err, keys) {
      if(err || keys.length < 1) {
        return cb(err, []);
      }

      Proto.storage.client().mget(keys, function (err, subscriptions) {
        if(err) {
          return cb(err);
        }

        for(var s in subscriptions) {
          subscriptions[s] = new Proto(JSON.parse(subscriptions[s]), {strict: false});
        }

        return cb(null, subscriptions);
      });
    });
  };


  /**
  * Delete channel from Redis
  *
  * @param {number|string} channelId
  * @param {Channel~callback} callback
  * @access public
  * @returns {undefined}
  */
  Proto.del = function(keyObj, callback) {
    var key = Proto.key(keyObj);
    Proto.storage.client().del(key, callback);
  };

  return Proto;
};