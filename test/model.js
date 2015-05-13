/* global describe, it, before, after */
var expect = require('expect.js');
var Model = require('../lib/helpers/Model');
var Storage = require('../lib/helpers/Storage');
var storage = new Storage();

describe('Helpers # Model', function () {
  var Person, key;

  // Check the properties
  var personModelDataIntegrety = function (personModel, cb) {
    // instanceof
    expect(personModel).to.be.a(Person);

    // typeof
    expect(personModel.id).to.be.a('number');
    expect(personModel.name).to.be.a('string');
    expect(personModel.flag).to.be.a('boolean');
    expect(personModel.freeObj).to.be.an('object');
    expect(personModel.obj).to.be.an('object');
    expect(personModel.obj.id).to.be.a('number');
    expect(personModel.obj.name).to.be.a('string');
    expect(personModel.obj.flag).to.be.a('boolean');
    expect(personModel.obj.freeObj).to.be.an('object');

    // equality
    expect(personModel.id).to.be(1337);
    expect(personModel.name).to.be('Testing!!');
    expect(personModel.flag).to.be(true);
    expect(personModel.freeObj.say).to.be('hello');
    expect(personModel.obj.id).to.be(1111);
    expect(personModel.obj.name).to.be('Testing while testing!');
    expect(personModel.obj.flag).to.be(false);
    expect(personModel.obj.freeObj.say).to.be('bye');

    if (cb) {
      return cb();
    }
  };

  // Clean up
  before(function (done) {
    storage.client().del('model-testing:person:1337', done);
  });

  describe('Model.setStorage', function () {
    Model.setStorage(storage);

    it('Should have the storage inside the Person model', function () {
      expect(Person.storage).to.be(storage);
    });
  });

  describe('Model.setPrefix', function () {
    Model.setPrefix('model-testing');

    it('The models should have the prefix "model-personing"', function () {
      // This key will be used along the
      // rest of the persons
      key = Person.key({id: 1337});

      expect(key).to.match(/model-testing:/);
    });
  });

  describe('Model.extend', function () {
    // Create a model with almost all properties
    // less the 'any' value
    // later it will be tested
    Person = Model.extend({
      name: 'person',
      props: {
        id: 'number',
        name: 'string',
        flag: 'boolean',
        freeObj: 'object',
        obj: {
          id: 'number',
          name: 'string',
          flag: 'boolean',
          freeObj: 'object'
        }
      },
      keys: ['id']
    });

    it('Should create a model named "personName"', function () {
      expect(key).to.match(/person/);
    });

    it('Should create a new instance of Person Model', function () {
      var person = new Person({
        id: 1337,
        name: 'Testing!!',
        flag: true,
        freeObj: {
          say: 'hello'
        },
        obj: {
          id: 1111,
          name: 'Testing while testing!',
          flag: false,
          freeObj: {
            say: 'bye'
          }
        }
      });

      // Invoke integrety tests on person
      personModelDataIntegrety(person);

      describe('person.save', function () {
        it('Should save on redis the newly created instance', function (done) {
          person.save(done);
        });
      });

      describe('Person.get', function () {
        it('Should get a person with a key object', function (done) {
          Person.get({id: 1337}, function (err, personGet) {
            if (err) {
              return done(err);
            }

            // Invoke the same test again
            // but with the instance returned
            // from the callback
            personModelDataIntegrety(personGet, done);
          });

          describe('Change property name', function () {
            it('Should save the person object edited', function (done) {
              person.name = 'Sup!';

              person.save(function (err) {
                if (err) {
                  return done(err);
                }

                Person.get({id: 1337}, function (err, person) {
                  if (err) {
                    return done(err);
                  }

                  expect(person.name).to.be('Sup!');

                  return done();
                });
              });
            });
          });

          describe('Change str to int the property name', function () {
            it('Should save and convert 8888 to str', function (done) {
              person.name = 8888;
              person.save(function (err) {
                if (err) {
                  return done(err);
                }

                Person.get({id: 1337}, function (err, person) {
                  if (err) {
                    return done(err);
                  }

                  expect(person.name).to.be('8888');

                  return done();
                });
              });
            });
          });

          describe('Try to change boolean to str the property flag', function () {
            it('Should return an error on the callback of .save', function (done) {
              person.flag = 'testinnng';

              person.save(function (err) {
                expect(err).to.be.an(Error);

                return done();
              });
            });
          });
        });

        it('Should get a person with a key string');
      });

      describe('Person.del', function () {
        it('Should delete the person created', function (done) {
          Person.del({id: 1337}, function (err) {
            if (err) {
              return done(err);
            }

            Person.get({id: 1337}, function (err, person) {
              if (err) {
                return done(err);
              }

              expect(person).to.be.an('undefined');

              return done();
            });
          });
        });
      });
    });
  });
});
