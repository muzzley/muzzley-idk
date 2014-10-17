// Dependencies 
var async = require('async');
var Subscription = require('lib/models/Subscription');

var routes = {};

routes.subscribe = function (request, reply) {
  var muzzleyId = request.query.user;
  
  async.each(request.payload.channels, function (channel, cb) {

    Subscription.get(muzzleyId, channel.id, function(err, subscription) {
      if(err) return cb(err);
      
      subscription.status = channel.status;
      subscription.save(cb);
    });

  }, function (err) {
    reply(200);
  });
};


module.exports = routes;