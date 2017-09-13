module.exports = function (infoWrapper, loadFn) {
    //var infoWrapper = $("#J_JuiMsgWrapper");
    infoWrapper[0].scrollTop = infoWrapper[0].scrollHeight;
    infoWrapper.prepend("<div class='loadingMore hide'>继续下拉加载更多</div>");
    var loadingMore = infoWrapper.find(".loadingMore");
    var isShowLoad = false;
    var lastSctop = 0;
    var cancleLoad = function () {
        loadingMore.slideUp('fast', function () {
            infoWrapper.animate({ scrollTop: 0 }, 200);
            isShowLoad = false;
        });
    }
    infoWrapper.on('touchmove', function (event) {
        var e = event || window.event;
        var wScrollY = event.currentTarget.scrollTop; // 当前滚动条位置

        if (wScrollY == 0 && (lastSctop - e.touches[0].pageY < 50 && lastSctop - e.touches[0].pageY > -64)) {

            loadingMore.css({ 'margin-top': ((e.touches[0].pageY - lastSctop) / 16 - 4) + 'rem' });
        } else if (wScrollY == 0 && (lastSctop - e.touches[0].pageY < 50 && lastSctop - e.touches[0].pageY <= -64)) {
            isShowLoad = true;
            loadingMore.addClass('active');
        } else {
            if (isShowLoad) {
                isShowLoad = false;
                loadingMore.removeClass('active');
            }
        }
    }).on('touchend', function (e) {
        if (isShowLoad) {
            var loadTxt = loadingMore.html();
            loadingMore.html('加载中...');
            if (loadFn) loadFn.call({
                slidHide: function () {
                    isShowLoad = false;
                    loadingMore.removeClass('active').animate({ 'margin-top': "-4.3rem" }, 100, function () {
                        loadingMore.html(loadTxt);
                        loadingMore.addClass('hide').prependTo(infoWrapper);
                    });
                    
                }
            });
        } else {
            loadingMore.animate({ 'margin-top': "-4.3rem" }, 100);
        }
    }).on('touchstart', function (evenr) {
        var e = event || window.event;
        lastSctop = e.touches[0].pageY;
        loadingMore.removeClass('hide').prependTo(infoWrapper);
    });
}