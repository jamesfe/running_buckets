# Notes

## Thoughts

Last night I really worked through the bottom up segmentation algorithm.  There were some issues with this - it was late and I didn't write my best code.  I looked over a lot of little logical errors and accepted a subpar implementation.

Today I looked at it again and with the help of a million `console.log` statements (should have used the debugger) I found what I had done wrong.  In short, many things:

- Did not consider the acceptance criteria for the function. What makes the segmentation "enough"
- Did not consider what happens when I delete an element
- Should have thought more about edge cases: merging the first &second element and the (n-1) and (n) elements.  

I saw a symptom of really bad programming: "It works until you run X iterations on it".  My problem was that I accepted running the algorithm up to 25% eliminations (about 2k iterations) but not up to 80% eliminations (roughly 7200 iterations) because somewhere in those 5200 iterations, we removed the last element in the array which is where I had a nasty little bug hiding.

Working this out was good and healthy.  I think it has made me a more attentive programmer.  Also, I wrote tests - they found many little bugs before I had to discover them myself.

## Next Steps

- Fine tune the way we define segmentation
- Make a trend line? 
- Implement a different algorithm because bottom up is not the greatest choice
- Refactor bottom-up to something else
- Look into hidden markov models
