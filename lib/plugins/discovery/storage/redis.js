// TODO connection error handling... etc?
var Storage = require('../../../helpers/Storage');
var storage = Storage.getDefault();

var DISCOVERY_EXPIRE_TIME = 60 * 60; // 1h in seconds

var getKey = function (context) {
  return 'mf:discovery:' + context;
};

function get(context, callback) {
  if (!context) {
    return callback(new Error('No context provided'));
  }

  // Only load the Discovery module here so we can avoid
  // the mutual depency issue between models/Discovery and storage/redis

  storage.client().get(getKey(context), function (err, data) {
    if (err) {
      return callback(err);
    }

    var Discovery = require('../models/Discovery');
    var discovery = null;

    try {
      var obj = JSON.parse(data);
      discovery = new Discovery(obj);
    } catch (e) {
      return callback(new Error('Invalid Discovery object retrieved from storage'));
    }
    return callback(null, discovery);
  });
}

function set(discovery, callback) {
  if (!discovery || !discovery.context) {
    return callback(new Error('No discovery object provided or no context defined'));
  }
  var key = getKey(discovery.context);
  var data = JSON.stringify(discovery);
  var multi = storage.client().multi();
  multi.set(key, data);
  multi.expire(key, DISCOVERY_EXPIRE_TIME);
  multi.exec(callback);
}

exports = module.exports = {
  get: get,
  set: set
};