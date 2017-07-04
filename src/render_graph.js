var main = require('main.js');

main.loadAndRender();

// TODO: WIP 
d3.select("input")
    .on("input", changed)
    .on("change", changed);
