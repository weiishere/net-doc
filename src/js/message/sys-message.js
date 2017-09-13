var $ = require('jquery');

(function() {
    module.exports = {
        render: function(data,isAcition) {
            $("div[role='action']").remove();
            var string = '—— ' + data + ' ——' ;
            return '<div class="jui-msg-sys" role="action">' + string + '</div>';
        }
    }
})();