var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');

var PATHS = {
    input: 'lib',
    output: 'dist'
};

var common = {
    entry: "./lib/entry.js",
    output: {
        path: path.join(__dirname, PATHS.output),
        filename: "bundle.js",
        libraryTarget: 'umd',
        library: 'gsLangCore'
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {test: /\.css$/, loader: "style!css"}
        ]
    }
};

var TARGET = process.env.npm_lifecycle_event;

if (TARGET === 'start' || !TARGET) {
    module.exports = merge(common, {
        devServer: {
            contentBase: PATHS.build,

            // Enable history API fallback so HTML5 History API based
            // routing works. This is a good default that will come
            // in handy in more complicated setups.
            historyApiFallback: true,
            hot: true,
            inline: true,
            progress: true,

            // Display only errors to reduce the amount of output.
            stats: 'errors-only',

            // Parse host and port from env so this is easy to customize.
            //
            // If you use Vagrant or Cloud9, set
            // host: process.env.HOST || '0.0.0.0';
            //
            // 0.0.0.0 is available to all network devices unlike default
            // localhost
            host: process.env.HOST,
            port: process.env.PORT
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin()
        ]
    });
}
