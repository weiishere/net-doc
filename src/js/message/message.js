// 自执行的匿名函数创建一个上下文，避免引入全局变量
(function() {
    var initializing = false, fnTest = /xyz/.test(function() { xyz; }) ? /\b_super\b/ : /.*/;
    this.Class = function() { };
    // 继承方法定义
    Class.extend = function(prop) {
        var _super = this.prototype;
        initializing = true;
        var prototype = new this();
        initializing = false;
        // 我觉得这段代码是经过作者优化过的，所以读起来非常生硬，我会在后面详解
        for (var name in prop) {
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn) {
                    return function() {
                        var tmp = this._super;
                        this._super = _super[name];
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }
        function Class() {
            // 在类的实例化时，调用原型方法init
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }
        Class.prototype = prototype;
        Class.constructor = Class;
        Class.extend = arguments.callee;
        return Class;
    };

    this.Message = Class.extend({
        init : function(data) {
            this.data = data;
        },
        render : function(){

        }
    });
})();