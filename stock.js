
var queryStockInfoUrl = 'http://hq.sinajs.cn/';
var marketPrefix = ['sh', 'sz', 'hk'];

/* global chrome */

$(function () {
    showStock();
    // 显示列表股票
    function showStock() {
        getSavedStockList(function (list) {
            if (list['stock_list']) {
                var stockList = list['stock_list'];
                displayStockList(stockList);
            }
        });
    }

    function displayStockList(stockList) {
        var stockStrList = '';
        for (var key in stockList) {
            stockStrList += `<tr><td>${stockList[key].number}(${stockList[key].market})</td>
                                    <td>${stockList[key].name}</td>
                                    <td>${stockList[key].todayPrice}</td>
                                    <td><a href="#" class="f_del_stock" data-key="${key}">删除</a></td></tr>`;
        }
        $('.m-stock-content').html(stockStrList);
        stockStrList !== '' ? $('.m-stock-container').css('display', 'block') : $('.m-stock-container').css('display', 'none');

        $('.f_del_stock').click(function (event) {
            var target = $(event.target);
            var key = target.data('key');
            delete stockList[key];
            chrome.storage.sync.set({'stock_list': stockList});
            showStock();
        });
    }

    $('.u-btn-save').click(function () {
        var stockNumber = $('#u-stock-number').val();
        stockNumber && getOnlineStockInfo(0, stockNumber, true, showStock);
    });




    // function sendAllStockLoadMessage() {
    //     chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    //         chrome.tabs.sendMessage(tabs[0].id, {loadAllStock: `load All Stock`}, function () {});
    //     });
    // }
    // // var i = 0;
    // chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //     if (request.fresh) {
    //         // console.log('fresh' + i++);
            
    //     }
    // });
});



