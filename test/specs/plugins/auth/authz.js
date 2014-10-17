/*jshint -W030 */

var Lab = require('lab');
var cheerio = require('cheerio');

exports = module.exports = {
  run: function () {
    Lab.experiment('GET /authorization?user=:user', function () {
      Lab.test('returns 200 and content type \'text/html\'', function (done) {
        var req = {
          method: 'GET',
          url: '/authorization?user=user'
        };

        this.server.inject(req, function (response) {
          Lab.expect(response.statusCode).to.equal(200);
          Lab.expect(response.headers['content-type']).to.exist;
          Lab.expect(response.headers['content-type']).to.have.string('text/html');
          return done();
        });
      });

      Lab.experiment('return an html page', function () {
        Lab.beforeEach(function (done) {
          var req = {
            method: 'GET',
            url: '/authorization?user=user'
          };

          this.server.inject(req, function (response) {
            this.response = response;
            this.$ = cheerio.load(response.result);
            return done();
          });
        });

        Lab.test('with a form with allow and cancel button', function (done) {
          var $ = this.$;
          var buttons = $('button[type="submit"]');
          Lab.expect(buttons.length).to.equal(2);

          var cancel = buttons.eq(0);
          var permit = buttons.eq(1);

          Lab.expect(cancel.attr('name')).to.equal('choice');
          Lab.expect(cancel.attr('value')).to.equal('cancel');
          Lab.expect(permit.attr('name')).to.equal('choice');
          Lab.expect(permit.attr('value')).to.equal('permit');

          return done();
        });

        Lab.test('with the list of available permissions of the plugin options', function (done) {
          var $ = this.$;
          var li = $('ul.available li');
          var available = this.options.authz.permissions.available || { };
          Lab.expect(li.get().length).to.equal(available.length);
          li.each(function(i, el) {
            Lab.expect($(el).text()).to.equal(available[i]);
          });
          return done();
        });

        Lab.test('with the list of unavailable permissions of the plugin options', function (done) {
          var $ = this.$;
          var li = $('ul.unavailable li');
          var unavailable = this.options.authz.permissions.unavailable || { };
          Lab.expect(li.get().length).to.equal(unavailable.length);
          li.each(function(i, el) {
            Lab.expect($(el).text()).to.equal(unavailable[i]);
          });
          return done();
        });

        /*Lab.test('with the title of the plugin options', function (done) {
          var $ = this.$;
          var title = $('header.main h4');
          Lab.expect(title.html()).to.equal(this.options.authz.title || '');
          return done();
        });*/

        Lab.afterEach(function (done) {
          delete this.response;
          delete this.$;
          return done();
        });
      });
    });

    Lab.experiment('POST /authorization?user=:user', function () {
      Lab.test('return 302 redirect when the choice is permit', function (done) {
        var req = {
          method: 'POST',
          url: '/authorization?user=user',
          payload: {
            choice: 'permit'
          }
        };

        this.server.inject(req, function (response) {
          Lab.expect(response).to.exist;
          Lab.expect(response.statusCode).to.equal(302);
          return done();
        });
      });

      Lab.test('return 302 redirect to authorization when the choice is cancel', function (done) {
        var req = {
          method: 'POST',
          url: '/authorization?user=user',
          payload: {
            choice: 'cancel'
          }
        };

        this.server.inject(req, function (response) {
          Lab.expect(response).to.exist;
          Lab.expect(response.statusCode).to.equal(302);
          return done();
        });
      });
    });
  }
};
