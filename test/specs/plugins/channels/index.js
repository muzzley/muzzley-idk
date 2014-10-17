/*jshint -W030 */

var Lab = require('lab');
var Hapi = require('hapi');
var async = require('async');
var lib = require('lib').plugins;

Lab.experiment('[channels] plugin', function () {
  Lab.before(function (done) {
    var model = [
      { content: 'content 1' },
      { content: 'content 2' }
    ];

    this.options = {
      model: model,
      config: {
        handler: function (request, reply) {
          return reply(model);
        }
      }
    };

    this.server = Hapi.createServer();
    this.server.pack.register({
      plugin: lib.channels,
      options: this.options
    }, done);
  });

  var arr = [
    require('./channels')
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
