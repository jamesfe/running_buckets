var assert = require('assert');

var main = require('../src/main.js');

describe('bottomUp tests', function() {

  describe('calcSegment tests', function() {
    var p1 = { distance: 100, seconds: 10 };
    var p2 = { distance: 150, seconds: 15 };
    var seg = main.calcSegment(p1, p2);
    assert.equal(seg.distance, 50);
    assert.equal(seg.time, 5);
  });

  describe('calcSegment tests backward', function() {
    var p1 = { distance: 100, seconds: 10 };
    var p2 = { distance: 150, seconds: 15 };
    var seg = main.calcSegment(p2, p1);
    assert.equal(seg.distance, 50);
    assert.equal(seg.time, 5);
  });

  describe('calcError tests', function() {
    var s1 = { distance: 100, time: 10 };
    var s2 = { distance: 200, time: 10 };
    var err = main.calcError(s1, s2);
    assert.equal(err, 300);

  });


});
