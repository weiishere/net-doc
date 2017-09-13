(function(){
    
    module.exports = {
        render : function(data) {

            var DOMs = new Array();
            DOMs.push('<div class="jui-msg-ommon jui-msg-self jui-msg-patient-card">');
            DOMs.push('<img class="jui-msg-avatar" src="' + Message.selfAvatar + '" />');
            DOMs.push('<div class="jui-msg-content-wrapper">');
            DOMs.push('<div class="jui-msg-arrow"></div><i class="jui-msg-arrow-cover"></i>');
            DOMs.push('<div class="jui-msg-content">');
            DOMs.push('<div class="jui-patient-doc">');
            DOMs.push('<div class="jui-patient-basic-info">');
            DOMs.push(data.name + '<span class="jui-basi-lap"></span>' + data.sex + '<span class="jui-basi-lap"></span>' + data.age + '岁');
            DOMs.push('<div class="jui-patient-condition-des">' + data.desc + '</div></div>');
            DOMs.push('<div class="jui-patient-doc-link">');
            DOMs.push('<a href="#"><span>查看患者档案</span><i class="jui-link-arrow"></i></div>');
            DOMs.push('</div></div></div></div>');

            return DOMs.join('');
        }
    }
})();