(function () {
    var jQuery = require('jquery');
    var $ = jQuery;
    var md5 = require('./common/md5.js');
    var config = require('./chat/config');
    var socket = require('./chat/websocket');
    var render = require('./chat/render');
    var sender = require('./chat/sender');
    var myHistory = require('./chat/history');
    var time = require('./chat/time');
    var utils = require('./common/utils');
    var Message = require('./common/messageBox');
    var fileUploader = require('./common/fileUploader');
    var dropdownLoader = require('./common/dropdownLoader');

    //$("#J_JuiConnect i").append(require('../tester.html'));
    var digId = (function () {
        var string = location.search.replace(/^\?/g, '');
        var result = null;
        if (string) {
            var arr = string.split('&');
            for (var i = 0, len = arr.length; i < len; i++) {
                if (arr[i].match(/digId\=/)) {
                    result = arr[i].split('=')[1];
                    break;
                }
            }
        }
        return result;
    })();

    var App = function () {
        var that = this;
        var isInitDropDownLoder = false;
        that.tain = $('#J_JuiMsgWrapper');
        that.digData = null;
        render.pageInit();
        that.logPage = 0;
        that.isMoreInfo = true;

        that.data(function (data) {
            that.time();
            that.sender();
            that.render();
            if (data.diagStu === 1 || data.diagStu === 2) {
                //如果没在问诊中，不启动ws接口
                that.socket();
            }
            that.history();
            that.getChatlog(function () {
                dropdownLoader(that.tain, function () {
                    var self = this;
                    that.getChatlog(function () {
                        self.slidHide();
                    })
                });
                that.tain[0].scrollTop += that.tain[0].scrollHeight;
                $(".jui-msg-content img").on('load', function (e) {
                    that.tain[0].scrollTop = that.tain[0].scrollTop + $(this).parents('.jui-msg-common').eq(0).height();
                });
            });

        });
        fileUploader($("#J_JuiIconUpload")[0], {
            type: "form",//form
            btnTxt: "upload",
            init: function () { },
            onProgress: function () {
                $('body').append("<div class='mb-wrapper load'>图片处理中，请稍后...</div>");
            },
            onSuccess: function (file) {
                //发送imgdata
                sender.intData({
                    "type": "image",
                    "width": file.width,
                    "height": file.height,
                    "url": file.filePath,
                });
                $('.load').remove();
            },
            onError: function (error) {
                $('.load').remove();
                $('body').append(new Message("抱歉，图片上传失败（" + error.code + "）~"));
            }
        });
        // $('body').on('load','.jui-msg-content img',function(){
        //     console.log('img load');
        // });


        


    }
    //socket接通默认初始执行
    App.prototype.scInit = function () {
        //发送病人症状和资料
        /*
        let initData = config.get('initData');
        let caseData = {
            "type": "template2",
            "data": {
                "diagId": initData.diagId,
                "content": initData.pathogeny,//"头痛，流鼻涕，大便干涩，味酸",
                "nickname": initData.patient.nickname,
                "gendar": initData.patient.gendar,
                "age": initData.patient.age,
                "medicalRecordsUrl": initData.patient.medicalRecordsUrl
            },
            "template": {
                "url": "http://storage.jd.com/jimi.test/JQuery/3/4858921bc7c662b2_1.js",
                "cb": "cb_4858921bc7c662b2",
                "nativeId": "0"
            }
        }
        sender.dataFactory(caseData, function (data) {
            render.flue({ data: data }, false, function () {
                socket.send(JSON.stringify(data));
            });
        });
        */
    }
    App.prototype.data = function (callback) {
        var that = this;
        /*
         * get data for initialation
        */
        //$('body').append(new Message("抱歉，内部错误~"));
        $('body').append("<div class='mb-wrapper load'>loading...</div>");
        $('#J_JuiIconUpload').addClass('jui-send-disabled');
        $.ajax({
            url: 'http://' + utils.getUrlParmter('domain') + '/checkin?entry=' + utils.getUrlParmter('entry'),
            dataType: 'jsonp',
            timeout: 5000,
            success: function (json) {
                if (!json.success) {
                    var ecode = parseInt(json.errorCode) % 1000
                    if (ecode === 101) {
                        $('body').append(new Message("抱歉，内部错误~"));
                    } else if (code === 102) {
                        $('body').append(new Message("抱歉，会话超时，请检查网络或者重试~"));
                    } else if (code === 201) {
                        $('body').append(new Message("抱歉，您尚未登录~"));
                    } else if (code === 202) {
                        $('body').append(new Message("抱歉，会话初始化失败~"));
                    } else if (code === 203) {
                        $('body').append(new Message("抱歉，会话初始化失败~"));
                    } else {
                        $('body').append(new Message("抱歉，出现未知错误~"));
                    }
                } else {
                    $.ajax({
                        async: false,
                        url: config.get("initUrl"),
                        type: "GET",
                        dataType: 'jsonp',
                        data: {
                            ptype: "diag.getDiagGeneralById",
                            appId: json.context.appId,
                            _token_: json.context.aid,
                            //pt_key:json.context.aid,
                            _pin_: json.context.pin,
                            clientType: "m",
                            pin: json.context.pin,
                            diagId: utils.getUrlParmter('diagId')
                        },
                        timeout: 60000,
                        success: function (json2) {
                            try {
                                if (json2.code !== 1) {
                                    $('body').append(new Message("抱歉，用户信息初始化失败(" + json2.code + ")~", false));
                                    return;
                                }
                                var _data = json2.result;
                                config.set("initData", _data);
                                config.set('diagId', json2.result.diagId);
                                config.set('orderId', json2.result.orderId);
                                config.set('sid', 'dyf-' + md5(json2.result.diagId));
                                $('title').html('' + _data.doctor.name + '  ' + _data.doctor.departmentName);
                                //config.set('customerAppId', json.context.appId);
                                //$("#J_JuiConnect>a").attr('href', json2.result.helpline);
                                //config.set('customerPin', 'hetfy');
                                config.set('socketUrl', json.context.webSocket);
                                config.set('customer',
                                    {
                                        appId: json.context.appId,
                                        pin: json.context.pin,
                                        aid: json.context.aid,
                                        wid: json.context.wid,
                                        avatar: _data.patient.avatar,
                                        nickname: _data.patient.nickname,
                                        //medicalRecordsUrl: _data.patient.medicalRecordsUrl
                                    });
                                config.set('selfAvatar', config.get('avatar') + _data.patient.avatar);
                                config.set('otherAvatar', config.get('avatar') + _data.doctor.avatar);
                                config.set('doctor', _data.doctor);
                                $("#J_JuiDoctorInfo i>img").attr('src', config.get('otherAvatar'));
                                callback(_data);
                            } catch (e) {
                                if(utils.getUrlParmter('debug')){
                                    $('body').append(new Message("request.do error：(" + json2 + ")", false));
                                }
                            }
                        },
                        complete: function (XMLHttpRequest, textStatus) { },
                        error: function () {
                            $('body').append(new Message("抱歉，用户信息初始化失败(网络错误)~", false));
                        }
                    });
                }
            },
            complete: function () {
                $('.load').remove();
            },
            error: function () {
                $('body').append(new Message("抱歉，网络错误~"));
            }
        });
    }

    /*
     *  get Avatar for doctor and patient
    */
    App.prototype.avatar = function () {
        var that = this;

        var selfAvatar = '';

        config.set('selfAvatar', '//img13.360buyimg.com/cms/jfs/t6244/5/1566983053/3403/4def53fc/595468c2N597473ee.png');
        config.set('otherAvatar', '//img14.360buyimg.com/cms/jfs/t6184/14/1587950103/3764/868e8c73/595468c2N9366595d.png');

    }
    App.prototype.getChatlog = function (callback) {
        var page = this.logPage;
        if (this.isMoreInfo) {
            page = ++this.logPage;
        }
        var self = this;
        $.ajax({
            url: config.get('logListUrl'),
            dataType: 'jsonp',
            timeout: 5000,
            data: {
                group: 1,
                qt: 1,//有sid查询条件的时候需要改为1
                uid: '{"app":"' + config.get('customer').appId + '","pin":"' + config.get('customer').pin + '","clientType":"m"}',
                page: page,
                aid: config.get('customer').aid,
                sid: config.get('sid')
            },
            success: function (json) {
                var resultData = [];
                // for (var i = json.body.length - 1; i >= 0; i--) {
                //     resultData.push(json.body[i].data);
                // }
                if (json.body.length == 0) {
                    self.isMoreInfo = false;
                } else {
                    json.body.forEach(function (item) {
                        resultData.push(item.data);
                        config.get('logMes').push(eval("(" + item.data + ")"));
                    });
                }
                //config.set['logMes'] = resultData;
                render.flue({ data: resultData }, true);
                if (callback) callback();
            }
        });
    }

    App.prototype.config = function () {
        var that = this;


    }

    App.prototype.render = function () {
        var that = this;

        render.setTain(that.tain);
        render.setStaus(config.get("initData").diagStu);
        /*
         * set addtional class for message
        */
        render.setClassHandle(function (data) {
            if (data.type == 'image') {
                return 'jui-msg-image';
            } else if (data.type == 'template') {
                return 'template jui-msg-prescription-card';
            } else {
                return '';
            }
        });
    }

    App.prototype.sender = function () {
        var that = this;
        sender.sendDisabled('jui-send-disabled');
        sender.setSendHandle(function (data) {
            //渲染发送出去的消息
            render.flue({ data: data }, false);
            socket.send(JSON.stringify(data));
            $("#J_JuiInputWrapper input").val("");
        })
    }

    App.prototype.socket = function () {
        var that = this;

        //set url for websocket
        socket.setLoction(config.get("socketUrl"), {
            appId: config.get('customer').appId,
            clientType: 'm',
            pin: config.get('customer').pin,
            aid: config.get("customer").aid,
            _wid_: config.get("customer").wid
        });
        // socket.setLoction('ws0-dd.jd.com',{
        //     appId: config.get('customerAppId'),
        //     clientType : 'm'
        // });
        /*
         * 
        */
        socket.setOpenCallback(function () {
            console.log("open");
            $('#J_JuiIconSend,#J_JuiIconUpload').removeClass('jui-send-disabled');
            that.scInit();
        });
        socket.setCloseCallback(function () {
            console.log("close");
            $('#J_JuiIconSend,#J_JuiIconUpload').addClass('jui-send-disabled');
            //$('body').append(new Message("您好，问诊已经关闭~"));
        });
        socket.setErrorCallback(function (error) {
            console.log("error");
            //$('.mb-wrapper').remove();
            //$('body').append(new Message("抱歉，通讯异常~"));
        });
        socket.setMessageCallback(function (data) {
            // console.log("getMessage");
            // console.log(data);
            if (data) {
                render.flue(data, false);
            }
        });
        try {
            socket.start();
        }
        catch (e) {
            $('body').append(new Message(e));
        }
    }

    App.prototype.time = function () {
        var that = this;

        time.setTain(that.tain);
        time.lap(60);//60秒
        //time.render();
    }

    App.prototype.history = function () {
        var that = this;

        /*
         * set location for history message
        */
        myHistory.setLocation('');
        myHistory.setHandle(function () {
            render.flue(data, true);
        });
    }

    App.install = function () {
        var app = new App;
        App.INSTANCE = app;
        return app;
    }
    module.exports = App;
})();