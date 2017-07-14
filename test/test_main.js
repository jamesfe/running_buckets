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

  describe('splitSegment Tests', function() {
    /* Tests for the splitSegment function. */
    var s = {
      distance: 200,
      seconds: 100
    };

    it('should create two items as output if necessary', function() {
      var c = main.splitSegment(s, 20);
      assert.equal(c.length, 2);
    });

    it('should have both distance and seconds as members', function() {
      var c = main.splitSegment(s, 20);
      assert.notEqual(c[0].distance, undefined);
      assert.notEqual(c[0].seconds, undefined);
      assert.notEqual(c[1].distance, undefined);
      assert.notEqual(c[1].seconds, undefined);
    });

    it('should not return a zero segment', function() {
      assert.throws(
        () => {
          main.splitSegment(s, 100)
        },
        'bad split value'
      );
    });

    it('should throw an error when split val is too big', function() {
      assert.throws(
        () => {
          main.splitSegment(s, 200)
        },
        'bad split value'
      );
    });

    it('should calculate the right return value', function() {
      var c = main.splitSegment(s, 20);
      assert.equal(c[0].seconds, 20);
      assert.equal(c[0].distance, 40);
      assert.equal(c[1].seconds, 80);
      assert.equal(c[1].distance, 160);
    });
  });
});
