// Dependencies
var config = require('../../../config');
var log = require('../../logger');
var cleanObj = require('clean-obj');
var Publish = require('./Publish');

function PubSub(options) {
	// Sanity check for muzzley instance
	this.profile = options.profile || '';
	this.muzzleyInstance = options.muzzley || '';
}

/**
 * Subscribe method
 * @param [options] Optional options
 * @param cb
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
			log.error('PubSub -> subscribe() , needs a callback');
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
		return cb(null, sub);
	});

	sub.on('error', function (err) {
		return cb(err);
	});
};



PubSub.prototype.publish = function(channel) {
	var self = this;

	return new Publish({
		profile: self.profile,
		muzzley: self.muzzleyInstance,
		channel: channel
	});
};

module.exports = PubSub;