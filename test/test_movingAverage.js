var assert = require('assert');

var ma = require('../src/movingAverage');

describe('movingAverage tests', function() {

  describe('easy tests', function() {
    it('should calculate the right value', function() {
      var inputs = new Array(10).fill({distance: 0});
      var res = ma.movingAverage(inputs, 2);
      assert(res.every(function(v) { return v == 0; }));
    });

    it('should calculate the right value', function() {
      var inputs = new Array(5).fill({distance: 10});
      var res = ma.movingAverage(inputs, 2);
      assert(res.every(function(v) { return v == 10; }));
    });

 });

  describe('medium tests', function() {
    it('should calculate averages', function() {
      var inputs = new Array(10).fill(0).map(function(v, i) {
        return {
          distance: 1 + (i%2)
        };
      });
      var res = ma.movingAverage(inputs, 2);
      assert.equal(res[0], 1);
      assert(res.slice(1, res.length-1).every(function(v) { return v == 1.5; }));
    });
  });

  describe('harder tests', function() {
    it('should calculate averages', function() {
      var inputs = new Array(18).fill(0).map(function(v, i) {
        return {
          distance: i + (i%3)
        };
      });
      var res = ma.movingAverage(inputs, 3);
      assert(res.every(function(v, i) { return v == i; }));
    });
  });

  describe('technicality tests', function() {
    it('it should check segments is less than the array', function() {
      assert.throws(
        () => {
          var res = ma.movingAverage([], 50);
        },
        "number of segments is too big"
      );
    });

    it('should not allow non-timed timelines', function() {
       assert.throws(
        () => {
          var inputs = new Array(5).fill({distance: 10});
          var res = ma.movingAverage(inputs, 2);
        },
        "need to provide equal time sets"
      );
    });

    it('should not allow non-equal sized timelines', function() {
       assert.throws(
        () => {
          var inputs = new Array(5).fill({distance: 10, seconds: 5});
          inputs[3].seconds = 3;
          var res = ma.movingAverage(inputs, 2);
        },
        "need to provide equal time sets"
      );
    });

  });

});
