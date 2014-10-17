/*jshint -W030 */

var Lab = require('lab');
var Api = require('lib/api');

exports = module.exports = {
  run: function () {
    Lab.experiment('instance creation',function () {
      Lab.test('throws error if isn\'t present', function (done) {
        var fn = function () { new Api(); };

        Lab.expect(fn).to.throw(Error);
        Lab.expect(fn).to.throw(/id must be a string/);
        done();
      });

      Lab.test('throws error if id isn\'t string', function (done) {
        var fn = function () { new Api({ id: this.id }); };
        Lab.expect(fn).to.throw(Error);
        Lab.expect(fn).to.throw(/id must be a string/);
        done();
      });

      Lab.test('throws error if key isn\'t present', function (done) {
        var fn = function () { new Api(this.id); };
        Lab.expect(fn).to.throw(Error);
        Lab.expect(fn).to.throw(/key must be a string/);
        done();
      });

      Lab.test('throws error if key isn\'t a string', function (done) {
        var fn = function () { new Api(this.id); };
        Lab.expect(fn).to.throw(Error);
        Lab.expect(fn).to.throw(/key must be a string/);
        done();
      });

      Lab.test('returns an instance if id and key are valid', function (done) {
        var api = new Api(this.id, this.key);
        Lab.expect(api).to.exist;
        done();
      });
    });
  }
};
