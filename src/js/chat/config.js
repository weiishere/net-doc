(function (argument) {
    // body...

    var configs = {
        initUrl: "//soa-dd.jd.com/request.do",
        logListUrl: "//log-dd.jd.com/log/sessions.do",
        //socketUrl:"10.182.67.197",
        baseUrl: "//10.14.140.91:8081/net-doc/build/20170609/",
        avatar: "//img11.360buyimg.com/pop/",
        selfAvatar: "//img13.360buyimg.com/cms/jfs/t6244/5/1566983053/3403/4def53fc/595468c2N597473ee.png",
        otherAvatar: "//img14.360buyimg.com/cms/jfs/t6184/14/1587950103/3764/868e8c73/595468c2N9366595d.png",
        logMes: [],
        timeOut: 10000
    };

    module.exports = {
        set: function (key, value) {
            configs[key] = value;
        },
        get: function (key) {
            return configs[key];
        }
    }
})();