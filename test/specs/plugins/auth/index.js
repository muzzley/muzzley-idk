/*jshint -W030 */

var Lab = require('lab');
var Hapi = require('hapi');
var Boom = require('boom');
var async = require('async');
var lib = require('lib').plugins;

Lab.experiment('[auth] plugin', function () {
  Lab.before(function (done) {
    this.options = {
      auth: {
        title: 'authentication',
        subtitle: 'authentication form',
        inputs: {
          username: {
            placeholder: 'username',
            name: 'name'
          },
          password: {
            type: 'password',
            description: 'password'
          }
        },
        config: {
          handler: function (request, reply) {
            var username = request.payload.username;
            var password = request.payload.password;
            if (username === 'username' && password === 'password') {
              return request.redirectToAuthorization();
            }
            return reply(Boom.badRequest('wrong username or password'));
          }
        }
      },
      authz: {
        permissions: {
          available: ['a', 'b', 'c'],
          unavailable: ['d', 'e']
        },
        config: {
          handler: function (request, reply) {
            var choice = request.payload.choice;
            if (choice === 'permit') {
              return reply().redirect('/');
            }
            return request.redirectToAuthorization();
          }
        }
      }
    };

    var options = {
      plugin: lib.auth,
      options: this.options
    };

    this.server = Hapi.createServer();
    this.server.pack.register(options, done);
  });

  var arr = [
    require('./auth'),
    require('./authz')
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
