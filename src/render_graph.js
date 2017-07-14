var main = require('./main');
var d3 = require('d3');

var edges = main.loadDataAndRenderFirst();


function changed() {
  var value = this.value;
  main.renderGraph(window.edges, 'running_chart', value);
}

d3.select("#slider")
  .on("change", changed);
