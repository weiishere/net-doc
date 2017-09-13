(function(w, u) {

window.PrescriptionMessage = Message.extend({
    render : function() {
        var data = this.data;

        var DOMs = new Array();
        DOMs.push('<div class="jui-msg-common jui-msg-other jui-msg-presciption-card">');
        DOMs.push('<img class="jui-msg-avatar" src="' + Message.otherAvatar + '" />');
        DOMs.push('<div class="jui-msg-content-wrapper">');
        DOMs.push('<div class="jui-msg-arrow"></div><i class="jui-msg-arrow-cover"></i>');
        DOMs.push('<div class="jui-msg-content">');
        DOMs.push('<div class="jui-prescription-doc">');
        DOMs.push('<div class="jui-prescription-result">')
        DOMs.push('<i></i>' + data.desc + '</div>');
        DOMs.push('<div class="jui-prescription-link">');
        DOMs.push('<a href="#"><span>查看处方详情</span><i class="jui-link-arrow"></i></div>');
        DOMs.push('</div></div></div></div>');

        return DOMs.join('');
    }
});

})(window, undefined);


(function() {
    
})();