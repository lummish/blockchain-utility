var http = require('http'),
    express = require('express'),
    logger = require('morgan'),
    path = require('path'),
    market = require('./scripts/market-price.js'),
    app = express(),
    request = require('request'),
    bodyParser = require('body-parser');

app.use(logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // to support JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies

//view engine setup
app.set('views', path.join(__dirname, '/public/views'));
app.set('view engine', 'jade');

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/market-price', function(req, res) {
    market.historicPrice('BTC', 'USD', 'day', function (time_price_pairs) {
        res.render('market-price', {timePrices: time_price_pairs}, function(err, html) {
            if (err) {
                console.log(err);
            }
            res.send(html);
        });
    });       
});

app.post('/market-price', function(req, res) {
    var market_params = req.body;
    market.historicPrice('BTC', market_params['currency'], market_params['time_period'], function(time_price_pairs) {
        res.send(time_price_pairs);
    });
});


app.listen(process.env.PORT || 3000, function() {
    console.log('listening on ' + (process.env.PORT || 3000));
});