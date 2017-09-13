(function (argument) {

    var textMsg = require('../message/text-message');
    var sysMsg = require('../message/sys-message');
    var tipMsg = require('../message/tip-message');
    var imageMsg = require('../message/image-message');
    var dataManager = require('../common/data-manager');
    var component = require('../message/component');
    var config = require('../chat/config');
    var sender = require('../chat/sender');
    var time = require('../chat/time');
    let Countdown = require('../common/countdown');
    var Message = require('../common/messageBox');
    var socket = require('./websocket');
    var utils = require('../common/utils');
    const $ = require('jquery');


    var msgTain = null;
    var getClass = new Function();


    function rend(dom, who, isHistory) {
        var msgwapper = msgTain;
        if (isHistory) {
            msgTain.prepend(dom);
            msgwapper[0].scrollTop = msgwapper[0].scrollTop + dom.outerHeight();
        } else {
            msgTain.append(dom);
            msgwapper[0].scrollTop = msgwapper[0].scrollHeight;
        }
        //msgTain.append(dom);


        window.setTimeout(() => {
            dom.find('.jui-msg-content-wrapper,.jui-msg-avatar').addClass("slider");
        }, 5);
        if (who === "self") {
            window.setTimeout(() => {
                if (dom.find(".jiu-msg-loadingHide").length === 0) {
                    Render.sendFaile(dom);
                }
            }, config.get("timeOut"));
        }
    }


    var Render = {
        pageInit: function () {
            let wapperHeight = $("#J_JuiExtendInfo").height();
            let footerHeight = $("#J_JuiFooterWrapper").height();
            $("#J_JuiMsgWrapper").height(document.body.clientHeight - wapperHeight - footerHeight - 20);
        },
        sendFaile: function (dom) {
            dom.find(".jiu-msg-loading").addClass("jiu-msg-faile");
            //alert("发送失败");
        },
        setStaus: function (stateCode) {
            if (!stateCode) return;
            let footer = $("#J_JuiFooterWrapper");
            let doctor = $("#J_JuiDoctorInfo");
            let state = $("#J_JuiDoingState");
            let countdown = new Countdown({
                format: "剩{dd}天{hh}小时{MM}分",
                beginTime: parseInt(config.get('initData').timeout) * 1000 * 60
            });
            var statusBar = state.find('.jui-doing-desc');
            var timerBar = state.find('.jui-doing-left');
            if (stateCode === 1) {
                //待接诊
                footer.hide();
                doctor.show();
                state.hide();
                countdown.begin($(".jui-time-left")[0]);
            } else if (stateCode === 2) {
                //问诊中、已接诊
                footer.show();
                doctor.hide();
                state.show();
                countdown.stop();
                countdown = new Countdown({
                    format: "{dd}天{hh}小时{MM}分后结束",
                    beginTime: parseInt(config.get('initData').timeout) * 1000 * 60
                });
                countdown.begin(timerBar[0]);
                state.find('i').css({ 'background-color': '#8AC557' });
                statusBar.html('问诊中');
                timerBar.show();
            } else if (stateCode === 3) {
                //已取消
                countdown.stop();
                $('body').append(new Message("您好，本次问诊已取消~"));
                state.find('i').css({ 'background-color': '#ccc' });
                statusBar.html('本次问诊已取消');
                timerBar.hide();
                footer.hide();
                doctor.hide();
            } else if (stateCode === 4 || stateCode === 11) {
                //已完成
                countdown.stop();
                $('body').append(new Message("您好，本次问诊已经完成~"));
                state.find('i').css({ 'background-color': '#ccc' });
                statusBar.html('本次问诊已完成');
                timerBar.hide();
                doctor.hide();
                $('#J_JuiFooterWrapper').hide().after("<div class=\"jui-footer-wrapper endFooter\"><a href=\"//care.yiyaojd.com/teacher?id=" + config.get('doctor').doctorId + "\">在线复诊</a>" +
                    "<a href=\"//care.yiyaojd.com/inquiry/evaluate-" + config.get('doctor').doctorId + "?diagId=" + config.get('diagId') + "&orderId=" + config.get('orderId') + "\">评价</a></div>");
            } else if (stateCode === 12) {
                //已拒诊
                countdown.stop();
                $('body').append(new Message("抱歉，本次问诊已被拒珍~"));
                state.find('i').css({ 'background-color': '#ccc' });
                statusBar.html('本次问诊已完成');
                timerBar.hide();
            } else if (stateCode === 13) {
                //已退诊
                countdown.stop();
                $('body').append(new Message("您好，本次问诊已中断或退珍~"));
                state.find('i').css({ 'background-color': '#ccc' });
                statusBar.html('本次问诊已完成');
                timerBar.hide();
            } else {
                $('body').append(new Message("抱歉，状态未知的问诊，请联系客服~"));
                state.find('i').css({ 'background-color': '#ccc' });
                statusBar.html('问诊状态未知');
                timerBar.hide();
                footer.hide();
                doctor.hide();
            }
            this.pageInit();
        },
        flue: function (_data, isHistory, callback) {

            let self = this;
            var data = _data.data;
            let _mesData = data;
            var additionalClass = "";
            var html = null;
            let handle = (who, headData, callback) => {
                var message = $(html).attr('msgData', JSON.stringify(headData));
                message.attr({ 'msgid': headData.id || headData.body.msgId, mid: headData.mid });
                message.addClass(additionalClass);
                if (who === "self" && !isHistory) {
                    message.find(">div").append("<div class=\"jiu-msg-loading\"></div>");
                }
                if (isHistory) {
                    rend(message, who, isHistory);
                    time.render(headData.timestamp, isHistory, headData.body.action ? true : false);//第3个参数用于删除时间（状态信息要清除之前的历史信息保留最新）

                } else {
                    time.render(headData.timestamp, isHistory, headData.body.action ? true : false);
                    rend(message, who, isHistory);
                }

            }
            let renderHtml = (mesData) => {
                try {
                    //去重
                    if (!isHistory) {
                        for (var item in config.get("logMes")) {
                            if (config.get("logMes")[item].mid === mesData.mid) {
                                return false;
                            }
                        }
                    } else {
                        //去掉发给医生端的系统消息
                        if (mesData.from.pin === "@im.jd.com" && mesData.to.pin === config.get("doctor").pin) {
                            return false;
                        }
                    }

                    if (!mesData.body) {
                        if (mesData.errorCode === 4281) {
                            $('body').append(new Message("抱歉，本问诊会话已经在其他终端打开，此终端已经暂停消息收发，点击确定重新连接~", ['确定', function () {
                                document.location.reload();
                            }]));
                            socket.end();
                        } else {
                            if(utils.getUrlParmter('debug')){
                                $('body').append(new Message("抱歉，会话出现错误（" + mesData + "）~"));
                            }
                        }
                        return;
                    }
                    if (mesData.body.type === "client_heartbeat") return;
                    var customer = config.get('customer');
                    var body = mesData.body;
                    if (body.chatinfo) {
                        if (body.chatinfo.sid !== config.get('sid')) {
                            return;
                        }
                    } else {
                        return;
                    }
                    additionalClass = getClass(body);
                    var who = customer.pin === mesData.from.pin ? 'self' : 'other';
                    if (body.type === 'template2') {
                        html = (function () {
                            return component.render(mesData, function (tplMsg, id) {
                                $(".jui-msg-common[msgid='" + mesData.id + "'] .jui-msg-content").append(tplMsg.dom);
                                // html = string;
                                // handle(who, mesData);
                                // if (callback) callback();
                            }, who)
                        })();


                    } else if (body.type === 'text') {
                        if (body.render === "sys") {
                            html = sysMsg.render(body.content, body.action ? true : false);
                            if (!isHistory) {
                                if (body.chatinfo) {
                                    if (body.chatinfo.diagStu === 2) {
                                        //如果是ws接口触发的进入问诊状态切换，需要重新请求一下以得到最新的倒计时(默认7天)
                                        config.get('initData').timeout = 7 * 24 * 60;
                                    }
                                    self.setStaus(body.chatinfo.diagStu);
                                }
                            }
                        } else if (body.render === "tips") {
                            html = tipMsg.render(body.content);
                        } else {
                            html = textMsg.render(body.content, who);
                        }
                    } else if (body.type === 'image') {
                        html = imageMsg.render(body.url, who);
                    } else {
                        /*
                         * no support
                        */
                        return false;
                    }
                    handle(who, mesData);
                    if (callback) callback();
                }
                catch (e) {
                    $('body').append(new Message(e));
                }
            }


            if (data instanceof Array) {
                data.forEach(function (item) {
                    _mesData = eval("(" + item + ")");
                    renderHtml(_mesData);
                });
            } else {
                _mesData = data;
                if (typeof _mesData == "string") {
                    _mesData = eval("(" + _mesData + ")");
                }
                renderHtml(_mesData);
            }
            if (isHistory === false && _mesData.type !== "ack" && _mesData.type !== undefined) {
                //发送接收消息确认
                sender.receiveHandle(_mesData);
            }

            dataManager.set(_mesData);

            //消息发送结果回执
            if (_mesData.type === "ack") {
                $(".jui-msg-common[msgid='" + _mesData.id + "'] .jiu-msg-loading").addClass("jiu-msg-loadingHide");
            } else if (_mesData.type === "failure") {

            }

        },

        setTain: function (tain) {
            msgTain = tain;
        },

        setClassHandle: function (handle) {
            getClass = handle;
        }
    }

    module.exports = Render;
})();