$(document).ready(() => {

    $('li.stats').toggleClass('active');
    $('#loader').toggle();

    var updateInfo = function(blockchain_info, block_info) {
        $('#loader').toggle();
        $('.animate-bottom').toggle();

        var hash = blockchain_info['hash'],
            height = blockchain_info['height'],
            unconfirmed = blockchain_info['unconfirmed_count'],
            total = block_info['total'],
            fees = block_info['fees'];

        $('#hash').text(hash);
        $('#height').text(height);
        $('#unconfirmed').text(unconfirmed);
        $('#total').text(total);
        $('#fees').text(fees);
    }

    var requestInfo = function() {
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
                $('.animate-bottom').toggle();
                $('#loader').toggle();
            });
         });
    }

    requestInfo();

    $('#update').click(() => requestInfo());
});
