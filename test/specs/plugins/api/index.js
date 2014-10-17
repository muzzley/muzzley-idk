/*jshint -W030 */

var Lab = require('lab');
var Hapi = require('hapi');
var lib = require('lib').plugins;

Lab.experiment('[api] plugin', function () {
  Lab.experiment('throws error', function () {
    Lab.test('when \'id\' isn\'t present', function (done) {
      var server = Hapi.createServer();
      var plugin = { plugin: lib.api };
      server.pack.register(plugin, function (err) {
        Lab.expect(err).to.exist;
        Lab.expect(err).to.be.instanceOf(Error);

        Lab.expect(err.message).to.exist;
        Lab.expect(err.message).to.have.string('id');
        done();
      });
    });

    Lab.test('when \'key\' isn\'t present', function (done) {
      var options = {
        id: 'dh37fgj492je'
      };

      var server = Hapi.createServer();
      var plugin = { plugin: lib.api, options: options };
      server.pack.register(plugin, function (err) {
        Lab.expect(err).to.exist;
        Lab.expect(err).to.be.instanceOf(Error);

        Lab.expect(err.message).to.exist;
        Lab.expect(err.message).to.have.string('key');
        done();
      });
    });
  });

  Lab.experiment('correct usage', function () {
    Lab.before(function (done) {
      var options = {
        id: 'dh37fgj492je',
        key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn'
      };

      var self = this;
      this.server = Hapi.createServer();
      var plugin = { plugin: lib.api, options: options };
      this.server.pack.register(plugin, function (err) {
        Lab.expect(err).to.not.exist;
        Lab.expect(self.server.methods.api).to.exist;

        done();
      });
    });

    Lab.test('makes the created instance available on method list', function (done) {
      var req = {
        method: 'get',
        url: '/'
      };

      this.server.route({
        path: '/',
        method: 'get',
        handler: function (request, reply) {
          var methods = request.server.methods;
          Lab.expect(methods).to.respondTo('api');

          var api = methods.api();
          Lab.expect(api).to.exist;
          Lab.expect(api).to.respondTo('post');
          return reply();
        }
      });

      this.server.inject(req, function (response) {
        Lab.expect(response).to.exist;
        return done();
      });

    });

    Lab.after(function (done) {
      delete this.server;
      done();
    });
  });
});
