/**
 * Created by wanghaixin on 2017/6/16.
 */
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
//var serverHost = '192.168.191.1'
var serverHost = 'static.360buyimg.com';
//var serverHost = '10.14.142.89';
//var serverHost = 'doctor.jd.com';

var version = '20170911';
var serverFolder = '';
var serverPort = 80;


module.exports = {
    entry: {
        main: __dirname + '/src/index',
        vender: ['jquery', 'meld', 'iscroll']
    },
    output: {
        path: __dirname + '/build/',
        filename: version + '/js/app.js',
        publicPath: '//' + serverHost + (serverPort == 80 ? '' : ':' + serverPort) + '/net-doc/build/'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }],
        rules: [
            {
                test: /\.(css|less)$/i,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ["css-loader?sourceMap", "less-loader?sourceMap"]
                })
            },
            // {
            //     test: /\.css$/,
            //     loader: ExtractTextPlugin.extract('css-loader?sourceMap')
            // },
            {
                test: /\.(jpe?g|png|gif)$/i,
                loader: 'url-loader?name=' + version + '/i/[name].[ext]&limit=10'
            }, {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }, {
                test: /\.html$/,
                loader: "raw-loader" // loaders: ['raw-loader'] is also perfectly acceptable.
            }]
    },
    plugins: [
        //new ExtractTextPlugin(version + '/css/app.css'),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin({
            filename: version + '/css/app.css',
            disable: false,
            allChunks: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vender',
            filename: version + '/js/vender.js'
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            comments: false,
            sourceMap: false
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            hash: true,
            version: version,
            template: __dirname + '/src/index.ejs'
        }),
        new HtmlWebpackPlugin({
            filename: 'demo.html',
            template: __dirname + '/src/demo.html'
        }),
        new HtmlWebpackPlugin({
            title: 'websocket消息发送测试',
            filename: 'test.html',
            template: __dirname + '/src/test.ejs',
            chunks: []
        })
    ],
    devtool: '#source-map',//cheap-module-source-map',
    devServer: {
        contentBase: __dirname + '/build',
        compress: true,
        sourceMap: true,
        historyApiFallback: true,
        hot: false,
        inline: true,
        grogress: true,
        host: serverHost,
        port: serverPort,
        watchContentBase: true,
        watchOptions: {
            poll: 500
        }
    },
    watch: true,
    watchOptions: {
        poll: 1000,
        ignored: /node_modules/
    }
};
