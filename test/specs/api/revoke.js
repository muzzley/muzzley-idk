/*jshint -W030 */

var Lab = require('lab');
var sinon = require('sinon');
var request = require('request');

exports = module.exports = {
  run: function () {
    Lab.experiment('revoke method',function () {
      Lab.experiment('returns error',function () {
        Lab.beforeEach(function (done) {
          this.stub = sinon.stub(request, 'put');
          done();
        });

        Lab.test('when the inner request returns error', function (done) {
          this.stub.yields(new Error('error'));
          this.api.revoke('user', function (err) {
            Lab.expect(err).to.exist;
            Lab.expect(err).to.be.instanceOf(Error);
            Lab.expect(err.message).to.equal('error');
            done();
          });
        });

        Lab.test('when the muzzley api status code is less than 200', function (done) {
          this.stub.yields(null, { statusCode: 100 }, { message: 'message' });
          this.api.revoke('user', function (err) {
            Lab.expect(err).to.exist;
            Lab.expect(err).to.be.instanceOf(Error);
            Lab.expect(err.message).to.equal('message');
            Lab.expect(err.code).to.equal(100);
            done();
          });
        });

        Lab.test('when the muzzley api status code is greater than 299', function (done) {
          this.stub.yields(null, { statusCode: 301 }, { message: 'message' });
          this.api.revoke('user', function (err) {
            Lab.expect(err).to.exist;
            Lab.expect(err).to.be.instanceOf(Error);
            Lab.expect(err.message).to.equal('message');
            Lab.expect(err.code).to.equal(301);
            return done();
          });
        });

        Lab.afterEach(function (done) {
          this.stub && this.stub.restore();
          delete this.stub;
          return done();
        });
      });

      Lab.experiment('calls muzzley server', function () {
        Lab.test('with the authorization flag wit a put', function (done) {

          var mock = sinon.mock(request);

          mock
            .expects('put')
            .once()
            .yields(null, { statusCode: 200 });

          this.api.revoke('user', function (err) {
            Lab.expect(err).to.not.exist;
          });

          mock.verify();
          mock.restore();
          return done();
        });
      });
    });
  }
};
