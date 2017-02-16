/* global chrome */

function showStockToPage() {
    chrome.storage.sync.get('stock_list', function (list) {
        if (list['stock_list']) {
            var stockList = list['stock_list'];
            displayStockList(stockList);
        }
    });
}

function displayStockList(stockList) {
    var stockStr = '';
    var fontColor = '';
    for (var key in stockList) {
        fontColor = (stockList[key].currentPrice > stockList[key].todayPrice ? 's-txt-red' : 's-txt-green');
        stockStr += `<tr> <td>${stockList[key].name}</td>
                                <td><span class="${fontColor}">${stockList[key].currentPrice}</span>/
                                <span>${stockList[key].todayPrice}</span></td></tr>`;
    }
    appendToBody(stockStr);
}

function appendToBody(tableContent) {
    var fragment = `<div class="g-stock">
                    <div class="f-close">关闭</div>
                    <h4>${new Date().toLocaleString()}</h4>
                    <table class="m-stock-table">
                        <thead>
                        <tr>
                            <th>名称</th>
                            <th>现价格/开盘价</th>
                        </tr>
                        </thead>
                        <tbody class="m-stock-content">
                            ${tableContent}
                        </tbody>
                    </table>
                </div>`;
    $('.g-stock').remove();  // 先删除页面数据
    $('body').append(fragment);

    $('.f-close').click(function () {
        closeStock();
        $('.g-stock').slideUp();
    });
}

function closeStock() {
    clearInterval(timer);
}

var timer = null;
function freshStockPrice() {
    var today = new Date();
    var hour = today.getHours();
    var freshFlag = false;
    if (hour === 9) {
        var minutes = today.getMinutes();
        minutes > 30 && (freshFlag = true);
    } else if (hour > 9 && hour < 15) {
        freshFlag = true;
    }
    if (freshFlag) {
        timer = setInterval(function () {
            if ($('.g-stock').length > 0) {
                getSavedStockList(function (list) {
                    var stockList = list['stock_list'];
                    if (stockList) {
                        var p = getManyStockInfo(stockList);
                        p.then(function () {
                            console.log(123);
                            showStockToPage();
                        });
                    }
                });
            } else {
                clearInterval(timer);
            }
        }, 10000);
    }
}

showStockToPage();
freshStockPrice();

// 页面事件监听
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.error) {
        console.log(request.error);
    }
    if (request.stockChange) {  // 添加 新的股票
        timer && clearInterval(timer);
        console.log('add new stock');
        showStockToPage();
        freshStockPrice();
    }
    // if (request.loadAllStock) {  // 所有股票刷新后重新渲染 表格
    //     console.log('complete fresh all stock request');
    //     showStockToPage();
    // }
});


