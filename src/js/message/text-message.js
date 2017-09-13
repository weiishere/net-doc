(function() {

    var  config = require('../chat/config');

    module.exports = {
        render: function(data, who) {
            var clsString = 'jui-msg-'
            clsString += who == 'self' ? 'self' : 'other';

            var avatar = who == 'self' ? config.get('selfAvatar') : config.get('otherAvatar');
            var DOMs = new Array();
            DOMs.push('<div class="jui-msg-common ' + clsString + '">');
            DOMs.push('<img class="jui-msg-avatar" src="' + avatar + '" />');
            DOMs.push('<div class="jui-msg-content-wrapper"><div class="jui-msg-arrow"></div>');
            DOMs.push('<i class="jui-msg-arrow-cover"></i>');
            DOMs.push('<div class="jui-msg-content">' + data + '</div></div></div>');
            return DOMs.join('');
        }
    }
})();