
$(document).ready(() => {
    
    $('#info-container').toggle();
    var getInfoForAddress = function(address) {
        var url = "https://testnet.blockexplorer.com/api/addr/";
        $.ajax({
            type: 'GET',
            url: url + address + '/balance'
        }).done(function(balance) {
            $.ajax({
                type: 'GET',
                url: url + address + '/totalReceived'
            }).done(function(totalReceived) {
                $.ajax({
                    type: 'GET',
                    url: url + address + '/totalSent'
                }).done(function(totalSent) {
                    $.ajax({
                        type: 'GET',
                        url: url + address + '/unconfirmedBalance'
                    }).done(function(unconfirmedBalance) {
                        $("#address").text(address);
                        $("#received").text(totalReceived);
                        $("#balance").text(balance);
                        $("#unconfirmed").text(unconfirmedBalance);
                        $("#sent").text(totalSent);
                        $('#info-container').toggle();
                        $('#loader').toggle();
                    });
                });
            });
        });
    }

    getInfoForAddress($("#address").text());
});