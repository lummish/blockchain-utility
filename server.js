var http = require('http'),
    express = require('express'),
    logger = require('morgan'),
    path = require('path'),
    market = require('./scripts/market-price.js'),
    app = express(),
    request = require('request');

app.use(logger('dev'));
app.use(express.static(__dirname + '/static'));

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/market-price', function(req, res) {  
    market.historicPrice('BTC', 'USD', 'day');
});

app.listen(process.env.PORT || 3000, function() {
    console.log('listening on ' + (process.env.PORT || 3000));
});