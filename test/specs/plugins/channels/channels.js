/*jshint -W030 */

var Lab = require('lab');

exports = module.exports = {
  run: function () {
    Lab.experiment('GET /channels?user=:user', function () {
      Lab.test('returns 200', function (done) {
        this.req = {
          method: 'GET',
          url: '/channels?user=user'
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
