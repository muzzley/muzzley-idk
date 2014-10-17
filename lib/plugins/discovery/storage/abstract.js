var memory = require('./memory');
var redis = require('./redis');

// Use the memory engine by default but allow changing it
var storageEngine = memory;

exports = module.exports = {
  setStorageEngine: function (engine) {
    if (typeof engine === 'string') {
      switch (engine) {
        case 'redis':
          storageEngine = redis;
          break;
        case 'memory':
          /* falls through */
        default:
          storageEngine = memory;
      }
    } else {
      storageEngine = engine;
    }
  },
  get: function () {
    if (!storageEngine) {
      throw new Error('No storage engine defined');
    }
    storageEngine.get.apply(this, arguments);
  },
  set: function () {
    if (!storageEngine) {
      throw new Error('No storage engine defined');
    }
    storageEngine.set.apply(this, arguments);
  }
};
