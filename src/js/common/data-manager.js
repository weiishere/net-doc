(function() {
    var datas = {};

    var Manager = {
        set : function(data,id) {
            id = id || data.id;
            if(typeof datas[id] != 'undefined')  return;
            datas[id] = data;
        },

        get : function(id) {
            return datas[id];
        }
    };

    module.exports = Manager;
})();