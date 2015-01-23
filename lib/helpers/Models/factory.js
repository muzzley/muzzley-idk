var _generateKeyFunct = function(managerName, name, keys) {
  return function() {
    var k = managerName+':'+name+':';
    keys.forEach(function(key) {
      k += key+':';
    });

    return k.slice(0, -1);
  };
};

module.exports = function(options) {
  var storage = options.storage;
  var managerName = options.managerName;
  var key = _generateKeyFunct(managerName, options.name, options.keys);


  var Proto = function() {};

  /**
  * Save the newly created Channel object
  *
  * @param {Function} callback
  * @access public
  * @returns {undefined}
  */
  Proto.prototype.save = function (callback) {
    var channelKey = key(this.id);

    this.storage().set(channelKey, JSON.stringify(this), callback);
  };


  /////////////// Methods ////////////////////

  /**
  * Get specific channel
  *
  * @param {number|string} channelId
  * @param {Channel~callback} callback
  * @access public
  * @returns {undefined}
  */
  Proto.get = function (channelId, callback) {
    var channelKey = keys.getChannelKey(channelId);
    this.storage().get(channelKey, function (err, propsJson) {
      if (err) {
        return callback(new Error('Error loading channel: ' + err));
      }
      // If empty return empty callback
      if(!propsJson) {
        return callback();
      }

      var properties = JSON.parse(propsJson);
      var channel = new Channel(properties);

      return callback(null, channel);
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
  Proto.del = function(channelId, callback) {
    var key = keys.getChannelKey(channelId);
    storage.client().del(key, callback);
  };
};
