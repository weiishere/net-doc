"use strict";
var $ = require('jQuery');
(function () {
    module.exports = class Countdown {
        constructor(option) {
            let self = this;
            let property = ['beginTime', 'gap', 'isMili', 'format', 'progress', 'end'];
            let _option = $.extend({ gap: 1000, format: '{dd}天{hh}时{MM}分{ss}秒' }, option || {});
            //let _option = Object.assign({ gap: 1000, format: '{dd}天{hh}时{MM}分{ss}秒' }, option);
            for (let opt in _option) {
                property.forEach(function (item) {
                    if (item === opt) self[item] = _option[opt];
                })
            }
            this.remnantTime = this.beginTime;
            this.pause = false;
            this.result = "";
            this.timeObj = { remnantTime: 0 };
        }
        begin(wrapper) {
            this.timer = window.setInterval(() => {
                if (this.pause) return;
                this.remnantTime - this.gap <= 0 ? this.stop() : this.remnantTime -= this.gap;
                this.timeObj.remnantTime = this.remnantTime;
                this.timeObj.fullHour = parseInt(this.remnantTime / 60 / 60 / 1000);
                this.timeObj.hour = (this.format.indexOf('{dd}') != -1 || this.format.indexOf('{d}') != -1) ? this.timeObj.fullHour % 24 : this.timeObj.fullHour;
                this.timeObj.minute = parseInt((this.remnantTime % (60 * 60 * 1000)) / 60000);
                this.timeObj.second = parseInt(((this.remnantTime % (60 * 60 * 1000)) % 60000) / 1000);
                this.timeObj.milliseconds = parseInt(((this.remnantTime % (60 * 60 * 1000)) % 60000) % 1000);
                let getDoubleSite = (num) => num < 10 ? "0" + num : num;
                this.result = this.format
                    .replace(/{d}/g, parseInt(this.timeObj.fullHour / 24))
                    .replace(/{h}/g, this.timeObj.hour)
                    .replace(/{M}/g, this.timeObj.minute)
                    .replace(/{s}/g, this.timeObj.second)
                    .replace(/{m}/g, this.timeObj.milliseconds)
                    .replace(/{dd}/g, getDoubleSite(parseInt(this.timeObj.fullHour / 24)))
                    .replace(/{hh}/g, getDoubleSite(this.timeObj.hour))
                    .replace(/{MM}/g, getDoubleSite(this.timeObj.minute))
                    .replace(/{ss}/g, getDoubleSite(this.timeObj.second));
                if (this.progress) this.progress.call(this, this.timeObj);
                wrapper.innerHTML = this.result;
            }, this.gap);
        }
        triggerPause() {
            this.pause = !this.pause;
        }
        stop() {
            this.remnantTime = 0;
            window.clearInterval(this.timer);
            if (this.end) this.end.call(this, this.timeObj);
        }
    }
})();
