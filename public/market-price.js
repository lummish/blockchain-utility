$(document).ready(function(){
    $('#loader').toggle();

    var convertRates = function (from_currency, to_currency, rates) {
      var conversion_factor = rates[from_currency] / rates[to_currency];
      for (var currency in rates) {
          rates[currency] = rates[currency] * conversion_factor;
      }
      return rates;
    }

    var renderGraph = function (time_price_pairs, disabled, update_data) {     
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
                      .orient("left"),
            bisectDate = d3.bisector(function(d) { return d.time; }).left;

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

        var path = 
            vis.append('svg:path')
               .attr('d', lineGen(data))
               .attr('stroke', 'green')
               .attr('stroke-width', 2)
               .attr('fill', 'none');

        var totalLength = path.node().getTotalLength();

        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(1500)
            .ease("bounceOut")
            .attr("stroke-dashoffset", 0);

        var focus = vis.append("g")
                       .attr("class", "focus")
                       .style("display", "none");

        focus.append("circle")
             .attr("r", 4.5);

        focus.append("text")
             .attr("x", 9)
             .attr("dy", ".35em");

        vis.append("rect")
           .attr("class", "overlay")
           .attr("width", WIDTH)
           .attr("height", HEIGHT)
           .on("mouseover", function() { focus.style("display", null); })
           .on("mouseout", function() { focus.style("display", "none"); })
           .on("mousemove", mousemove);

        function mousemove() {
          var x0 = timeScale.invert(d3.mouse(this)[0]),
              i = bisectDate(data, x0, 1),
              d0 = data[i - 1],
              d1 = data[i],
              d = x0 - d0.time > d1.time - x0 ? d1 : d0;
          focus.attr("transform", "translate(" + timeScale(d.time) + "," + priceScale(d.price) + ")");
          focus.select("text").text(d.price);
        }

        if (update_data) {
            setTimeout(function(disabled) {
                $('.btn.btn-primary.disabled').toggleClass('disabled');
            }, 10000);
         }
    }

    $('input.time[type=radio]:not(:checked)').on('change', function() {
        if (!$(this).attr('checked')) {//only execute if unchecked
            $('.btn.btn-primary.time').toggleClass('disabled');
            $(this).parent().siblings('.active').children('input[checked]').attr('checked', false); //uncheck siblings
            $(this).parent().siblings().removeClass("active"); //deactivate siblings
            $(this).parent().addClass('active');
            $(this).attr('checked', true); 

            var post_params = {
                time_period: $('.btn-group[aria-label=time-period]').children('.btn.btn-primary.active').children('input').val(),
                currency: $('.btn-group[aria-label=currency]').children('.btn.btn-primary.active').children('input').val()
            };
            $('.animate-bottom').toggle();
            $('#loader').toggle();
            $.ajax( {
              url: '/market-price',
              data: post_params,
              type: 'POST',
              success: function(new_pairs) {
                time_price_pairs = new_pairs;
                  /* do something with items here */
                  // You will likely want a template so you don't have to format the string by hand
                $('.animate-bottom').toggle();
                $('#loader').toggle();
                renderGraph(time_price_pairs, false, true);
              }
           });
        }
    });

    $('input.currency[type=radio]').on('change', function() {
        if (!$(this).attr('checked')) {//only execute if unchecked
            $(this).parent().siblings('.active').children('input[checked]').attr('checked', false); //uncheck siblings
            $(this).parent().siblings().removeClass("active"); //deactivate siblings
            $(this).parent().addClass('active');
            $(this).attr('checked', true);


            var to_currency = $('.btn-group[aria-label=currency').children('.btn.btn-primary.active').children('input').val();
            rates = convertRates(current_currency, to_currency, rates);
            var conversion_factor = 1 / rates[current_currency]; // get conversion factor back
            current_currency = to_currency;

            console.log(time_price_pairs);

            time_price_pairs = time_price_pairs.map(function(p) {
                return {time: p['time'], price: p['price'] * conversion_factor};
            });

            console.log(time_price_pairs);

            renderGraph(time_price_pairs, false, false);
        }
    });

    renderGraph(time_price_pairs, true, true);
    var current_currency = 'USD';

});
