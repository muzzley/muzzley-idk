/*jshint -W030 */

var Lab = require('lab');

exports = module.exports = {
  run: function () {
    Lab.experiment('POST /subscriptions?user=:user', function () {
      Lab.test('returns 200 when payload is empty', function (done) {
        this.req = {
          method: 'POST',
          url: '/subscriptions?user=user',
        };

        this.server.inject(this.req, function (response) {
          Lab.expect(response.statusCode).to.equal(400);
          return done();
        });
      });

      Lab.test('returns 400 on invalid status', function (done) {
        this.req = {
          method: 'POST',
          url: '/subscriptions?user=user',
          payload: {
            channels: [{
              id: '1',
              status: 'true'
            }]
          }
        };

        this.server.inject(this.req, function (response) {
          Lab.expect(response.statusCode).to.equal(200);
          return done();
        });
      });

      Lab.test('returns 200 when channels list is empty', function (done) {
        this.req = {
          method: 'POST',
          url: '/subscriptions?user=user',
          payload: {
            channels: [{

            }]
          }
        };

        this.server.inject(this.req, function (response) {
          Lab.expect(response.statusCode).to.equal(200);
          return done();
        });
      });

      Lab.after(function (done) {
        delete this.req;
        return done();
      });
    });
  }
};
