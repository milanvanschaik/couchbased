// Require chai.js expect module for assertions
var expect = require('chai').expect,
    couchbased = require('../couchbased'),
    mock = require('./mock/couch');

describe('Basics', function() {

  it('should handle set/get of basic types', function() {
    
    var modelName = mock.uniqueId('model');

    var myModel = couchbased.createModel(modelName, {
      'string': String,
      'booleant': Boolean,
      'booleanf': Boolean,
      'number': Number,
      'array': Array,
      'object': Object,
      'date': Date
    }, mock.bucket);

    myModel.createViews();

    setTimeout(function() {

      var test = new myModel();
      test.string = 'John';
      test.booleant = true;
      test.booleanf = false;
      test.number = 99.12345;
      test.array = [0, 1, 2];
      test.object = { 'ob': 'ject', 'se': 'cond' };
      test.date = new Date();

      test.save(function(error, result) {

        expect(error).to.be.null;

        myModel.byId(result._id, function(error, result) {

          expect(error).to.be.null;

          expect(result.string).to.be.a('string');
          expect(result.booleant).to.be.a('boolean');
          expect(result.booleanf).to.be.a('boolean');
          expect(result.number).to.be.a('number');
          expect(result.array).to.be.a('Array');
          expect(result.object).to.be.a('Object');
          expect(result.date).to.be.a('Date');

          done();

        });

      });

    }, 2000);

  });

  it('should give a callback even with no changes to save', function(done) {

    var modelName = mock.uniqueId('model');

    var myModel = couchbased.createModel(modelName, { 'name': String }, mock.bucket);
    myModel.createViews();

    var test = new myModel();

    test.name = 'John';

    test.save(function(error) {

      expect(error).to.be.null;

      test.save(function(error) {

        expect(error).to.be.null;

        done();

      });

    })

  });

  it('should be able to handle direct type references', function(done) {

    var modelName = mock.uniqueId('model');

    var myModel = couchbased.createModel(modelName, { 'name': String }, mock.bucket);
    myModel.createViews();

    var test = new myModel();
    test.name = 'John';

    test.save(function(error) {
      
      expect(error).to.be.null;

      myModel.byId(test._id, function(error, result) {

        expect(error).to.be.null;

        expect(result.name).to.be.a('string');
        expect(result.name).to.equal('John');

        done();

      });

    })

  });

  it('should be able to get a doc by a generated view', function(done) {

    var modelName = mock.uniqueId('model');

    var myModel = couchbased.createModel(modelName, { 'name': { type: String, index: true } }, mock.bucket);
    myModel.createViews();

    var test = new myModel();
    test.name = 'John';

    test.save(function(error) {

      expect(error).to.be.null;

      myModel.byName(test.name, { limit: 1 }, function(error, result) {

        expect(error).to.be.null;

        expect(result.name).to.be.a('string');
        expect(result.name).to.equal('John');

        done();

      });

    });

  });

  it('should be able to get multiple docs by a generated view', function(done) {

    var modelName = mock.uniqueId('model');

    var myModel = couchbased.createModel(modelName, { 'name': { type: String, index: true } }, mock.bucket);
    myModel.createViews();

    var test = new myModel();
    test.name = 'John';

    test.save(function(error) {

      expect(error).to.be.null;

      var secondTest = new myModel();
      secondTest.name = 'John';

      secondTest.save(function(error) {

        expect(error).to.be.null;

        myModel.byName([test.name], function(error, result) {

          expect(error).to.be.null;
          
          result.forEach(function(result) {

            expect(result.name).to.be.a('string');
            expect(result.name).to.equal('John');

          });

          expect(result.length).to.be.equal(2);

          done();

        });

      });

    });

  });

});
