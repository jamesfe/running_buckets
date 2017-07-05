# Notes for 5 July 2017

## Time Zone

I fixed something on the to-do list for today - that is the time offset.  I did this by subtracting a cool 5 hours from the data.  

I should go back and do this differently because it'll bite me in a few months when `CET->EST` is a difference of -6 hours.  Maybe there is a JS function to do this.

## Beautify the Viz

I need to sit down and think about why this looks the way it does, but one thing that bugged me was not having a buffer space on either side of the graph, so I did a little work on this by adding 30 minutes on either side.  I like this a lot more.

## JS Lint

I added JS Linting, it was pretty easy.  I'm not sure if it's entirely worthwhile, it really just nags me about semicolons, but I'll dig into the settings and see if it's good.

# Next Steps

I'll add one new thing: I want to see units in minutes/mile instead of meters/second.  This is a pace rather than a speed but I'd still like to put another axis on the graph.

- More beutification
    - Include minutes/mile on an axis.
- Keep working on the slider bar
- Unit Tests
- Spike:
    - HR Data
    - Elevation Data
    - Dynamic Bucketing

