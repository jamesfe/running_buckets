# Second Work Session: 3 Jul 2017

I wanted to finish the work I did this morning on this part of the graph.  What I'm going to do is write the `makeBuckets` function.  Here we go:

- First calculate the number of seconds per bucket
- Create an array large enough for all the buckets. (`k`)

- Then iterate over our list of segments, either splitting the segment or building the appropriate data structure (see below) to insert into our array of known length (`k`).

Each bucket will contain the weighted average for that number of seconds of the race.

## Javascript Passes By Reference

Which is annoying when you want the modifications to an array you make to go away after a function ends.  But that's life, we will simply clone the array - it seems that this is a weird way to do it but we can try and see how it goes:

[https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript/5344074#5344074]

See the usage of this in `makeBuckets`.
