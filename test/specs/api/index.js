/*jshint -W030 */

var Lab = require('lab');
var Api = require('lib/api');
var async = require('async');

Lab.experiment('[api] muzzley', function () {
  Lab.before(function (done) {
    this.id = 'dh37fgj492je';
    this.key = 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn';
    this.api = new Api(this.id, this.key, { secure: false });
    done();
  });

  var arr = [
    require('./new'),
    require('./post'),
    require('./revoke')
  ];

  async.eachSeries(arr, function (test, done) {
    test.run();
    done();
  });

  Lab.after(function (done) {
    delete this.api;
    delete this.key;
    delete this.id;
    done();
  });
});
