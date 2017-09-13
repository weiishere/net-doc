/**
 * 2017-06-28
 */

// 载入资源文件
require('./css/base.css');
// require('./css/pop.css');
require('./css/skin.css');
require('./css/message.css');
require('./css/component.less');
require.context('./i/');



// 应用入口文件
var App = require('./js/app');
//console.log(App);
var app = App.install();
window.SmartApp = app;
