/*
 * Load the GPX file, parse it and have the data ready for display.
 */

var geolib = require('geolib');
var d3 = require('d3');


d3.xml('./data/jfk50miler.gpx', function(error, data) {
	if (error) throw error;

	// For each item that matches our XML query, parse w/ this function.
	data = [].map.call(data.querySelectorAll('trkpt'), function(point) {
    return {
      lat: parseFloat(point.getAttribute('lat')),
      lon: parseFloat(point.getAttribute('lon')),
      elevation: parseFloat(point.querySelector('ele').textContent),
      datetime: new Date(point.querySelector('time').textContent),
      hr: parseInt(point.querySelector('extensions').childNodes[1].childNodes[1].textContent)
    };

	});

  data.sort(function(b, a){
    return new Date(b.datetime) - new Date(a.datetime);
  });

  debugger;
});

function makeBuckets(itemArray, numBuckets) {
	/* Returns an array of items with length numBuckets */
	return null;
}
