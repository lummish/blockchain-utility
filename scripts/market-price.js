var request = require('request'),
    d3 = require('d3');

var parameters = {
    timespan: '1weeks',
    rollingAverage: '8hours'
}

var options = {
    url: 'api.blockchain.info/charts/market-price/',
    qs: parameters
}

/* this function relies on a method to transform the data from multiple decimals to a more human readable format. I'm using util.reduceFloatVal 
 * in here but feel free to use whatever you want. This applies to api responses for historical data from cryptocompare.
 * The interval parameter refers to seconds used in the current request time period. For requests on the minute api with no aggregation
 * use 60 seconds, for an aggregation of 5 minutes on your request use 5*60 seconds. On the hourly api use 60*60 for no aggregation,
 * for an aggregation of 12 hours for example use 12*60*60. For the daily api use 24*60*60 for no aggregation
 *
 * credit to github user vcealicu https://gist.github.com/vcealicu/7030bb7a0363221ee127
 */

var static_util = {
    reduceFloatVal : function(value){
        value = parseFloat(value);
        if(value>1){
            value = Math.round(value * 100) / 100;
            return value;
        }
        return parseFloat(value.toPrecision(3));
    }
};

polyfillChartData = function(chartData,interval){
    console.log(typeof chartData);
    var util = static_util;
    var arrayToReturn = [];
    var prevClose;
    var allData = chartData['Data'];
    var timestampToStop;
    var currentTimestamp = chartData.TimeFrom;
    if(!chartData.hasOwnProperty('Data')){
        return arrayToReturn;
    }
    if(allData.length>0){
        timestampToStop = allData[0]['time'];
    }else{
        timestampToStop = chartData.TimeTo;
    }
            
    //pad beginning
    if(!chartData.FirstValueInArray){
        if(chartData.hasOwnProperty("FirstValue")){
            prevClose = util.reduceFloatVal(chartData.FirstValue['close']);
        }else{
            if(allData.length>0){
                prevClose = util.reduceFloatVal(allData[0]['close']);
            }else{
                prevClose = 0;
            }
        }
        var initalValue ={};
        initalValue['time'] = chartData.TimeFrom*1000;
        initalValue['close'] = prevClose;
        initalValue['high'] = prevClose;
        initalValue['low'] = prevClose;
        initalValue['open'] = prevClose;
        initalValue['volumefrom'] = 0;
        initalValue['volumeto'] = 0;
        arrayToReturn.push(initalValue);
        prevClose = initalValue['close'];
        currentTimestamp = currentTimestamp+interval;
        while(currentTimestamp<timestampToStop){
            var newValue = {};
            newValue['time'] = currentTimestamp*1000;
            newValue['close'] = prevClose;
            newValue['high'] = prevClose;
            newValue['low'] = prevClose;
            newValue['open'] = prevClose;
            newValue['volumefrom'] = 0;
            newValue['volumeto'] = 0;
            arrayToReturn.push(newValue);
            currentTimestamp = currentTimestamp+interval;
        }
    }

    //add first value
    var newValue = {};
    currentTimestamp = allData[0]['time'];
    newValue['time'] = currentTimestamp*1000;
    newValue['close'] = util.reduceFloatVal(allData[0]['close']);
    newValue['high'] = util.reduceFloatVal(allData[0]['high']);
    newValue['low'] = util.reduceFloatVal(allData[0]['low']);
    newValue['open'] = util.reduceFloatVal(allData[0]['open']);
    newValue['open'] = util.reduceFloatVal(allData[0]['open']);
    newValue['volumefrom'] = util.reduceFloatVal(allData[0]['volumefrom']);
    newValue['volumeto'] = util.reduceFloatVal(allData[0]['volumeto']);
    arrayToReturn.push(newValue);
    prevClose = newValue['close'];
    currentTimestamp = currentTimestamp+interval;
            
    //pad middle
    for(var i=1;i<allData.length;i++){
        timestampToStop = allData[i]['time'];
        while(currentTimestamp<timestampToStop){
            var newValue = {};
            newValue['time'] = currentTimestamp*1000;
            newValue['close'] = prevClose;
            newValue['high'] = prevClose;
            newValue['low'] = prevClose;
            newValue['open'] = prevClose;
            newValue['volumefrom'] = 0;
            newValue['volumeto'] = 0;
            arrayToReturn.push(newValue);
            currentTimestamp = currentTimestamp+interval;
        }
        var newValue = {};
        newValue['time'] = currentTimestamp*1000;
        newValue['close'] = util.reduceFloatVal(allData[i]['close']);
        newValue['high'] = util.reduceFloatVal(allData[i]['high']);
        newValue['low'] = util.reduceFloatVal(allData[i]['low']);
        newValue['open'] = util.reduceFloatVal(allData[i]['open']);
        newValue['volumefrom'] = util.reduceFloatVal(allData[i]['volumefrom']);
        newValue['volumeto'] = util.reduceFloatVal(allData[i]['volumeto']);
        arrayToReturn.push(newValue);
        prevClose = newValue['close'];
        currentTimestamp = currentTimestamp+interval;
    };
            
    //pad the end
    timestampToStop = chartData.TimeTo;
    while(currentTimestamp<=timestampToStop){
        var newValue = {};
        newValue['time'] = currentTimestamp*1000;
        newValue['close'] = prevClose;
        newValue['high'] = prevClose;
        newValue['low'] = prevClose;
        newValue['open'] = prevClose;
        newValue['volumefrom'] = 0;
        newValue['volumeto'] = 0;
        arrayToReturn.push(newValue);
        currentTimestamp = currentTimestamp+interval;
    }

    return arrayToReturn;
}


var parseToPairs = function(interval, callback) {
    return function(err, response, body) {
        if (err) {
            console.log(err);
            return;
        }

        console.log("Get response: " + response.statusCode);

        var body_json = JSON.parse(body);
        
        var filled_data = polyfillChartData(body_json, interval);

        var pairs = filled_data.map(function (time_datum) {
            var pair = {};
            pair['time'] = new Date(time_datum['time']);
            pair['price'] = time_datum['close'];
            return pair;
        });

        return callback(pairs);
    }
}

exports.historicPrice = function(coin, currency, period, callback) { //returns historic price data as an array of time price pair objects
    var coin = coin,
        currency = currency;

    if (period == 'day') { //daily
        var interval = 2, //max resolution for day period
            interval_in_seconds = 120,
            lim = 720, //intervals in one day (1440 minutes)
            api_function = 'histominute/';
    } else if (period == 'week') { //weekly
        var interval = 12, 
            interval_in_seconds = 60 * 12,
            lim = 840, //intevals in one week (10080 minutes)
            api_function = 'histominute';
    } else if (period == 'month') {
        var interval = 1, 
            interval_in_seconds = 60 * 60,
            lim = 720,
            api_function = 'histohour';
    } else {
        var interval = 10,
            interval_in_seconds = 60 * 60 * 10,
            lim = 876,
            api_function = 'histohour';
    }

    var parameters = {
            e: 'CCCAGG', //aggregated exchange data
            fsym: coin,
            tsym: currency,
            aggregate: interval,
            limit: lim
        };

    var options = {
        url: 'https://www.cryptocompare.com/api/data/' + api_function,
        qs: parameters
    }

    return request(options, parseToPairs(interval_in_seconds, callback)); //interval is 2 minutes in seconds
};

exports.exchangeRates = function(currency_from, current_rates, callback) {
    if (Object.keys(current_rates).length === 0) {
        var parameters = {
            base: currency_from
        };

        var options = {
            url: 'http://api.fixer.io/latest',
            qs: parameters
        };

        return request(options, function(err, res, body) {
            if (err) {
                console.log(err);
                return;
            }

            console.log("Get response: " + res.statusCode);
            var body = JSON.parse(body);
            return callback(body);
        });    
    } else {
        return callback(current_rates);
    }
}

