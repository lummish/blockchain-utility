var request = require('request');

var parameters = {
    timespan: '1weeks',
    rollingAverage: '8hours'
}

var options = {
    url: 'api.blockchain.info',
    qs: parameters
}

function callback(err, response, body) {
    if (err) {
        console.log(err);
        return;
    }

    console.log("Get response: " + response.statusCode);
};

request(options, callback)