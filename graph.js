var margin = {top: 30, right: 20, bottom: 40, left: 60}
var width = 960 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var DAYSTOSECONDS = 60*60*24;

var parseFullDate = d3.time.format("%m/%d/%Y %H:%M:%S %p").parse;
//var parseMonthDate = d3.time.format("%m/%Y").parse;

d3.tsv("tsv.tsv", function(error, data) {
        data.sort(function(d1, d2){
            return d3.ascending(d1.date, d2.date);
        });
        data.forEach(function(d) {
            d.miliseconds = d.date * 1000;
            var localDate = new Date(d.date * 1000);
            d.date = parseFullDate(localDate.toLocaleString());
            d.responseTime = parseFloat(d.responseTime);
        });
        var nest = d3.nest()
            .key(function(d) {
                var grouper = d.date.getMonth()+"/"+d.date.getYear();
                return grouper;
            })
            .rollup(function(leaves) {
                var a = {}; 
                a.responseTime = d3.mean(leaves, function(leaf){return leaf.responseTime})
                a.date = leaves[0].date;
                return a;
            })
            .entries(data);
        var yo = nest.map(function(entry){
            return entry.values;
        });
        /*data.sort(function(d1, d2){
            return d3.ascending(d1.date, d2.date);
        });*/
        render(yo);
    });

function render(dataset){

    var maxResponseTime = d3.max(dataset, function(d){ return d.responseTime});
    var maxDate = d3.max(dataset, function(d){ return d.responseTime});

    var x = d3.time.scale()
        .domain(d3.extent(dataset, function(d) {return d.date;}))
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, maxResponseTime])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

    var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");

    var line = d3.svg.line()
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d.responseTime); });


    var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Response Time (ms)");

    svg.append("path")
    .datum(dataset)
    .attr("class", "line")
    .attr("d", line);
}

            