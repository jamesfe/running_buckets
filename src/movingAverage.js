function movingAverage(inArray, numSegments) {
  /* Given a set of speeds and distances, calculate the moving average for a window of totalSeconds.
  * Things we need:
  * 0. Precondition: All segments take the same amount of time
  * 1. average distance traveled in the last n segments for n <= 30
  *
  * Things we return:
  * An array equal to length of inArray and in each item of that array, the moving
  * average for the last 30 segments is included.
  * */
  // TODO: Assert all time segments in inArray are equal
  
  if (numSegments > inArray.length) {
    throw("number of segments is too");
  }

  var results = new Array(inArray.length).fill(0); // TODO: check fill so it can be looped?
  var avgVals = [];
  for (var i = 0; i < results.length; i++) {
    if (avgVals.length < numSegments) {
      avgVals.push(inArray[i].distance);
    } else {
      avgVals.push(inArray[i].distance);
      avgVals.splice(0, 1); // delete the first thingy
    }
    var avgVal = avgVals.reduce(function(a, i) { return a + i; }, 0) / avgVals.length;
    results[i] = avgVal;
  }
  return results;
}

module.exports = {
  movingAverage: movingAverage
}
