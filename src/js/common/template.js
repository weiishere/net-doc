

(function () {
    var $;
    var jQuery = $ = require('jQuery');
    require('../lib/jquery.tpls')(jQuery);
    var Template = {
        // 将模板依赖的JS脚本字符串还原为可执行的JS函数
        moduleFunction: function () {
            var args = Array.prototype.slice.call(arguments);
            var funcBody = args.splice(-1) || '';
            return new Function('fragment', funcBody);
        },
        // 将模板依赖的CSS字符串追加到页面中
        templateStyle: function (cssText) {
            var cssNode = $('#J_AppTemplateStyleWrapper');
            var cssNodeWrapper = $('head');
            if (!cssNode.length) {
                cssNode = $('<style id="J_AppTemplateStyleWrapper">');
                cssNodeWrapper.append(cssNode);
            }
            return function () {
                var css = cssNode.html();
                // 避免重复添加相同的CSS代码
                if (css.indexOf(cssText) === -1) {
                    cssNode.html(cssNode.html() + (cssText || ''));
                }
            };
        },
        /*
         * 格式化模板消息数据
         * @param {JSONObject}
         *     @property data {String} Template data
         *     @property template {String} Template code
         *     @property scripts {String} Javascript of this template
         *     @property styles {String} Stylesheet of this template
         * @return {Object}
         *     @property dom {jQueryObject} DOMTree of this template message
         *     @property method {Function}
         *     @property style {Function}
         */
        templateMessageParse: function (data) {
            var dom = $.tmpl(data.template, data.data);
            var modFunc = this.moduleFunction(data.scripts);
            return {
                dom: dom,
                method: modFunc,
                style: this.templateStyle(data.styles)
            };
        }
    };

    module.exports = Template;
})();