# Notes for processing the file

1. We load the file, put every element into an array
2. We sort the array by time
3. We then create links or line segments that go from one location to the next and have the following attributes:
	- Start point & time
	- Stop point & time
	- Total distance in meters
	- Total time in seconds
4. Then we are ready to process the file with some function `make_buckets` or something.



