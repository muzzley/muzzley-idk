var crypto = require('crypto');
var storage = require('../storage/abstract');

var Discovery = function (options) {
  options = options || {};

  this.baseUrl = options.baseUrl;

  this.userId = options.userId || null;

  this.context = options.context || Discovery.generateContext();
  this.title = options.title || '';
  this.description = options.description || '';
  this.image = options.image || 'https://www.muzzley.com/imgs/Logo.png';
  this.steps = options.steps || 1;
  this.connectionType = options.connectionType || null;
  this.nextStepUrl = options.nextStepUrl || this.getStepUrl({step: 1});

  this.remember = options.remember || {};
};

Discovery.setStorage = function (strg) {
  storage = strg;
};

Discovery.generateContext = function () {
  // The default context is an MD5 hash of the current timestamp plus 4 random characters
  var suffixLen = 4;
  var randomSuffix = crypto.randomBytes(Math.ceil(suffixLen / 2)).toString('hex').slice(0, suffixLen);
  var hashingString = Date.now() + randomSuffix;
  var context = crypto.createHash('md5').update(hashingString).digest('hex');
  return context;
};

Discovery.prototype.getStepUrl = function (options) {
  options = options || {};
  var baseUrl = options.baseUrl || this.baseUrl; // http://host/discovery/
  var step = options.step;

  // Only load ../index.js here to avoid multi-dependency issue (index.js also depends on this file)
  var uri = require('../index').uris.step.replace('{context}', this.context);
  uri = uri.replace('{step}', step);

  return baseUrl + uri;
};

Discovery.prototype.save = function (callback) {
  if (!storage) {
    return callback(new Error('No storage engine defined'));
  }
  storage.set(this, callback);
};

Discovery.get = function (context, callback) {
  if (!storage) {
    return callback(new Error('No storage engine defined'));
  }
  storage.get(context, callback);
};

/**
 * Export a versioned representation of the Discovery object.
 * It's the Presenter pattern.
 */
Discovery.prototype.export = function (options) {
  options = options || {};
  var version = options.version || 1;

  switch (version) {
    case 1:
    /* falls through */
    default:
      return {
        context: this.context,
        userId: this.userId,
        title: this.title,
        description: this.description,
        image: this.image,
        steps: this.steps,
        connectionType: this.connectionType,
        nextStepUrl: this.nextStepUrl
      };
  }
};

exports = module.exports = Discovery;
