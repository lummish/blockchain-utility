var vis = d3.select('#visualisation'),
    WIDTH = 1000,
    HEIGHT = 500,
    MARGINS = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 50
    },
    format = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ"),
    times = time_price_pairs.map(function(d) { return new Date(format.parse(d.time)); }),
    prices = time_price_pairs.map(function(d) { return d.price; }),
    data = d3.zip(times, prices).map(function(d) {return {time: d[0], price:d[1]}}),
    timeScale = d3.time.scale()
                .domain(d3.extent(times))
                .range([MARGINS.left, WIDTH - MARGINS.right]),
    priceScale = d3.scale.linear()
                 .domain(d3.extent(prices).reverse())
                 .range([MARGINS.bottom, HEIGHT - MARGINS.top]),
    xAxis = d3.svg.axis().scale(timeScale),
    yAxis = d3.svg.axis()
              .scale(priceScale)
              .orient("left");

console.log(data);

vis.append("svg:g")
    .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
    .call(xAxis);

vis.append("svg:g")
    .attr("transform", "translate(" + (MARGINS.left) + ",0)")
    .call(yAxis);

var lineGen = d3.svg.line()
  .x(function(d) {
    console.log(timeScale(d.time));
    return timeScale(d.time);
  })
  .y(function(d) {
    return priceScale(d.price);
});

vis.append('svg:path')
  .attr('d', lineGen(data))
  .attr('stroke', 'green')
  .attr('stroke-width', 2)
  .attr('fill', 'none');


console.log(data);
console.log(d3.extent(times));
console.log(d3.extent(prices));