var renderGraph = function (time_price_pairs) { 
    d3.selectAll("svg > *").remove();
    
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

    vis.append("svg:g")
        .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
        .call(xAxis);

    vis.append("svg:g")
        .attr("transform", "translate(" + (MARGINS.left) + ",0)")
        .call(yAxis);

    var lineGen = d3.svg.line()
      .x(function(d) {
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

    setTimeout(function() {
        $('.btn.btn-primary.disabled').toggleClass('disabled');
    }, 10000);
}

renderGraph(time_price_pairs);

$('input[type=radio]:not(:checked)').on('change', function() {
    if (!$(this).attr('checked')) {//only execute if unchecked
        $(this).parent().siblings('.active').children('input[checked]').attr('checked', false); //uncheck siblings
        $(this).parent().siblings().removeClass("active"); //deactivate siblings
        $(this).parent().addClass('active');
        $(this).attr('checked', true); 

        var post_params = {
            time_period: $('.btn-group[aria-label=time-period]').children('.btn.btn-primary.active').children('input').val(),
            currency: $('.btn-group[aria-label=currency]').children('.btn.btn-primary.active').children('input').val()
        };
        
        $.ajax( {
          url: '/market-price',
          data: post_params,
          type: 'POST',
          success: function(time_price_pairs) {
              /* do something with items here */
              // You will likely want a template so you don't have to format the string by hand
            renderGraph(time_price_pairs);
          }
       });
    }
});