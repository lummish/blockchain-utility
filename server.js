var http = require('http'),
    express = require('express'),
    logger = require('morgan'),
    path = require('path'),
    market = require('./scripts/market-price.js'),
    app = express(),
    request = require('request');

app.use(logger('dev'));
app.use(express.static(__dirname + '/public'));

//view engine setup
app.set('views', path.join(__dirname, '/public/views'));
app.set('view engine', 'jade');

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/market-price', function(req, res) {      
    res.render('market-price', {timePrices: market.historicPrice('BTC', 'USD', 'day')}, function(err, html) {
        if (err) {
            console.log(err);
        }
        res.send(html);
    });
});

app.listen(process.env.PORT || 3000, function() {
    console.log('listening on ' + (process.env.PORT || 3000));
});