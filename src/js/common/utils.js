
module.exports = {
    getUrlParmter: (key) => (document.location.search.match(new RegExp("(?:^\\?|&)" + key + "=(.*?)(?=&|$)")) || ['', null])[1]
}