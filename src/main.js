/*
 * Load the GPX file, parse it and have the data ready for display.
 */

var geolib = require('geolib');
var d3 = require('d3');
var bottomUp = require('./bottomUp');

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

function loadDataAndSegment() {
  var edges;
  d3.xml('./data/jfk50miler.gpx', function(error, data) {
    if (error) throw error;
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
    edges = connectEdges(data);
    // edges contains a list of starting and ending times plus distance gone and seconds
    renderSegmentedGraph(edges, 'running_segments', 98, edges[0].startPoint.datetime);
  });
  return edges;
}

function renderSegmentedGraph(arr, element, maxError, startTime) {
  d3.select("#" + element).selectAll("g").remove();
	var svg = d3.select('#' + element),
    margin = {top: 20, right: 50,bottom: 20, left: 30},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

  var halfHour = 0.5 * 3600; // half hour offset
  var begin = addSeconds(startTime, -1 * halfHour);

  var segs = bottomUp.bottomUpSegmentation(arr, maxError);
  var numSeconds = segs.reduce(function(accum, value) {
    return accum + value.time;
  }, 0);

  // TODO: Good candidate to be a reduce
  segs.forEach(function(v, i) {
    if (i == 0) {
      segs[i].accumTime = startTime;
    } else {
      segs[i].accumTime = addSeconds(segs[i-1].accumTime, v.time);
    }
  });
  var end = addSeconds(startTime, numSeconds);
	var x = d3.scaleTime().domain([begin, end]).range([0, width]);
	var y = d3.scaleLinear().range([height, 0]);

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

  y.domain([0, 5]);
  var bandwidth = (width / segs.length);

  var xStart = x(startTime);
  g.selectAll(".data")
		.data(segs)
		.enter()
		.append("rect")
			.attr("class", "databar")
			.attr("x", function(d) { return x(d.accumTime); } )
			.attr("y", function(d) { return y(d.distance/d.time); } )
			.attr("width", function(d) { return Math.abs(xStart - x(addSeconds(startTime, d.time))); })
			.attr("height", function(d) { return height - y(d.distance/d.time); });

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
  return arr;
}

function loadDataAndRenderFirst() {
  var edges;
  d3.xml('./data/jfk50miler.gpx', function(error, data) {
    if (error) throw error;
    console.log("setting edges once");
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
    console.log("Setting edges again!");
    edges = connectEdges(data);
    window.edges = renderGraph(edges, 'running_chart', 50);
  });
  return edges;
}

function addSeconds(item, seconds) {
  /* Add seconds to a date object and return a new date. */
  if (item instanceof Date === false) { throw "not given a date"; }
  var newDate = new Date();
  newDate.setTime(item.getTime() + (seconds * 1000));
  return newDate;
}

function renderGraph(arr, element, buckets) {
  d3.select("#" + element).selectAll("g").remove();
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
	var speeds = makeBuckets(arr, buckets);

  var vals = speeds.map(function(a) { return a.value; }).sort(function(a, b) { return a - b; });
  y.domain([0, vals[vals.length - 1]]);

  // Somewhere in here is a little bit of code I added at some point to make the bars overlap a bit.  Where is it?
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
  return arr;
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
  loadDataAndRenderFirst: loadDataAndRenderFirst,
  renderGraph: renderGraph,
  splitSegment: splitSegment,
  loadDataAndSegment: loadDataAndSegment
};
