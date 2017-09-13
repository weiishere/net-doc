var $ = require('jquery');
(function (argument) {

    /*
     * lastTime for realtime
     * topTime for histories
    */
    var timeMsg = require('../message/time-message');
    //var lastTime =  (new Date()).valueOf();//(new Date).getTime();
    //var topTime  = lastTime;

    function addPreZero(num) {
        return num < 10 ? '0' + num : '' + num;
    }
    function isDate(str) {
        var d = new Date(str)
        return !isNaN(d)
    }
    function format(arg) {
        var nowObj = new Date();
        var today = new Date();
        var timeDiff;
        var time;
        var deltaTime;
        var dayTime = 24 * 60 * 60 * 1000;

        // if (isDate(arg)) {
        //     throw new Error('Parameter "dateObj" is not a Date object.');
        // }

        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        timeDiff = nowObj - today;
        deltaTime = nowObj - arg;
        if (deltaTime <= timeDiff) {
            time = arg.format('今天 {H}:{I}');
        } else if (deltaTime <= timeDiff + dayTime) {
            time = arg.format('昨天 {H}:{I}');
        } else if (deltaTime <= timeDiff + 8 * dayTime) {
            time = arg.format('周{W} {H}:{I}');
        } else {
            time = arg.format('{Y}-{M}-{D} {H}:{I}');
        }

        return time;
    }

    Date.prototype.format = Date.prototype.format || function (style) {
        var obj = {};
        var reg = /\{([ymdhisw])\}/i;
        var weekString = '日一二三四五六';
        style = '' + style;
        obj.y = this.getFullYear();
        obj.Y = obj.y;
        obj.m = this.getMonth() + 1;
        obj.M = addPreZero(obj.m);
        obj.d = this.getDate();
        obj.D = addPreZero(obj.d);
        obj.h = this.getHours();
        obj.H = addPreZero(obj.h);
        obj.i = this.getMinutes();
        obj.I = addPreZero(obj.i);
        obj.s = this.getSeconds();
        obj.S = addPreZero(obj.s);
        obj.w = weekString.charAt(this.getDay());
        obj.W = obj.w;
        while (style.match(reg)) {
            style = style.replace(reg, obj[RegExp.$1]);
        }
        return style;
    };
    /*
     * time lap for message 
    */
    var lap = 60;
    var tain = null;

    var Time = {
        lastTime: 0,//(new Date()).valueOf(),
        topTime: 0,//(new Date()).valueOf(),
        render: function (time, isHistory,isAction) {
            var timeGap = lap * 1000;//暂定一分钟内发消息不显示time

            if (isHistory) {
                // if (this.topTime - time > timeGap) {
                //     var msg = timeMsg.render(format(new Date(this.topTime)));
                //     tain.prepend($(msg));
                // }
                // this.topTime = time;
                var msg = timeMsg.render(format(new Date(time)),isAction);
                tain.prepend($(msg));
                tain[0].scrollTop = tain[0].scrollTop + $('.jui-msg-time').outerHeight();//$(msg).height();
            } else {
                if (time - this.lastTime > timeGap) {
                    var msg = timeMsg.render(format(new Date(time)),isAction);
                    tain.append($(msg));
                }
                this.lastTime = time;
            }

            // if (isHistory) {
            //     if (this.topTime - time > timeGap) {
            //         var msg = timeMsg.render(format(new Date(this.topTime)));
            //         tain.prepend($(msg));
            //     }
            //     this.topTime = time;
            // } else {
            //     if (time - this.lastTime > timeGap) {
            //         var msg = timeMsg.render(format(new Date(time)));
            //         tain.append($(msg));
            //     }
            //     this.lastTime = time;
            // }

        },

        lap: function (num) {
            /*
             * minute unit
            */
            lap = num;
        },

        setTain: function (arg) {
            tain = arg;
        }
    }
    module.exports = Time;
})();