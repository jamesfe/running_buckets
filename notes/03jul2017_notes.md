# Notes for processing the file

1. We load the file, put every element into an array
2. We sort the array by time
3. We then create links or line segments that go from one location to the next and have the following attributes:
	- Start point & time
	- Stop point & time
	- Total distance in meters
	- Total time in seconds
4. Then we are ready to process the file with some function `make_buckets` or something.

## Addition 1

Processing all this data in JS has been pretty easy and surprisingly fast for client-side processing.  There are something like 7k+ points and processing has not taken a noticeably long time.  

I will also note that there is a high percentage of business logic to boilerplate that's pretty nice about JavaScript.  I am enjoying this.  It's one of the more recent times that I've used JS and it hasn't been too painful at all.

## Addition 2
I take back what I said about this being fast processing.  Maybe I should preprocess the file?  But also, maybe I am being inefficient.  I profiled this and the program spends time here:

- Parsing XML (197.9ms, 23%)
- Rendering Graph (	122.1ms, 9.67%)
- Garbage collection (109.4ms, 8.66%)

There is obviously some work to do. Total time was 3,188ms or about 3 sec to render which is unacceptable.
