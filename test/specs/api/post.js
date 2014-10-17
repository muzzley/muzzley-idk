/*jshint -W030 */

var Lab = require('lab');
var sinon = require('sinon');
var request = require('request');

exports = module.exports = {
  run: function () {
    Lab.experiment('post method', function () {
      Lab.experiment('returns error', function () {
        Lab.beforeEach(function (done) {
          this.stub = sinon.stub(request, 'post');
          done();
        });

        Lab.test('when the inner request returns error', function (done) {
          this.stub.yields(new Error('error'));
          this.api.post('name', {}, function (err) {
            Lab.expect(err).to.exist;
            Lab.expect(err).to.be.instanceOf(Error);
            Lab.expect(err.message).to.equal('error');
            done();
          });
        });

        Lab.test('when the muzzley api status code is less than 200', function (done) {
          this.stub.yields(null, { statusCode: 100 }, { message: 'message' });
          this.api.post('name', {}, function (err) {
            Lab.expect(err).to.exist;
            Lab.expect(err).to.be.instanceOf(Error);
            Lab.expect(err.message).to.equal('message');
            Lab.expect(err.code).to.equal(100);
            done();
          });
        });

        Lab.test('when the muzzley api status code is greater than 299', function (done) {
          this.stub.yields(null, { statusCode: 301 }, { message: 'message' });
          this.api.post('name', {}, function (err) {
            Lab.expect(err).to.exist;
            Lab.expect(err).to.be.instanceOf(Error);
            Lab.expect(err.message).to.equal('message');
            Lab.expect(err.code).to.equal(301);
            done();
          });
        });

        Lab.afterEach(function (done) {
          this.stub && this.stub.restore();
          delete this.stub;
          done();
        });
      });

      Lab.experiment('calls muzzley server', function () {
        Lab.test('and sends the payload in a post', function (done) {
          var mock = sinon.mock(request);
          var payload = [
            { content: 'c1' },
            { content: 'c2' }
          ];

          mock
            .expects('post')
            .once()
            .yields(null, { statusCode: 200 });

          this.api.post('name', payload, function (err) {
            Lab.expect(err).to.not.exist;
          });

          mock.verify();
          mock.restore();
          done();
        });
      });
    });
  }
};
