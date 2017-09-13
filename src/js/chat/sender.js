(function () {
    // body...
    var jQuery = require('jquery');
    var $ = jQuery;
    var config = require('../chat/config');
    var socket = require('../chat/websocket');
    const UUIDCommon = require('../common/UUID');

    var disabledClass = '';
    var sendHandle = new Function();

    function filter(string) {
        return string.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }

    function encapsulate(content, type) {
        var data = {};
        data.type = type || "duo_message";//互联网医院
        data.ver = '4.1';
        data.from = {
            app: config.get('customer').appId,
            pin: config.get('customer').pin,
            clientType: "m"
        };
        data.timestamp = (new Date()).valueOf();
        content['chatinfo'] = {
            sid: config.get('sid'),
            diagId: config.get('diagId')
        }
        data.body = content;
        data.id = (new UUIDCommon()).generateUUID();
        data.aid = config.get('customer').aid//"testOnly";
        data.to = {
            pin: config.get('doctor').pin,//,'cangbing2003'
            app: config.get('doctor').app//"jd.doctor"//暂时使用这个'jd.doctor'
        };
        return data;

    }

    (function () {
        var input = $('#J_JuiInputWrapper input');
        var send = $('#J_JuiIconSend');
        var uploader = $("#J_JuiIconUpload");
        var text_input = $(".jui-input-large");
        var msgwapper = $('#J_JuiMsgWrapper');

        input.keyup(function () {
            var string = filter(input.val());
            if (!string) {
                send.addClass(disabledClass);
            } else {
                send.removeClass(disabledClass);
            }
        });
        //解决键盘遮挡
        text_input.on("click", function () {
            var target = this;
            window.setTimeout(function () {
                msgwapper[0].scrollTop = msgwapper[0].scrollHeight;
                target.scrollIntoView(true);
            }, 300);
        })
        //console.log(send.length)

        send.on('click', function () {
            if (input.val() === "") { return; }
            Sender.intData({ content: filter(input.val()), type: 'text' });
        });
        uploader.on('click', function () {
            if ($(this).hasClass(disabledClass)) return false;
        });
        $(document).keydown(function (event) {
            if (event.keyCode == 13) {
                if (input.val() === "") { return; }
                Sender.intData({ content: filter(input.val()), type: 'text' });
            }
        });
        $("#J_JuiMsgWrapper").on('click', ".jui-msg-content>img", function () {
            //alert($(this).attr('src'));
            $('body').append("<div class='mb-wrapper imgShow'><img src='" + $(this).attr('src') + "'/></div>");
            window.setTimeout(function () {
                $('.imgShow>img').addClass('show');
            }, 50);

            $(".imgShow").one("click", function () {
                var _self = this;
                $(this).find("img").removeClass('show');
                window.setTimeout(function () {
                    $(_self).remove();
                }, 300);
            });
        }).on("click", ".jiu-msg-faile", function () {
            //Sender.intData(eval("()") $(this).parents('.jui-msg-common').eq(0).attr("msgdata"),true);
            var reSendData = eval("(" + $(this).parents('.jui-msg-common').eq(0).attr("msgdata") + ")");
            reSendData.timestamp = (new Date()).valueOf();
            reSendData.id = (new UUIDCommon()).generateUUID();
            Sender.intData(reSendData, true);
        });
    })();

    var Sender = {
        intData: function (sendData, isInclude) {
            if ($('#J_JuiIconSend').hasClass(disabledClass)) return false;
            sendHandle(isInclude ? sendData : encapsulate(sendData));
        },
        setSendHandle: function (callback) {
            sendHandle = callback;
        },

        sendDisabled: function (string) {
            disabledClass = string;
        },
        //代码触发发送
        dataFactory: function (data, callback) {
            let _data = encapsulate(data);
            callback(_data);
            // if(Object.prototype.toString.call(data) === "[object String]"){
            //     sendHandle(encapsulate(data, 'text'));
            // }else{
            //     sendHandle(data);
            // }
        },
        /**
         *消息接收确认
         */
        receiveHandle: function (data) {
            try {
                var body_data;
                if (data instanceof Array) {
                    data.forEach(function (item) {
                        body_data.push({
                            sender: item.from.pin,
                            app: item.from.app,
                            mid: item.mid
                        });
                    });
                } else {
                    body_data = [{
                        sender: data.from.pin,
                        app: data.from.app,
                        mid: data.mid
                    }]
                }
                socket.send(JSON.stringify(
                    encapsulate(body_data, "msg_receive_ack")
                ));
            } catch (e) {
                throw e;
            }
        }
    }
    module.exports = Sender;
})();