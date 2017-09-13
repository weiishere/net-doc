"use strict";

var $ = require('jquery');
(function () {
    function MessageBox(content, ...events) {
        this.content = content;
        this.events = events;
        this.dom = this.render();
        this.eventBind(this.dom);
        return this.dom;
    }
    MessageBox.prototype.render = function () {
        let dom = $("<div class='mb-wrapper'><div class='mb-boxWrap'><div class='mb-content'>" + this.content + "</div><div class='mb-bottonWrap'></div></div></div>");
        let boxWrap = dom.find(".mb-bottonWrap");
        let buttonWidth = 100 / (this.events.length || 1);


        if (this.events.length === 0) {
            boxWrap.append("<button style='width:100%'>确定</button>");
        } else {
            if (this.events[0] !== false) {
                this.events.forEach(function (item) {
                    if (Object.prototype.toString.call(item) === '[object Array]') {
                        boxWrap.append("<button style='width:" + buttonWidth + "%'>" + item[0] + "</button>");
                    }
                });
            }else{
                dom.find('.mb-bottonWrap').remove();
            }
        }
        window.setTimeout(() => { dom.find(".mb-boxWrap").addClass("active"); }, 10);
        return dom;
    };
    MessageBox.prototype.eventBind = function () {
        this.dom.on("click", ".mb-bottonWrap>button", (e) => {
            let _index = $(e.currentTarget).index();
            if (this.events.length !== 0) if (this.events[_index][1]) this.events[_index][1]();
            this.close($(e.currentTarget).index());
        });
    };
    MessageBox.prototype.close = function (index) {
        if (this.events.length !== 0) {
            if (index !== undefined && this.events[index][2]) {
                this.events[index][2].call(this);
                return;
            }
        }
        this.dom.addClass("mb-hide").find(".mb-boxWrap").removeClass("active");
        window.setTimeout(() => { this.dom.remove() }, 200);
    }
    module.exports = MessageBox;
})();

/**
 示例
 * $('body').append(new Message("弹出层消息", 
                ['OK', function () {
                    
                },function(){
                    //关闭回调、此方法省略时默认就只是关闭
                    this.close();
                }], ['Cancel', function () {
                    
                }]));
 */