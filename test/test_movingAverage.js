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
      console.log(res);
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
      console.log(res);
      assert.equal(res[0], 1.5);
      assert(res.slice(1, res.length-1).every(function(v) { return v == 1.5; }));
    });
  });
});
