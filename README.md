# websocketManager
简化webscoket使用，不需要去关注何时断线何时重连，只需要传是否需要激活这一个参数

使用方式：
 
 ...
 
 APPGlobalSet.setWs(new WebSocketManager(WsUrl));//初始化websocket manager
 
 ...
 
 handleAppStateChange(appState) {
        if (appState == 'active') {
          AppGlobal.ws.createWs(true);
        } else {
          AppGlobal.ws.createWs(false);
        }
 }


设计流程图：
WebsocketManager：https://www.processon.com/view/link/5b2153e2e4b02e4b270751f7
wsStatus：https://www.processon.com/view/link/5b2124a0e4b0a838a0925928
