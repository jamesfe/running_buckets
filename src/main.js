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

function calcSegment(point1, point2) {
  /*
   * point looks like {distance, time}
   * */
  var segment = {
    distance: Math.abs(point2.distance - point1.distance),
    time: Math.abs(point2.seconds - point1.seconds)
  };
  return segment;
}

function combineSegments(seg1, seg2) {
   var segment = {
    distance: seg2.distance + seg1.distance,
    time: seg2.time + seg1.time
  };
  return segment;
}

function calcError(seg1, seg2) {
  /* calculate the error associated with merging these two segments. */
  var actual = (seg1.distance * seg1.time) + (seg2.distance * seg2.time);
  var averageSpeed = (seg1.distance + seg2.distance) / (seg1.time + seg2.time);
  var error1 = Math.abs((averageSpeed * seg1.time) - seg1.distance);
  var error2 = Math.abs((averageSpeed * seg2.time) - seg2.distance);
  var totalError = Math.abs(error1 + error2);
  // console.log(seg1, seg2);
  // console.log(actual, error1, error2, averageSpeed, totalError);
  return totalError;
}

function bottomUpSegmentation(inputPoints) {
  /*
   * Point looks like this: {distance, time}
   * Segment looks like this: {distance, time}
   * */
  var segments = new Array(inputPoints.length - 1).fill({distance: 0, seconds: 0});
  segments.forEach(function(v, i) {
    segments[i] = calcSegment(inputPoints[i], inputPoints[i+1]);
  });
  var errors = new Array(segments.length - 1).fill(0);
  errors.forEach(function(v, i) {
    errors[i] = calcError(segments[i], segments[i+1]);
  });
  var currentError = 0;
  var totalError = errors.reduce(function(s, v) { return s + v; }, 0);
  // Now we remove all the smallest errors up to a certain size
  var maxError = 7;
  var currentErrorTotal = 0;
  var count = 0;
  while ((segments.length > 1) && (currentErrorTotal < maxError)) {
    // find the minimum error
    function minReducer(a, b, i, arr) {
      if (b < a.minError) {
        return {
          minError: b,
          index: i
        };
      } else {
        return a;
      }
    }
    var mins = errors.reduce(minReducer, {minError: 100000, index: 0});
    // Now we decide to remove the item at mins.index
    if (mins.index < segments.length - 2) {  // This should never happen but we check
      currentErrorTotal  += mins.minError;
      segments[mins.index] = combineSegments(segments[mins.index], segments[mins.index + 1]);
      segments.splice(mins.index + 1, 1); // delete single item
      errors.splice(mins.index + 1, 1); // delete the extra error
      errors[mins.index] = calcError(segments[mins.index], segments[mins.index + 1]); // recalculate error
    }
    count++;
    if (count > 400) {
      break;
    }
    // do the merge
    // return a set of segments that contain {distance, seconds}
  }
  return segments;
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
  calcSegment: calcSegment,
  calcError: calcError,
  bottomUpSegmentation: bottomUpSegmentation
};

