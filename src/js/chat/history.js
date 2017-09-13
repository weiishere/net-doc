(function() {
    
    var lastMessage = null;
    var location = null;
    var handle = new Function();

    var Histroies = {
        setLocation : function(url) {
            location = url;
        },

        acquire : function() {

        },

        setHandle : function(callback) {
            handle = callback;
        }
    }

    module.exports = Histroies;
})();