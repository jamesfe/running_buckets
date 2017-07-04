# Notes 04 July 2017

## Problem 1

I am now finding a new problem which is unique to this business logic: what if I stood still during a race?  Well, it turns out that when you run 50 miles, this happens.  There are rest stops along the way.

My solution to this is simply to make the distance moved 10cm.  This is probably not a good thing to do: in reality what I should do is combine this point with the following point, then calculate the segmentation as usual. 

I'll code up the first, then fix with the second way when I have more time and a working graph.

## Problem 2

It is possible that we will modify the first segment in our race (with `splitSegment`) and replace the first moment in the race which is later used to calculate bucket start and end times.  We save this off beforehand.  Maybe this is an optimization too.

## Problem 3

I am noticing a lot of stupid errors where I take `x - undefined` where undefined comes from `blah[i].doesNotExist` or something.  I need to turn linting on and maybe somehow check for things like this.


## Problem 4

Scaling into negative values
Somehow some of the distances are negative?

```
speeds.map(function(a) { if (height - y(a.value) < 0) { return {h: height - y(a.value), v: y(a.value)};} });
```

## Problem 5

segment counter runs out of bounds for large values of numBuckets.

This has been traced to an inverted divisor in `splitSegments` - I should probably write some unit tests.  That absolutely would have caught this.


# Next Steps To Do List

- Beautify this ugly graph
- Integrate the slider in the rendering
- Fix the time offset
- Add jslinting to webpack
- Add some unit tests (big)
- Spike on:
    - Heart rate data
    - Elevation Data
    - Dynamic bucketing of data
