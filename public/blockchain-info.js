$(document).ready(function (){
    /*
    var clock = $('.clock').FlipClock({
        clockFace: 'TwentyFourHourClock'
    });
    */

    var updateInfo = function(blockchain_info, block_info) {
        var hash = blockchain_info['hash'],
            height = blockchain_info['height'],
            unconfirmed = blockchain_info['unconfirmed_count'],
            total = block_info['total'],
            fees = block_info['fees'];


        //if ($('#height').text() !== height) { //highlight on creation of new block
        //    $('.col-xs-12.col-md-8.info').addClass('highlight');
        //}

        $('#hash').text(hash);
        $('#height').text(height);
        $('#unconfirmed').text(unconfirmed);
        $('#total').text(total);
        $('#fees').text(fees);
    }
    /*
    var getBlockChainInfo = function(callback) {
        $.ajax({
            type: 'GET',
            url: 'https://api.blockcypher.com/v1/btc/main'         
        }).done( function(blockchain_info) {
            callback(blockchain_info, updateInfo);
        });
    }

    var getBlockInfo = function(blockchain_info, callback) {
        console.log(blockchain_info);
        var block_hash = blockchain_info['hash'];
        $.ajax({
            type: 'GET',
            url: 'https://api.blockcypher.com/v1/btc/main/blocks/' + block_hash
        }).done( function(info) {
            callback(blockchain_info, info);
        });
    }

    getBlockChainInfo(function (info) { //initialize values
        var hash = info['hash'],
            height = info['height'],
            unconfirmed = info['unconfirmed_count'];

        $('#hash').text(hash);
        $('#height').text(height);
        $('#unconfirmed').text(unconfirmed);
    });
    */
    
    $.ajax({
        type: 'GET',
        url: 'https://api.blockcypher.com/v1/btc/main'         
    }).done(function (blockchain_info) {
        var block_hash = blockchain_info['hash'];
        $.ajax({
            type: 'GET',
            url: 'https://api.blockcypher.com/v1/btc/main/blocks/' + block_hash
        }).done(function (info) {
            updateInfo(blockchain_info, info);
        });
     });

     /*
     getBlockChainInfo(getBlockInfo) = 
        var getBlockChainInfo = function(getBlockInfo) {
            $.ajax({
                type: 'GET',
                url: 'https://api.blockcypher.com/v1/btc/main'         
            }).done( function(info) {
                getBlockInfo(info);
            });
        }

    getBlockInfo(info) = function(callback) {
        console.log(info);
        var block_hash = info['hash'];
        $.ajax({
            type: 'GET',
            url: 'https://api.blockcypher.com/v1/btc/main/blocks/' + block_hash
        }).done( function(info) {
            callback(blockchain_info, info);
        });
    }
    */
    //getBlockChainInfo(getBlockInfo(updateInfo));

    //console.log(getBlockChainInfo(getBlockInfo));
    //setInterval(getBlockChainInfo(updateChainInfo), 1000);
});
