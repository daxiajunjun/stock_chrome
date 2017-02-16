### Browser Action 和 Page Action
age Action是有状态的，分为显示和隐藏两种。为显示状态时，它在地址栏右边的Button变亮，并且可以点击。为隐藏状态时，它在地址栏右边的Button变灰，并且不可以点击。

### 插件开发需要基础文件
#### manifest.json
```js
{ 
    "manifest_version": 2, //固定的
    "name": "Cissy's First Extension", //插件名称
    "version": "1.0", //插件使用的版本
    "description": "The first extension that CC made.", //插件的描述
    "browser_action": { //插件加载后生成图标
        "default_icon": "cc.gif",//图标的图片
        "default_title": "Hello CC", //鼠标移到图标显示的文字 
        "default_popup": "popup.html" //单击图标执行的文件
    }, 
    "permissions": [ //允许插件访问的url
        "http://*/", 
        "bookmarks", 
        "tabs", 
        "history" 
    ], 
    "background":{//background script即插件运行的环境
        "page":"background.html"
        // "scripts": ["js/jquery-1.9.1.min.js","js/background.js"]//数组.chrome会在扩展启动时自动创建一个包含所有指定脚本的页面
    }, 
     "content_scripts": [{  //对页面内容进行操作的脚本
         "matches": ["http://*/*","https://*/*"],  //满足什么条件执行该插件 
         "js": ["js/jquery-1.9.1.min.js", "js/js.js"],   
         "run_at": "document_start",  //在document加载时执行该脚本
    }] 
}
```
> Browser Action对在浏览器中加载的所有网页都生效；Page Action 针对特定的网页生效。一个Extension最多可以有一个Browser Action或者Page Action

### 通信方式
#### 简单通信
如果您只需要向您的扩展程序的另一部分发送一个简单消息（以及可选地获得回应），您应该使用比较简单的 runtime.sendMessage 或 tabs.sendMessage 方法。这些方法分别允许您从内容脚本向扩展程序或者反过来发送可通过 JSON 序列化的消息，可选的 callback 参数允许您在需要的时候从另一边处理回应。
##### 扩展脚本向内容脚本传递信息
```js
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "您好"}, function(response) {
    console.log(response.farewell);
  });
});
```

##### 内容脚本向扩展脚本传递信息
```js
chrome.runtime.sendMessage({greeting: "您好"}, function(response) {
  console.log(response.farewell);
});
```

##### 接收端设置
```js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "来自内容脚本：" + sender.tab.url :
                "来自扩展程序");
    if (request.greeting == "您好")
      sendResponse({farewell: "再见"});
  });
```


#### 常会话通信