// Dependencies
var cleanObj = require('clean-obj');
var async = require('async');
var extend = require('extend');

/**
 * This abstracts the way you publish and subscribe in muzzley ecosystem,
 * Making it more easier and pain-less to the developer to publish and subscribe.
 * @param options
 * @constructor
 */
function PubSub(options) {
  // To-Do Sanity check for muzzley instance

  this.profile = options.profile || '';
  this.muzzleyInstance = options.muzzley || '';
  this.log = options.log || {
    error: function () {
    },
    debug: function () {
    }
  };
}

/**
 * Subscribe method
 * @param [options] This parameter is optional,
 *                  This allow you to specify what you want to subscribe, instead of the whole profile.
 *                  this is optional, because in most cases you just want to subscribe to the whole profile.
 *                  PS: you can pass the callback as the first argument, instead of (null, cb).
 *                  for example:
 *                   .subscribe(function(err, subscription) {
 *
 *                   })
 *
 * @param cb Callback to know if the subscribe was successful or not, returning in
 *           in the following format (err, subscription)
 */
PubSub.prototype.subscribe = function (options, cb) {
  var self = this;
  var optionsPayload;

  if (Object.prototype.toString.call(options) === '[object Function]') {
    cb = options;
    optionsPayload = {};
  } else {
    if (Object.prototype.toString.call(cb) === '[object Function]') {
      optionsPayload = options || {};
    } else {
      self.log.error('PubSub -> subscribe() , needs a callback');
      return;
    }
  }

  // Payload structure
  var payload = {
    profile  : self.profile,
    channel  : optionsPayload.channel,
    component: optionsPayload.component,
    property : optionsPayload.property
  };

  // Clean obj
  payload = cleanObj(payload, true);

  var sub = self.muzzleyInstance.subscribe({
    namespace: 'iot',
    payload  : payload
  });

  sub.on('subscribe', function () {
    self.log.debug(payload, 'PubSub -> subscribe() ,  done w/ the payload');
    return cb(null, sub);
  });

  sub.on('error', function (err) {
    return cb(err);
  });
};

/**
 * Publish method
 * @param channel Channel Id of the device
 * @param component Device component
 * @param data You can pass an object or array,
 *             if you pass an object you want to do a single publish,
 *             but if you want to do a multiple publish you pass an array.
 *
 *             The object(s) to be passed must have the following structure:
 *             {
 *                property: 'property-1',
 *                data: 'value-1',  // This can be a string, an object or an array
 *                cb: function() {} // This is optional, the default behaviour of this abstraction of publish
 *                                  // is to do One-way requests, but if you want to do a RPC request, you pass this
 *             }
 *
 *
 * @returns {log.error || this.__publishMultiple}
 */
PubSub.prototype.publish = function (channel, component, data) {
  var self = this;

  if (typeof component === 'undefined' ||
    typeof data === 'undefined' || typeof channel === 'undefined') {
    return self.log.error('PubSub -> publish() , missing the required arguments.');
  }

  return self.__publishMultiple(channel, component, data);
};


/**
 * Publish multiple method
 * @param channel
 * @param component
 * @param obj
 * @returns {*}
 * @private
 */
PubSub.prototype.__publishMultiple = function (channel, component, obj) {
  var self = this;

  // Default payload
  var payload = {};

  // Set channel, io and component
  payload.channel = channel;
  payload.io = 'i'; // For now it will always be 'i' (inform)
  payload.component = component;

  // Check if data is an array or an object
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    // Single publish
    payload.property = obj.property;
    payload.data = obj.data;
    payload.cb = obj.cb;

    return self.__publishSingle(payload);
  } else if (Object.prototype.toString.call(obj) === '[object Array]') {
    // Multiple publish
    return async.each(obj,
      function (item, done) {
        if (Object.prototype.toString.call(item) !== '[object Object]') {
          return done('PubSub -> publishMultiple() , If you are using an array, you must assure all entries are objects');
        }

        var currentPayload = {};

        // extend from default
        extend(currentPayload, payload);

        // set property
        currentPayload.property = item.property;
        currentPayload.data = item.data;
        currentPayload.cb = item.cb;

        // Clean object
        currentPayload = cleanObj(currentPayload, true);

        // Single Publish
        self.__publishSingle(currentPayload);
        return done();
      },
      function (err) {
        if (err) {
          self.log.error(err);
        }
      });
  } else {
    return self.log.error('PubSub -> publish() , data argument must be an object or array.');
  }
};

/**
 * Publish single method
 * @param objPayload
 * @returns {log.error|this.__publishMultiple|*}
 * @private
 */
PubSub.prototype.__publishSingle = function (objPayload) {
  var self = this;

  var payload = {
    // data from constructor
    profile  : self.profile,

    // incoming data
    io       : 'i',
    channel  : objPayload.channel,
    component: objPayload.component,
    property : objPayload.property,
    data     : objPayload.data
  };

  // Clean object
  payload = cleanObj(payload, true);

  self.log.debug(objPayload, 'PubSub -> publish(), w/ payload');

  return self.muzzleyInstance.publish({
    namespace: 'iot',
    payload  : payload
  }, objPayload.cb);
};

// Export it
module.exports = PubSub;
