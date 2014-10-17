/*jshint -W030 */

var Lab = require('lab');
var Hapi = require('hapi');
var async = require('async');
var lib = require('lib').plugins;

Lab.experiment('[subscriptions] plugin', function () {
  Lab.before(function (done) {
    this.options = {
      config: {
        handler: function (request, reply) {
          return reply();
        }
      }
    };

    this.server = Hapi.createServer();
    this.server.pack.register({
      plugin: lib.subscriptions,
      options: this.options
    }, done);
  });

  var arr = [
    require('./subscriptions')
  ];

  async.eachSeries(arr, function (test, done) {
    test.run();
    done();
  });

  Lab.after(function (done) {
    delete this.server;
    delete this.options;
    done();
  });
});
