var module2 = require('./module2');
var glib = require('geolib');

glib.getDistance(
      {latitude: 51.5103, longitude: 7.49347},
      {latitude: "51° 31' N", longitude: "7° 28' E"}
);

module2();
console.log(glib);
console.log("This is a thing");

var blah = 3;
