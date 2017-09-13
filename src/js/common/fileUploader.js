
"use strict";
var $ = require('jquery');
(function () {
    module.exports = (...prarm) => {

        let [dom, option] = prarm;
        var _option = $.extend({
            url: "//file-dd.jd.com/file/uploadImg.action",
            //url:"http://10.190.30.19/file/uploadImg.action",
            type: "formData",
            btnTxt: "",
            fileSize: { min: 0, max: 1024000 },
            init: function () { },
            onStateChange: function (readyState, state) { },
            onProgress: function () { },
            onSuccess: function (imgUrl) { },
            onError: function () { },
            postData: {
                pin: "jd_im_guanguojing",
                aid: "gYFtKMid",
                clientType: "m",
                appId: "im.waiter"
            }
        }, option || {});
        if ($(dom).find('form').length == 0) {
            $(dom).append("<form class='hide' id='filePostform' target='hidden_frame' method=\"post\" action=\"" + _option.url + "\" enctype=\"multipart/form-data\"><input type=\"hidden\" name=\"html\"><input type='file' name='upload'/></form>");
        }
        var uploader = $(dom).find(":file");//.attr("accept", '.jpg, .jpeg, .png');//加accept可能出现“没有应用可执行操作”的问题
        if (_option.type === "formData") {
            (uploader[0].addEventListener('change', (e) => {
                var self = this;
                let file = this.files[0];
                if (file) {
                    if (file.size >= _option.fileSize.max) {
                        _option.onError("对不起，上传的图片大小不能超过" + (_option.fileSize.max / 1000) + "KB");
                        return;
                    }
                    var formData = new FormData();
                    formData.append("file", file);
                    var xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState > 3) {
                            if (xhr.status == 200) {
                                try {
                                    var url = JSON.parse(xhr.responseText).data.url;
                                    _option.onSuccess.call(self, url);
                                } catch (e) {
                                    _option.onError("服务器数据错误:" + e.message);
                                }
                            } else {
                                _option.onError("图片上传出现错误:" + xhr.status);
                            }
                        }
                        _option.onStateChange.call(self, xhr.readyState, xhr.status);
                    }
                    xhr.upload.onprogress = function (ev) {
                        if (ev.lengthComputable) {
                            _option.onProgress(self, 100 * ev.loaded / ev.total);
                        }
                    }
                    //侦查当前附件上传情况  
                    xhr.upload.onload = function (ev) { }
                    xhr.open("post", _option.url);
                    xhr.send(formData);
                }
            }, false))
        } else {
            try { document.domain = 'jd.com'; } catch (e) { }
            if ($(dom).find('iframe').length == 0) {
                $(dom).append("<iframe class='hide' name='hidden_frame' id=\"hidden_frame\" ></iframe>");
            }
            let frame = $("#hidden_frame");
            let form = $('#filePostform');
            //要加入这个hidden，需要深究
            form.append('<input type="hidden" name="callback" id="J_CallBack" value="callback" />');
            for (let item in _option.postData) {
                form.append("<input type='hidden' name='" + item + "' value='" + _option.postData[item] + "'/>");
            }
            uploader[0].addEventListener('change', (e) => {
                //_option['file']=e.currentTarget.files[0];
                _option.onProgress();
                form[0].submit();
            }, false);
            dom.addEventListener('click', (e) => {
                uploader.trigger("click");
            }, false);
            frame[0].onload = function (e) {
                var imgData = eval("(" + frame[0].contentDocument.body.innerHTML + ")");
                if (imgData.code === 0) {
                    var image = new Image();
                    image.onload = function () {
                        _option.onSuccess({
                            filePath: imgData.path,
                            width: image.width,
                            height: image.height,
                            fileSize: image.fileSize
                        });
                    }
                    image.src = imgData.path;
                    _option.onStateChange(imgData.code);
                } else {
                    _option.onError(imgData);
                }
            }

            // var that = this;
            // document.domain = 'jd.com';
            // var $fileForm = $('#filePostform');
            // var $callback = $('<input type="hidden" name="callback" id="J_CallBack" value="callback" />');
            // $fileForm.append($callback);
            // var form = $fileForm.get(0);
            // form.method = "post";
            // // 传参filename
            // $("input:file").attr("name", "upload");
            // //form.action = config.api.upload;
            // $("body").append("<iframe id='J_UploadFrame' name='uploadFrame'></iframe>");
            // form.target = "uploadFrame";
            // //form.submit();
            // setTimeout(function () {
            //     form.reset();
            // }, 1000);
            // $("iframe[name='uploadFrame']").css('display', 'none');
            // var imageData = '';
            // $('#J_UploadFrame').on('load', function () {
            //     var text = '';
            //     if (this.contentDocument) {
            //         text = this.contentDocument.body.innerHTML;
            //         this.contentDocument.body.innerHTML = "";
            //     } else if (this.contentWindow.document) {
            //         text = this.contentWindow.document.body.innerHTML;
            //         this.contentWindow.document.body.innerHTML = "";
            //     }
            // });

            // uploader[0].addEventListener('change', (e) => {
            //     form.submit();
            // }, false);
            // dom.addEventListener('click', (e) => {
            //     uploader.trigger("click");
            // }, false);
        }
        _option.init.call(dom);
    };
})();

