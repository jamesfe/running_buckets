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
  if (numSegments > inArray.length) {
    throw new Error("number of segments is too big");
  }

  var results = [];
  var avgVals = [];
  // TODO: Optimize this so we aren't storing 30 extra items. Keep a running total.
  var timeCheck = inArray[0].seconds;
  for (var i = 0; i < inArray.length; i++) {
    if (inArray[i].seconds != timeCheck) {
      // throw(new Error("must be equal times or no times at all"));
    }
    if (avgVals.length < numSegments) {
      avgVals.push(inArray[i].distance);
    } else {
      avgVals.push(inArray[i].distance);
      avgVals.splice(0, 1); // delete the first thingy
    }
    var avgVal = avgVals.reduce(function(a, i) { return a + i; }, 0) / avgVals.length;
    results.push(avgVal);
  }
  return results;
}

module.exports = {
  movingAverage: movingAverage
};
