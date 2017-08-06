function calcSegment(point1, point2) {
  /* point looks like {distance: total_distance, seconds: total_time_since_start} * */
  var segment = {
    distance: Math.abs(point2.distance - point1.distance),
    time: Math.abs(point2.seconds - point1.seconds)
  };
  return segment;
}

function combineSegments(seg1, seg2) {
  /* segment looks like {distance: distance_delta_since_last, time: seconds_delta_since_last} */
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
  return totalError;
}

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

function bottomUpSegmentation(inputSegments, percentToRemove) {
  /*
   * Point looks like this: {distance, time}
   * Segment looks like this: {distance, time}
   * maxError is an int
   * */
  var segments = inputSegments.map(function(v) {
    return {
      distance: v.distance,
      time: v.seconds
    };
  });
  var origLength = segments.length;
  var percentPerSegment = 100 / segments.length;
  var errors = new Array(segments.length - 1).fill(0);
  errors.forEach(function(v, i) {
    errors[i] = calcError(segments[i], segments[i+1]);
  });
  var currentError = 0;
  var totalError = errors.reduce(function(s, v) { return s + v; }, 0);
  var currentErrorTotal = 0;
  var count = 0;
  var percentRemoved = 0;
  var numIters = 0;
  while (percentRemoved < percentToRemove) {
    var mins = errors.reduce(minReducer, {minError: 10000, index: 0});
    // Now we decide to remove the item at mins.index
    if (mins.index < segments.length - 1) {  // This should never happen but we check
      currentErrorTotal += mins.minError;
      segments[mins.index] = combineSegments(segments[mins.index], segments[mins.index + 1]);
      segments.splice(mins.index + 1, 1); // delete single item
      errors.splice(mins.index, 1); // delete the extra error
      // At this point, if we have modified the first or last item in the array we have a little probem
      if (mins.index > 0) {
        errors[mins.index - 1] = calcError(segments[mins.index - 1], segments[mins.index]);
      }
      if (mins.index < segments.length - 1) { // If we have not deleted the last item in the array
        errors[mins.index] = calcError(segments[mins.index], segments[mins.index + 1]);
      }
      percentRemoved += percentPerSegment;
    }

    numIters++;
    if (numIters > origLength * 2) {
      break;
    }
  }
  return segments;
}


module.exports = {
  calcSegment: calcSegment,
  calcError: calcError,
  bottomUpSegmentation: bottomUpSegmentation
};
