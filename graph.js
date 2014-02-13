var margin = {top: 30, right: 20, bottom: 40, left: 60}
var width = 960 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var DAYSTOSECONDS = 60*60*24;

console.log(d3);
var parseFullDate = d3.time.format("%m/%d/%Y %H:%M:%S %p").parse;
//var parseMonthDate = d3.time.format("%m/%Y").parse;

var filter = "";

function group(data, grouper){
    return d3.nest()
        .key(grouper)
        .rollup(function(leaves) {
            var a = {}; 
            a.responseTime = d3.mean(leaves, function(leaf){return leaf.responseTime})
            a.date = leaves[0].date;
            return a;
        })
        .entries(data)
        .map(function(entry){
            return entry.values;
        });
}

d3.tsv("tsv.tsv", function(error, data) {
        
        data = data.filter(function(response){
            return response.Content.toLowerCase().indexOf(filter) != -1;
        });
        data.sort(function(d1, d2){
            return d3.ascending(d1.date, d2.date);
        });
        data.forEach(function(d) {
            var localDate = new Date(d.date * 1000);
            d.date = parseFullDate(localDate.toLocaleString());
            d.responseTime = parseFloat(d.responseTime);
        });

        var urgent_data = data.filter(function(response){
            var ret = response.urgent == "True"
            return ret;
        });

        data = group(data, function(d) {
            var grouper = d.date.getMonth()+"/"+d.date.getYear();
            return grouper;
        });

        data = data.filter(function(response){
            return response.responseTime < DAYSTOSECONDS * 10;
        })

        urgent_data = group(urgent_data, function(d) {
            var grouper = d.date.getMonth()+"/"+d.date.getYear();
            return grouper;
        });

        urgent_data = urgent_data.filter(function(response){
            return response.responseTime < DAYSTOSECONDS * 10;
        })
        render(data, urgent_data);
    });

function render(dataset, urgent_data){

    var maxResponseTime = d3.max(dataset, function(d){ return d.responseTime});
    var maxDate = d3.max(dataset, function(d){ return d.responseTime});

    var x = d3.time.scale()
        .domain(d3.extent(dataset, function(d) {return d.date;}))
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([1, maxResponseTime])
        .range([height, 1]);

    var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

    var formatHours = function(miliseconds) {
        return (miliseconds / 60 / 60).toFixed(2);     
    }

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
        .tickFormat(formatHours);

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
    .text("Response Time (hours)");

    svg
    .datum(dataset)
    .append("path")
    .attr("class", "line")
    .attr("d", line);

    svg
    .datum(urgent_data)
    .append("path")
    .attr("class", "urgent-line")
    .attr("d", line);


}

            