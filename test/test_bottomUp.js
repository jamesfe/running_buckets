var assert = require('assert');

var main = require('../src/bottomUp.js');

describe('bottomUp tests', function() {

  describe('calcSegment tests', function() {
    it('should calculate the right value', function() {
      var p1 = { distance: 100, seconds: 10 };
      var p2 = { distance: 150, seconds: 15 };
      var seg = main.calcSegment(p1, p2);
      assert.equal(seg.distance, 50);
      assert.equal(seg.time, 5);
    });

    it('should calc the absolute value', function() {
      var p1 = { distance: 100, seconds: 10 };
      var p2 = { distance: 150, seconds: 15 };
      var seg = main.calcSegment(p2, p1);
      assert.equal(seg.distance, 50);
      assert.equal(seg.time, 5);
    });
  });

  describe('calcError tests', function() {
    it('should calculate the right error', function() {
      var s1 = { distance: 100, time: 10 };
      var s2 = { distance: 200, time: 10 };
      var err = main.calcError(s1, s2);
      assert.equal(err, 100);
    });

    it('should calculate a zero error when values are the same', function() {
      var s1 = { distance: 100, time: 10 };
      var err = main.calcError(s1, s1);
      assert.equal(err, 0);
    });
  });

  describe('bottomUp tests', function() {
    it('should run', function() {
      var testPoints = [
        {distance: 10, seconds: 10},
        {distance: 20, seconds: 12},
        {distance: 210, seconds: 100},
        {distance: 410, seconds: 102}
      ];
      var res = main.bottomUpSegmentation(testPoints, 0);
      assert(res.length >= 2);
    });

    it('should delete some segments', function() {
      var testPoints = [];
      for (var i = 1; i < 100; i+=10) {
        testPoints.push({distance: 100/i, seconds: i})
      }
      for (var j = 100; j > 0; j-=10) {
        testPoints.push({distance: 100/j, seconds: j})
      }
      var res = main.bottomUpSegmentation(testPoints);

    });

    it('should deal with a descending error', function() {
      var testPoints = [];
      for (var i = 1; i < 100; i+=10) {
        testPoints.push({distance: 100/i, seconds: i})
      }
      var res = main.bottomUpSegmentation(testPoints, 10);
      assert.equal(res.length, 9);
    });
  });
});
