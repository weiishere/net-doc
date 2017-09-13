var $ = require('jQuery');
var requestForJsonP = (function () {
    //var resultData = {};
    var qeruestStack = [];//模拟堆栈来完成，以解决那种回调函数名一样的反科学请求可以正常请求
    var isOver = true;
    var _request = function (_param, next) {
        var radomId = parseInt(Math.random() * 100000);
        var _option = $.extend({
            callbackHeader: "callBack_" + radomId,
            param: "",
            error: function () { }
        }, _param.option || {});
        window[_option.callbackHeader] = function (data) {
            if (typeof (_param.success) == "function") _param.success(data);
        }
        var _script = document.createElement("script");
        _script.id = "jspSctipt_" + radomId;
        _script.setAttribute("type", "text/javascript");
        _script.onload = _script.onreadystatechange = function () {
            if (!/*@cc_on!@*/0 || this.readyState == "loaded" || this.readyState == "complete") {
                this.onload = this.onreadystatechange = null; this.parentNode.removeChild(this);
                //$("#loading").hide();
            } else {
                //$("#loading").hide();
                //Trip("对不起 ，请求发生错误~");
                _option.error();
            }
            next();
        }
        _script.setAttribute("src", _param.url + "?callback=" + _option.callbackHeader + (_option.param ? "&" + _option.param : ""));
        //_script.setAttribute("src", url + "?callback=" + _option.callbackHeader + "&" + _option.param + "&timer=" + parseInt(Math.random() * 100000));
        (document.getElementsByTagName("head").item(0) || document.documentElement).appendChild(_script);
    }
    var index = 0;
    window.setInterval(function () {
        if (isOver == true) return;
        if (qeruestStack.length !== 0) {
            isOver = true;
            _request(qeruestStack[index], function () {
                index++;
                if (index < qeruestStack.length) {
                    isOver = false;
                    //未结束，等待时钟进行下一次请求
                } else {
                    isOver = true;
                    index = 0;
                    qeruestStack = [];
                }
            });
        }
    }, 50);
    return function (url, option, success, noLoading, isNormalRequest) {
        //if (!noLoading) $("#loading").show();
        qeruestStack.push({ url: url, option: option, success: success });
        isOver = false;
    }
})();
module.exports = requestForJsonP;