var margin = {top: 20, right: 20, bottom: 30, left: 40},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;


var parseData = d3.time.format("%w").parse;

d3.tsv("tsv.tsv", type, function(error, data) {
       data.forEach(function(d) {
            var localDate = new Date(d.date * 1000);
            d.date = localDate.getDay();
            d.responseTime = parseFloat(d.responseTime);
        });
       data = d3.nest()
        .key(function(d) {
             return d.date;
             })
        .rollup(function(leaves) {
                var a = { };
                a.responseTime = d3.mean(leaves, function(leaf){return leaf.responseTime})
                a.date = leaves[0].date;
                return a;
        })
        .entries(data)
        .map(function(entry){
                return entry.values;
        });
       
        data.sort(function(d1, d2){
                 return d3.ascending(d1.date, d2.date);
                 });

        render(data);
});

function render(dataset){
    
    var maxResponseTime = d3.max(dataset, function(d){ return d.responseTime});
    var maxDate = d3.max(dataset, function(d){ return d.responseTime});
    
    var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);
    
    var y = d3.scale.linear()
        .domain([0, maxResponseTime])
        .range([height, 0]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10, "%");
    
    var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

       x.domain(dataset.map(function(d) { return d.date; }));
       y.domain([0, d3.max(dataset, function(d) { return d.responseTime; })]);
       
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
       .text("Frequency");
       
       svg.selectAll(".bar")
       .data(dataset)
       .enter().append("rect")
       .attr("class", "bar")
       .attr("x", function(d) { return x(d.date); })
       .attr("width", x.rangeBand())
       .attr("y", function(d) { return y(d.responseTime); })
        .attr("height", function(d) { return height - y(d.responseTime); })
       
}

function type(d) {
    d.frequency = +d.frequency;
    return d;
}

