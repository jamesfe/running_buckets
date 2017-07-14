var main = require('./main');
var d3 = require('d3');

main.loadAndRender();

function changed() {
  console.log("Blah");
}

d3.select("#slider")
  .on("change", changed);
