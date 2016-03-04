var Util = require('util');
var Redis = require('redis');
var config = require('../../../config');
var Logger = require('../Logger');
var EventEmitter = require('events').EventEmitter;

var log = Logger(config.get('logger'));

/**
 * @param {object} options Parametrization options that are used
 *                         to create the Redis connection
 *                         - port
 *                         - host
 *                         - options
 */
function Storage (options) {
  options = options || {};
  this.options = {
    host: options.host || null,
    port: options.port || null,
    options: options.options || {}
  };
  EventEmitter.apply(this);
  // this.__create();
}
Util.inherits(Storage, EventEmitter);

var defaultStorage = null;
var idkStorage = null;
var defaultOptions = {};

Storage.setDefaultOptions = function (options) {
  defaultOptions = options;
};

Storage.getDefault = function () {
  return defaultStorage || (defaultStorage = new Storage(defaultOptions));
};

Storage.setDefault = function (storageInstance) {
  defaultStorage = storageInstance;
};

Storage.getIdkStorage = function () {
  return idkStorage || (idkStorage = new Storage(defaultOptions));
};

Storage.setIdkStorage = function (storageInstance) {
  idkStorage = storageInstance;
};

Storage.prototype.__newListener = function (type) {
  var count = EventEmitter.listenerCount(this, type);
  if (count === 0) {
    log.debug({ type: type }, '[subscribe] \'' + type + '\'');
    this.subscriber().subscribe(type);
  }
};

Storage.prototype.__messageListener = function () {
  function listener (type, message) {
    try {
      message = JSON.parse(message);
    } catch (e) {
      // YEAH! We are hiding a nasty parse error,
      // not that bad you know?
    }
    log.debug({ type: type, message: message },
      '[type] \'' + type + '\' [message] ' + '\'' + JSON.stringify(message) + '\'');
    this.emit(type, message);
  }

  return this._messageListener || (this._messageListener = listener.bind(this));
};

Storage.prototype.__removeListener = function (type) {
  var count = EventEmitter.listenerCount(this, type);
  if (count === 0) {
    log.debug({ type: type }, '[unsubscribe] \'' + type + '\'');
    this.subscriber().unsubscribe(type);
  }
};

Storage.prototype.__createClient = function () {
  log.debug('Creating Redis connection with options.', this.options);
  return Redis.createClient(this.options.port, this.options.host, this.options.options);
};

Storage.prototype.client = function () {
  return this._client || (this._client = this.__createClient());
};

Storage.prototype.publisher = function () {
  return this._publisher || (this._publisher = Redis.createClient(this.options));
};

Storage.prototype.subscriber = function () {
  if (this._subscriber) {
    return this._subscriber;
  }
  this._subscriber = Redis.createClient(this.options);
  // register a listener to handle the messages from the subscription channels.
  // we need to pass 'this' so we can emit events to the listeners
  this._subscriber.on('message', this.__messageListener());

  // register a listener to handle when a listener is removed.
  // this is used to unsubscribe a subscription if no more listeners
  // remain
  this.on('removeListener', this.__removeListener)
    // register a listener to handle when a listener is added.
    // this is used to unsubscribe a subscription if no more listeners
    // remain
    .on('newListener', this.__newListener);

  return this._subscriber;
};

Storage.prototype.publish = function (type, message) {
  if (typeof message !== 'string') {
    message = JSON.stringify(message);
  }
  this.publisher().publish(type, message);
  return this;
};

Storage.prototype.recreate = function () {
  // this.destroy().__create();
  this.destroy();
};

Storage.prototype.destroy = function () {
  // to destroy the publisher we need to end the connection and delete the reference
  // to the publisher
  var publisher = this.publisher();
  publisher.end();
  delete this._publisher;

  // to destroy the subscriber we need to end the connection and delete the reference
  // to the subscriber
  var subscriber = this.subscriber();
  subscriber.removeListener('message', this.__messageListener());
  subscriber.end();
  delete this._subscriber;

  return this;
};

exports = module.exports = Storage;
