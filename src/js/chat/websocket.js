var config = require('./config');

(function () {
    var link = null;
    var socket = null;
    var lockReconnect = false;//避免重复连接
    var heartTime = 10000;//心跳间隔时间10s
    var onOpen = new Function();
    var onMessage = new Function();
    var onClose = new Function();
    var onError = new Function();

    var linkUrl = "";

    module.exports = {
        setLockReconnect: function (value) {
            lockReconnect = value;
        },
        heartCheck: {
            timeout: heartTime,
            timeoutObj: null,
            serverTimeoutObj: null,
            reset: function () {
                clearTimeout(this.timeoutObj);
                clearTimeout(this.serverTimeoutObj);
                this.start();
            },
            start: function () {
                var self = this;
                this.timeoutObj = setTimeout(function () {
                    let heartbeat_data = {
                        "from": {
                            "pin": config.get('customer').pin,
                            "app": config.get('customer').appId,//"jd.dyf",
                            "clientType": "m"
                        },
                        "type": "client_heartbeat",
                        "aid": config.get('customer').aid,
                        "ver": "4.1"
                    };
                    socket.send(JSON.stringify(heartbeat_data));
                    self.serverTimeoutObj = setTimeout(function () {
                        //如果onclose会执行reconnect，执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                        socket.close();
                    }, self.timeout)
                }, this.timeout)
            },
        },
        start: function () {
            //if (socket) return socket;
            if (!link) {
                throw new Error('Please set location for socket');
            }
            try {
                console.log(link);
                socket = new WebSocket(link);//("ws://10.182.67.197?pin=hetfy&appId=jd.dyf&clientType=comet&aid=testOnly");
                socket.onopen = function () {
                    onOpen();
                };
                socket.onmessage = onMessage;
                socket.onerror = onError;
                socket.onclose = onClose;
            } catch (e) {
                throw new Error('内部错误（websocket start error）');
            }
        },
        end: function () {
            lockReconnect = true;
            socket.close();
        },
        reconnect: function () {
            if (lockReconnect) return;
            lockReconnect = true;
            var self = this;
            //没连接上会一直重连，设置延迟避免请求过多
            setTimeout(function () {
                self.start();
                lockReconnect = false;
            }, 2000);
        },
        setLoction: function (url, params) {
            //url = linkUrl = (location.protocol == 'http:' ? 'ws://' : 'wss://') + url;
            var string = '';
            if (params && typeof params == 'object') {
                var arr = new Array;
                for (var a in params) {
                    arr.push(a + '=' + params[a]);
                }
                string = arr.join('&');
            }
            if (url.indexOf('?') > 0) {
                link = url + '&' + string;
            } else {
                link = url + '?' + string;
            }
            //link='ws://ws0-dd.jd.com/?appId=id.customer&pin=zhang98722&aid=g7m0TRvX&clientType=m&_wid_=ecdab333-e732-422a-9984-0ed6f25424ab';
        },

        setOpenCallback: function (callback) {
            var self = this;
            onOpen = (data) => {
                self.heartCheck.start();
                callback(data);
            }
        },

        setMessageCallback: function (callback) {
            var self = this;
            onMessage = (...data) => {
                self.heartCheck.reset();
                callback(data[0]);
            }
        },

        setErrorCallback: function (callback) {
            var self = this;
            onError = (data) => {
                self.reconnect();
                callback(data);
            }
        },

        setCloseCallback: function (callback) {
            var self = this;
            onClose = (data) => {
                self.reconnect();
                callback(data);
            }
        },
        send: function (data) {
            if (socket.readyState === 1) {
                socket.send(data)
            } else {

            }
        }
    }
})();