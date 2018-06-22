/*
    created by kerrli on 2018/6/5
*/

import {
    DeviceEventEmitter
} from 'react-native'

export default class WebSocketManager {
    constructor(wsIp) {
        this.timeHeart = 6000;//心跳包时间
        this.timeConnect = 2000;//重连倒计时时间
        this.wsIp = wsIp; //webScoket 地址

        this.heartTimeOutObj = undefined;//发送心跳包的倒计时
        this.serverTimeoutObj = undefined;//等待心跳包的倒计时
        this.reconnectTimerOutObj = undefined;//发起重连心跳包倒计时

        //状态变量
        this.isNeedNewWs = undefined;
    }

    createWs(isNeedNewWs) {
        this.isNeedNewWs = isNeedNewWs;
        if (this.ws) {
            this.getWebStateAndDoThings();
        } else {
            this.newWs();
        }
    }

    getWebStateAndDoThings() {
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                this.ws.close();
                break;
            case WebSocket.OPEN:
                this.ws.close();
                break;
            case WebSocket.CLOSING:
                this.clearTimers();
                this.newWs();
                break;
            case WebSocket.CLOSED:
                this.clearTimers();
                this.newWs();
                break;
            default:
                break;
        }
    }

    newWs() {
        if (this.isNeedNewWs) {
            this.reconnectTimerOutObj = setTimeout(() => {
                this.ws = new WebSocket(this.wsIp);
                this.ws.onopen = this.onRcvOpen.bind(this);
                this.ws.onmessage = this.onRcvMessage.bind(this);
                this.ws.onerror = this.onRcvError.bind(this);
                this.ws.onclose = this.onRcvClose.bind(this);
            }, this.timeConnect)
        } else {
            this.ws = undefined;
        }
    }

    clearTimers() {
        if (this.heartTimeOutObj) {
            clearTimeout(this.heartTimeOutObj);
        }
        if (this.serverTimeoutObj) {
            clearTimeout(this.serverTimeoutObj);
        }
        if (this.reconnectTimerOutObj) {
            clearTimeout(this.reconnectTimerOutObj);
        }
    }

    resetHeart() {
        if (this.serverTimeoutObj) {
            clearTimeout(this.serverTimeoutObj);
        }
        if (this.heartTimeOutObj) {
            clearTimeout(this.heartTimeOutObj);
        }
        this.startHeart();
    }

    startHeart() {
        this.heartTimeOutObj = setTimeout(() => {
            this.onSendMsg('HeartBeat');
            this.serverTimeoutObj = setTimeout(() => {
               this.getWebStateAndDoThings();
            }, this.timeHeart)
        }, this.timeHeart)
    }

    onSendMsg(token) {
        if (this.ws) {
            if (this.ws.readyState == WebSocket.OPEN) {
                this.ws.send(token);
            }
        }
    }

    //以下是ws对象回调
    onRcvOpen() {
        console.log('open');
        this.startHeart();
    }

    onRcvMessage(msgEvent) {
        // console.log(msgEvent.data);
        if (msgEvent.data == 'HeartBeat') {
            this.resetHeart();//重置重连心跳
        } else {
            let dataTmp = JSON.parse(msgEvent.data);
            switch (dataTmp.type) {
                case 'QUOTATION':
                    let resultObj_1 = JSON.parse(dataTmp.Data);
                    DeviceEventEmitter.emit('QUOTATION', { data: resultObj_1 });
                    break;
                case 'POSITION':
                    let resultObj_2 = JSON.parse(dataTmp.Data);
                    DeviceEventEmitter.emit('POSITION', { data: resultObj_2 });
                    break;
                default:
                    break;
            }
        }
    }

    onRcvError() {
        console.log('error');
    }

    onRcvClose() {
        console.log('close');
        this.clearTimers();
        this.newWs();
    }
}