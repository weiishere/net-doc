(function () {

    module.exports = {
        render: function (data, isAction) {
            var ac = isAction ? "role=\"action\"" : "";
            return '<div class="jui-msg-time" ' + ac + '>' + data + '</div>';
        }
    }
})();