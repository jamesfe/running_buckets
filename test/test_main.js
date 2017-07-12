var assert = require('assert');

var main = require('../src/main.js');

describe('Logic Tests', function() {
  describe('addSeconds', function() {
    it('adds negative seconds', function() {
      var b = new Date(2017, 1, 1);
      var c = main.addSeconds(b, -20);
      assert.equal(c.toString(), new Date(2017, 1, 1, 0, 0, -20).toString());
    });

    it('adds positive seconds', function() {
      var b = new Date(2017, 1, 1);
      var c = main.addSeconds(b, 30);
      assert.equal(c.toString(), new Date(2017, 1, 1, 0, 0, 30).toString());
    });

    it('adds seconds more than one minute', function() {
      var b = new Date(2017, 1, 1);
      var c = main.addSeconds(b, 120);
      assert.equal(c.toString(), new Date(2017, 1, 1, 0, 2, 0).toString());
    });

    it('throws an error when not given a date', function() {
       assert.throws(
        () => {
          main.addSeconds(1, 2);
        },
        "not given a date"
      );
    });

    it('returns a date object', function() {
      var b = new Date(2017, 2, 2);
      var c = main.addSeconds(b, 20);
      assert.equal(c instanceof Date, true);
      assert.equal(typeof(c), "object");
    });


  });

  var s = {
    distance: 100,
    seconds: 100
  };

  describe('splitSegment Tests', function() {
    it('should create two items as output', function() {
      var c = main.splitSegment(s, 20);
      assert.equal(c.length, 2);

    });

    it('should have both distance and seconds as members', function() {
      assert.equal(true, false);
    });


    it('should not return a zero segment', function() {
      assert.equal(true, false);
    });

    it('should throw an error when split val is too big', function() {
      assert.equal(true, false);
    });

    it('should calculate the right return value', function() {
      assert.equal(true, false);
    });

  });

});
