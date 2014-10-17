/*jshint -W030 */

var Lab = require('lab');
var cheerio = require('cheerio');

exports = module.exports = {
  run: function () {
    Lab.experiment('GET /authentication?user=:user', function () {
      Lab.before(function (done) {
        this.req = {
          method: 'GET',
          url: '/authentication?user=user'
        };
        return done();
      });

      Lab.test('returns 200 and content type \'text/html\'', function (done) {
        this.server.inject(this.req, function (response) {
          Lab.expect(response.statusCode).to.equal(200);
          Lab.expect(response.headers['content-type']).to.exist;
          Lab.expect(response.headers['content-type']).to.have.string('text/html');

          return done();
        });
      });

      Lab.experiment('returns an html page', function () {
        Lab.beforeEach(function (done) {
          var req = {
            method: 'GET',
            url: '/authentication?user=user'
          };

          this.server.inject(req, function (response) {
            this.response = response;
            this.$ = cheerio.load(response.result);
            return done();
          });
        });

        Lab.test('with a form based on plugin options', function (done) {
          var i = 0;
          var $ = this.$;
          var inputs = this.options.auth.inputs;
          for (var key in inputs) {
            var value = inputs[key];
            var input = $('#' + key + '-' + (++i));

            Lab.expect(input).to.exist;
            Lab.expect(input.attr('type')).to.equal(value.type || 'text');
            Lab.expect(input.attr('placeholder')).to.equal(value.placeholder || '');
            Lab.expect(input.attr('name')).to.equal(value.name || key);
          }

          var subtitle = $('#content h3.lead');
          Lab.expect(subtitle.html()).to.equal(this.options.auth.subtitle || '');
          return done();
        });

        /*Lab.test('with the title of the plugin options', function (done) {
          var $ = this.$;
          var title = $('header.main h4');
          Lab.expect(title.html()).to.equal(this.options.auth.title || '');
          return done();
        });*/


        Lab.afterEach(function (done) {
          delete this.response;
          delete this.$;
          return done();
        });
      });
    });

    Lab.experiment('POST /authentication?user:user', function () {
      Lab.test('returns 302 redirect when the credentials are valid', function (done) {
        var req = {
          method: 'POST',
          url: '/authentication?user=user',
          payload: {
            username: 'username',
            password: 'password'
          }
        };

        this.server.inject(req, function (response) {
          Lab.expect(response).to.exist;
          Lab.expect(response.statusCode).to.equal(302);
          return done();
        });
      });

      Lab.experiment('return an html page with form errors', function () {
        Lab.test('when username isn\'t present', function (done) {
          var req = {
            method: 'POST',
            url: '/authentication?user=user',
            payload: {
              username: '',
              password: 'awesome'
            }
          };

          this.server.inject(req, function (response) {
            var $ = cheerio.load(response.result);
            var errors = $('.has-error');
            Lab.expect(errors).to.exist;
            Lab.expect(errors.length).to.equal(1);
            return done();
          });
        });

        Lab.test('when password isn\'t present', function (done) {
          var req = {
            method: 'POST',
            url: '/authentication?user=user',
            payload: {
              username: 'username',
              password: ''
            }
          };

          this.server.inject(req, function (response) {
            var $ = cheerio.load(response.result);
            var errors = $('.has-error');
            Lab.expect(errors).to.exist;
            var message = errors.children('p').text();
            Lab.expect(message).to.exist;
            Lab.expect(message).to.equal('password');
            return done();
          });
        });

        Lab.test('when the username and password aren\'t valid', function (done) {
          var req = {
            method: 'POST',
            url: '/authentication?user=user',
            payload: {
              username: 'username',
              password: 'fake'
            }
          };

          this.server.inject(req, function (response) {
            Lab.expect(response).to.exist;

            return done();
          });
        });
      });
    });

    Lab.after(function (done) {
      delete this.req;
      return done();
    });
  }
};
