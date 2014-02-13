var margin = {top: 20, right: 20, bottom: 30, left: 100},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;


var responsebar = {
    "stroke" : "#27AE60",
    "fill" : "#3498DB"
}

var urgentbar = {
    "stroke" : "#F39C12",
    "fill" : "#F1C40F"
}


var parseData = d3.time.format("%w").parse;

$('#target').bind('input', function() { 
    var $this = $(this);
    var delay = 1000; // 2 seconds delay after last input

    clearTimeout($this.data('timer'));
    $this.data('timer', setTimeout(function(){
        $this.removeData('timer');
         console.log($this.val()); // get the current value of the input field.
        filter($this.val());
    }, delay));
   
});

var filters = "";
function filter(words){
    filters = words;
    run();
}

function group(data, grouper, merger){
    return d3.nest()
        .key(grouper)
        .rollup(merger)
        .entries(data)
        .map(function(entry){
            return entry.values;
        });
}

function mergeAveResponseTimeAnUrgent(array) {
    var a = {}; 
    a.responseTime = d3.mean(array, function(element){return element.responseTime})
    var onlyUrgent = array.filter(function(d){return d.urgent});
    a.urgentResponseTime = d3.mean(onlyUrgent, function(element){return element.responseTime})
    a.date = array[0].date;
    a.day = array[0].day;
    return a;
}
function groupByDay(d){
    return d.day;
}
var formatHours = function(miliseconds) {
    return (miliseconds /100 / 60 / 60).toFixed(2);     
}

var global_data;

function run(){
    var filtered_data = global_data.filter(function(response){
            return response.Content.toLowerCase().indexOf(filters) != -1;
        });
    var formated_data = group(filtered_data, groupByDay, mergeAveResponseTimeAnUrgent);
    render(formated_data)
}

var groupScale = d3.scale.linear()
        .domain([0,6])
        .range([0,width]);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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
        .ticks(10, "hrs")
        .tickFormat(formatHours);
    

    var day = svg.selectAll("g")
        .data(dataset);

        var newBars = day.enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) {
            return "translate(" + groupScale(d.day) + ",0)";
        });

        newBars.append("rect")
            .attr("class", "resp")
            .attr("width", 30)
            .attr("height", function(d) { return y(d.responseTime); })
            .attr("x", 0)
            .attr("y", function(d) { return height -  y(d.responseTime); })
            .style("fill", responsebar.fill)
            .style("stroke", responsebar.stroke);

        newBars.append("rect")
            .attr("class", "urgent")
            .attr("width", 30)
            .attr("height", function(d) {return y(d.urgentResponseTime);})
            .attr("x", 30)
            .attr("y", function(d) {return height - y(d.urgentResponseTime);})
            .style("fill", urgentbar.fill)
            .style("stroke", urgentbar.stroke);
        
        svg.selectAll("rect.resp").transition()
            .attr("height", function(d) { return y(d.responseTime); })
            .attr("y", function(d) { return height -  y(d.responseTime); })

        svg.selectAll("rect.urgent").transition()
            .attr("height", function(d) { return y(d.urgentResponseTime); })
            .attr("y", function(d) { return height -  y(d.urgentResponseTime); })

        svg.select("y axis").remove();
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Response Time (hours)");
}

function type(d) {
    d.frequency = +d.frequency;
    return d;
}

//actually do stuff
d3.tsv("tsv.tsv", type, function(error, data) {
    data.forEach(function(d) {
        var localDate = new Date(d.date * 1000);
        d.day = localDate.getDay();
        d.urgent = d.urgent == "True";
        d.responseTime = parseFloat(d.responseTime);
    });
    global_data = data;
    run();
});

