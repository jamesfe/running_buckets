(function () {
   'use strict';
}());

/*
 * Load the GPX file, parse it and have the data ready for display.
 */

var geolib = require('geolib');
var d3 = require('d3');

function connectEdges(inputArray) {
  /* Take a list of vertices and return a list of line objects. */
  'use strict';
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
    if (distance <= 0) {
      distance = 0.1;
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

function loadAndRender() {
  d3.xml('./data/jfk50miler.gpx', function(error, data) {
    'use strict';
    if (error) throw error;
    // For each item that matches our XML query, parse w/ this function.
    data = [].map.call(data.querySelectorAll('trkpt'), function(point) {
      return {
        lat: parseFloat(point.getAttribute('lat')),
        lon: parseFloat(point.getAttribute('lon')),
        elevation: parseFloat(point.querySelector('ele').textContent),
        datetime: addSeconds(new Date(point.querySelector('time').textContent), -1 * 5 * 3600),
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
}

function addSeconds(item, seconds) {
  /* Add seconds to a date object and return a new date. */
  'use strict';
  if (item instanceof Date === false) { throw "not given a date"; }
  var newDate = new Date();
  newDate.setTime(item.getTime() + (seconds * 1000));
  return newDate;
}

function renderGraph(arr, element) {
  'use strict';
	var svg = d3.select('#' + element),
    margin = {top: 20, right: 50,bottom: 20, left: 30},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

  var halfHour = 0.5 * 3600; // half hour offset
  var begin = addSeconds(arr[0].startPoint.datetime, -1 * halfHour);
  var end = addSeconds(arr[arr.length - 1].stopPoint.datetime, halfHour);
	var x = d3.scaleTime().domain([begin, end]).range([0, width]);
	var y = d3.scaleLinear().range([height, 0]);

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

	// Calculate the individual bars for the graph.
	var speeds = makeBuckets(arr, width / 30);

  var vals = speeds.map(function(a) { return a.value; }).sort(function(a, b) { return a - b; });
  y.domain([0, vals[vals.length - 1]]);

	var bandwidth = (width / speeds.length);

	// Post some Data
  g.selectAll(".data")
		.data(speeds)
		.enter()
    .append("rect")
			.attr("class", "fadeddatabar")
			.attr("x", function(d) { return x(d.date); } )
			.attr("y", function(d) { return y(d.value); } )
			.attr("width", bandwidth)
			.attr("height", function(d) { return height - y(d.value); });

  g.selectAll(".data")
		.data(speeds)
		.enter()
		.append("rect")
			.attr("class", "databar")
			.attr("x", function(d) { return x(d.date); } )
			.attr("y", function(d) { return y(d.value); } )
			.attr("width", bandwidth)
			.attr("height", function(d) { return 1; });


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
			.attr("fill", "#222222")
			.text("Meters/Second");
}

function splitSegment(seg, seconds) {
  /* Split the segment by removing the first n seconds. Return two new lightweight objects. */
  if (seg.seconds <= seconds) {
    throw 'bad split value';
  }

  var ratio = (seconds / seg.seconds);
  return [
    {
      distance: seg.distance * ratio,
      seconds: seconds
    },
    {
      distance: seg.distance * (1 - ratio),
      seconds: seg.seconds - seconds
    },
  ];
}

function makeBuckets(items, numBuckets) {
	/* Returns an array of items with length numBuckets */
  numBuckets = Math.floor(numBuckets);
  // Do not modify the original array.  Copy it.

  var segs = [];
  for (var k = 0; k < items.length; k++) {
    segs.push({
      distance: items[k].distance,
      seconds: items[k].seconds,
      startPoint: {
        datetime: items[k].startPoint.datetime
      },
      stopPoint: {
        datetime: items[k].stopPoint.datetime
      }
    });
  }

  var retVals = new Array(numBuckets);
  var secondsPerBucket = Math.floor((segs[segs.length - 1].stopPoint.datetime - segs[0].startPoint.datetime) / (numBuckets * 1000));
  var currSeg = 0;

  // We use this as the first moment in the race.
  var startDate = new Date(segs[0].startPoint.datetime);

  for (var i = 0; i < numBuckets; i++) {
    var secondsToGet = secondsPerBucket;
    var componentSegs = []; // The segments we are about to aggregate
    while (secondsToGet > 0) {
      // If we can easily add it, just do so.
      if (segs[currSeg].seconds <= secondsToGet) {
        componentSegs.push(segs[currSeg]);
        secondsToGet -= segs[currSeg].seconds; // decrement things
        currSeg += 1;
      } else {
      // We split this segment up appropriately and then add part of it to this and modify the sitting segment
        var brokenSeg = splitSegment(segs[currSeg], secondsToGet);
        secondsToGet -= brokenSeg[0].seconds; // decrement counter again
        componentSegs.push(brokenSeg[0]);
        segs[currSeg] = brokenSeg[1];
      }
    }

    // Now, we deal with combining the segments.
    if (componentSegs.length === 1) {
      retVals[i] = componentSegs[0];
    } else {
      var distance = componentSegs.reduce(function(s, v) {
        return (s + v.distance);
      }, 0);
      var seconds = componentSegs.reduce(function(s, v) {
        return (s + v.seconds);
      }, 0);
      // Set the value to the sum of everything.
      retVals[i] = {
        distance: distance,
        seconds: seconds
      };
    }
  }

  // Given an array of nearly final data, make it into graphable speeds.
  var speeds = retVals.map(function(a, i) {
    var dt = new Date();
    dt.setTime(startDate.getTime() + (i * secondsPerBucket * 1000));
		return {
			value: (a.distance / a.seconds),
			date: dt
		};
	});
	return speeds;
}

module.exports = {
  addSeconds: addSeconds,
  loadAndRender: loadAndRender,
  splitSegment: splitSegment
}

