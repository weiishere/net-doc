(function (argument) {
    var requestForJsonP = require('../common/requestJsonp');
    var Template = require('../common/template');
    var $ = require('jQuery');
    var config = require('../chat/config');
    require('../lib/jquery.tpls');

    var tpls = {};
    var tplData = null;
    

    function getCode(url) {
        var param = url.match(/componentCode\=.+(?=&)/) || url.match(/componentCode\=.+$/);

        if (!param) return null;
        //return param.split('=')[1];
        return url;
    }

    function handle() {

    }

    function getOuter(who, data) {

        var clsString = 'jui-msg-' + who;
        var avatar = who = 'self' ? config.get('selfAvatar') : config.get('otherAvatar');

        var DOMs = new Array();
        DOMs.push('<div class="jui-msg-common ' + clsString + ' jui-msg-patient-card">');
        DOMs.push('<img class="jui-msg-avatar" src="' + avatar + '" />');
        DOMs.push('<div class="jui-msg-content-wrapper"><div class="jui-msg-arrow"></div>');
        DOMs.push('<i class="jui-msg-arrow-cover"></i>');
        DOMs.push('<div class="jui-msg-content" id="J_JuiMsgContent"></div></div>');

        return $(DOMs.join(''));
    }

    var Components = {
        templateData: {},
        getTemplate: function (url, cb, callback) {
            // var code = getCode(url);
            // if (!code) {
            //     callback('');
            //     return;
            // }

            // if (typeof tpls[code] != 'undefined') {
            //     callback(tpls[code], false);
            //     return;
            // }
            //模拟诊断单jsonp
            // if (url === "https://storage.360buyimg.com/jimi/x.jsonp?cb=1495140010652_p&v=1") {
            //     window.setTimeout(function () {
            //         callback({
            //             "scripts": "",
            //             "styles": "",
            //             "template": "<div class=\"jui-prescription-doc\"><div class=\"jui-prescription-result\"><i></i> 初步诊断：${cause}</div><div class=\"jui-prescription-link\"><a href=\"${rxUrl}\"><span>查看处方详情</span><i class=\"jui-link-arrow\"></i></a></div></div>"
            //         }, true);
            //     }, 100);
            //     return;
            // }

            requestForJsonP(url, {
                callbackHeader: cb
            }, function (data) {
                callback(data, true);
            });


            // $.ajax({
            //     url: url,
            //     type: 'get',
            //     dataType: 'jsonp',
            //     jsonpCallback: cb,
            //     success: function (data) {
            //         callback(data, true);
            //     }
            // });

            // $.ajax({
            //     type : 'get',
            //     url : url,
            //     dataType : 'json',
            //     success : function(data) {
            //         if(data.code == 1) {
            //             callback(data, true);
            //             tpls[code] = data;
            //         }
            //     }
            // });
        },

        render: function (mesData, callback, who) {
            tplData = mesData.body;
            this.getTemplate(mesData.body.template.url, mesData.body.template.cb, function (json, isNew) {
                var msg = {};
                msg.data = mesData.body.data,
                    msg = $.extend(msg, json);
                //模拟数据
                // msg.template = '<div class="jui-patient-doc"><div class="jui-patient-basic-info">${nickname}<span class="jui-basic-lap"></span>${gendar==0?"男":"女"}<span class="jui-basic-lap"></span>${age}岁';
                // msg.template += '<div class="jui-patient-condition-des">${content}</div></div><div class="jui-patient-doc-link"><a href="${medicalRecordsUrl}"><span>查看患者档案</span><i class="jui-link-arrow"></i></a></div></div>';

                var tplMsg = Template.templateMessageParse(msg);
                //var outher = getOuter(who);
                var temp = $('<div>');
                tplMsg.dom.appendTo(temp);
                tplMsg.method(temp);
                if (isNew) {
                    tplMsg.style();
                }
                //$(".jui-msg-common[guid='msgid']")
                //outher.find('#J_JuiMsgContent').append(tplMsg.dom);
                //outher.find('.jui-msg-content').append(tplMsg.dom);
                callback(tplMsg, mesData);
            });
            return getOuter(who);
        }
    }


    module.exports = Components;
})();