// Dependencies
var _ = require('lodash');
var url = require('url');
var request = require('request');
var config = require('../../../config');
var Storage = require('../Storage');
var crypto = require('crypto');

// Configs
var prefix = 'framework:hawk_key:';
var defaults = {
  algorithm: 'sha256',
  url: config.get('muzzley.url'),
  secure: true,
  storage: new Storage(config.get('redis'))
};

/**
 * Constructor of Class Api
 *
 * @param {String} id      The profile id, this id is used to identify the
 *                         profile against the Api and is used to authenticate
 *                         the requests
 * @param {String} key     The profile key to authenticate the request. This
 *                         property and the id are used to authenticate the
 *                         request using hawk scheme
 * @param {Object} options This is used to override default configurations,
 *                         see the source to know more
 * @class
 * @classdesc Create an instance that wraps and abstract the Muzzley Api           
 */
function Api(id, key, options) {
  if (typeof id !== 'string') {
    throw new Error('id must be a string');
  }

  if (typeof key !== 'string') {
    throw new Error('key must be a string');
  }

  this.options = _.merge(defaults, options);
  this.credentials = {
    id: id,
    key: key,
    algorithm: this.options.algorithm
  };

  this.storage = this.options.storage;

  var self = this;
  this.storage.client().get(prefix + id, function (err, value) {
    if (err) {
      return;
    }

    if (!value) {
      self.generate(function () {
        // all went well I hope
      });
    }
  });
}

Api.prototype._request = function (options, callback) {
  options.hawk = {
    credentials: this.credentials
  };

  function fn(err, res, payload) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode < 200 || res.statusCode > 299 ) {
      payload = payload || { };
      payload.message = payload.message || 'the status code indicates an error';

      err = new Error();
      err = _.merge(err, payload);
      err.code = res.statusCode;
      return callback(err);
    }

    return callback(err, res, payload || { });
  }

  var m = options.method.toLowerCase();
  if (request[m]) {
    return request[m](options, fn);
  } else {
    return request(options, fn);
  }
};

Api.prototype.post = function (name, posts, callback) {
  var href = _.clone(this.options.url);
  href.pathname = ['channels', name, 'events'].join('/');
  href = url.format(href);

  var options = {
    url: href,
    method: 'post',
    headers: { },
    json: posts
  };

  this._request(options, function (err) {
    if (err) {
      return callback(err);
    }

    return callback();
  });
};

Api.prototype.summary = function (name, content, callback) {
  var href = _.clone(this.options.url);
  href.pathname = ['channels', name].join('/');
  href = url.format(href);

  var options = {
    url: href,
    method: 'put',
    json: content
  };

  this._request(options, function (err) {
    if (err) {
      return callback(err);
    }

    return callback();
  });
};

Api.prototype.revoke = function (user, callback) {
  var href = _.clone(this.options.url);
  href.pathname = ['users', user].join('/');
  href = url.format(href);

  var options = {
    url: href,
    method: 'put',
    json: { authorized: false }
  };

  this._request(options, function (err) {
    if (err) {
      return callback(err);
    }

    return callback();
  });
};

Api.prototype.generate = function (callback) {
  var content = [
    Date.now().toString(),
    this.credentials.id
  ].join(',');

  var key = crypto.createHash('sha256')
    .update(content).digest('hex');

  var payload;
  if (typeof key === 'string') {
    payload = {
      auth: {
        key: key,
        algorithm: 'sha256'
      }
    };
  } else {
    payload = key;
  }

  var href = _.clone(this.options.url);
  href.pathname = ['profiles', this.credentials.id].join('/');
  href = url.format(href);

  var options = {
    url: href,
    method: 'put',
    json: payload
  };

  var self = this;
  this._request(options, function (err) {
    if (err) {
      return callback(err);
    }

    self.storage.client().set(prefix + self.credentials.id, key, function (err) {
      return callback(err);
    });
  });
};

Api.prototype.hawk = function (callback) {
  var self = this;
  this.storage.client().get(prefix + this.credentials.id, function (err, value) {
    if (err) {
      return callback(err);
    }

    if (!value) {
      self.generate(function () {
        // all went well I hope
      });
      return callback(null, null);
    }

    return callback(null, {
      id: self.credentials.id,
      key: value,
      algorithm: 'sha256'
    });
  });
};

exports = module.exports = Api;
