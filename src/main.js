/*
 * Load the GPX file, parse it and have the data ready for display.
 */

var geolib = require('geolib');
var d3 = require('d3');

function connectEdges(inputArray) {
  /* Take a list of vertices and return a list of line objects. */
  var retVals = [];
  for (var i = 0; i < inputArray.length - 1; i++) {
    var d1 = {
      latitude: inputArray[i].lat,
      longitude: inputArray[i].lon
    };
    var d2 = {
      latitude: inputArray[i+1].lat,
      longitude: inputArray[i+1].lon
    };

    var distance = geolib.getDistance(d1, d2);
    var seconds = (inputArray[i + 1].datetime - inputArray[i].datetime ) / 1000;
    if (seconds <= 0) {
      seconds = 0.1;
    }

    var newItem = {
      startPoint: inputArray[i],
      stopPoint: inputArray[i+1],
      distance: distance,
      seconds: seconds
    };
    retVals.push(newItem);
  }
  return retVals;
}

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

  // At this point we have a nice version of the list. We transform it with the connectEdges function.
  var edges = connectEdges(data);

  // Now let's render the data.

	renderGraph(edges, 'running_chart');

});

function renderGraph(arr, element) {
	var svg = d3.select('#' + element),
    margin = {top: 20, right: 50,bottom: 20, left: 30},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

	var x = d3.scaleTime().domain([arr[0].startPoint.datetime, arr[arr.length - 1].stopPoint.datetime]).range([0, width]);
	var y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
	// We may have to modify this in realtime because the number of meters per time period may increase?
	// Obviously I have not thought out the Y axis in this graph.

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

	// Calculate the individual bars for the graph.
  // TODO: This should probably be a call to `makeBuckets` based on the slider thing
	var speeds = arr.map(function(a) {
		return {
			value: (a.distance / a.seconds),
			date: a.startPoint.datetime
		};
	});

  y.domain([0, d3.max(speeds.map(function(a) { return a.value; }))]);

  // How wide should each bar be? TODO: Make this not bad.
	var bandwidth = (width / speeds.length);

	// Post some Data
	g.selectAll(".data")
		.data(speeds)
		.enter()
		.append("rect")
			.attr("class", "databar")
			.attr("x", function(d) { return x(d.date); } )
			.attr("y", function(d) { return y(d.value); } )
			.attr("width", bandwidth)
			.attr("height", function(d) { return height - y(d.value); });


	// X Axis
	g.append("g")
		.attr("transform", "translate(0, " + height + ")")
		.call(d3.axisBottom(x));

	// Y Axis
	g.append("g")
		.attr("transform", "translate(" + width + ", 0)")
		.call(d3.axisRight(y))
		.append("text")
			.attr("transform", "rotate(270)")
			.attr("text-anchor", "end")
			.attr("font-size", "14")
			.attr("y", -6)
			.attr("fill", "#000000")
			.text("Meters/Second");
}

function makeBuckets(itemArray, numBuckets) {
	/* Returns an array of items with length numBuckets */
	return null;
}
