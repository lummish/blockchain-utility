//blockchain-info.js

var request = require('request');

exports.getBlockChainInfo = function(callback) {
    var options = {
        url: 'https://api.blockcypher.com/v1/btc/main'
    }

    return request(options, function(err, res, body) {
        if (err) {
            console.log(err);
            return;
        }

        console.log("Get Response: " + res.statusCode);

        var body_json = JSON.parse(body);

        var blockchain_info = {
            hash: body_json['hash'], //hash of last confirmed block
            time: body_json['time'], //time of last confirmed block
            unconfirmed_count: body_json['unconfirmed_count'], //unconfirmed transaction count
            height: body_json['height'] //height of blockchain
        };

        return callback(blockchain_info);
    });
}

