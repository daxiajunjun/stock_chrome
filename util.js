var queryStockInfoUrl = 'http://hq.sinajs.cn/';
var marketPrefix = ['sh', 'sz', 'hk'];
/* global chrome */
function getSavedStockList(callback) {
    // chrome.storage.sync.clear(); // 清空缓存
    chrome.storage.sync.get('stock_list', function (list) {
        callback(list);
    });
}
// 获取股票数据
function getOnlineStockInfo(marketIndex, stockNumber, addFlag, callback) {
    if (marketIndex > marketPrefix.length) {
        // TODO 提示错误
        notFindStockTips(stockNumber);
        return;
    }
    var market = marketPrefix[marketIndex];
    var url = `${queryStockInfoUrl}/list=${market}${stockNumber}`;
    return new Promise(function (resolve, reject) {
        $.ajax({  // 使用了chrome 提供的跨域访问的能力
            url: url,
            type: 'get',
            dataType: 'text',
            success: function (data) {
                if (data.length > 100) {
                    var stock = parseStockString(stockNumber, data, marketIndex);
                    saveStockInfoToChromeStorage(stock, callback);
                    addFlag && addStockMessage();
                    resolve();
                } else {
                    getOnlineStockInfo(++marketIndex, stockNumber, true, callback);
                }
            },
            error: function (xhr, textStatus, error) {
                console.log(textStatus);
            }
        });
    });
}

function getManyStockInfo(stockList) {
    var simpleStockList = [];
    var stockNumberStr = '';
    for (var key in stockList) {
        var index = stockList[key].marketIndex;
        simpleStockList.push({ number: key, marketIndex: index });
        stockNumberStr += `${marketPrefix[index]}${key},`;
    }
    stockNumberStr = stockNumberStr.substring(0, stockNumberStr.length - 1);
    var url = `${queryStockInfoUrl}/list=${stockNumberStr}`;
    return new Promise(function (resolve, reject) {
        $.ajax({  // 使用了chrome 提供的跨域访问的能力
            url: url,
            type: 'get',
            dataType: 'text',
            success: function (data) {
                if (data.length > 100) {
                    var promises = [];
                    var responseStockList = data.split(';');
                    for (var i = 0; i < responseStockList.length - 1; i++) {
                        var simpleStock = simpleStockList[i];
                        var stock = parseStockString(simpleStock.number, responseStockList[i], simpleStock.marketIndex);
                        var p = saveStockInfoToChromeStorage(stock);
                        promises.push(p);
                    }
                    Promise.all(promises).then(function () {
                        resolve();
                    });
                };
            },
            error: function (xhr, textStatus, error) {
                console.log(textStatus);
            }
        });
    });
}


// 将股票信息存入到chrome中
function saveStockInfoToChromeStorage(stock, callback) {
    return new Promise(function (resolve, reject) {
        getSavedStockList(function (savedStock) {
            if (!savedStock['stock_list']) {
                savedStock[stock.number] = stock;
                chrome.storage.sync.set({'stock_list': savedStock});
            } else {
                savedStock['stock_list'][stock.number] = stock;
                chrome.storage.sync.set(savedStock);
            }
            callback && callback();
            resolve();
        });
    });
}

// 分析一个股票数据数据
function parseStockString(stockNumber, stockStr, marketIndex) {
    var stock = null;
    var stockInfo = stockStr.substr(stockStr.indexOf('"') + 1).split(',');
    if (stockInfo.length > 0) {
        stock = {};
        stock.number = stockNumber;
        var index = (marketIndex === 2 ? 1 : 0);
        stock.marketIndex = marketIndex;
        stock.name = stockInfo[index++];
        stock.market = marketPrefix[marketIndex].toUpperCase();
        stock.todayPrice = stockInfo[index++];
        stock.tomorrow = stockInfo[index++];
        stock.currentPrice = stockInfo[index++];
    }
    return stock;
}

function notFindStockTips(number) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {error: `not find stock ${number}`}, function () {});
    });
}

function addStockMessage() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        console.log('add');
        chrome.tabs.sendMessage(tabs[0].id, {stockChange: `add new stock`}, function () {});
    });
    // chrome.runtime.sendMessage({stockChange: `add new stock`});
}
