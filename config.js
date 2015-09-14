'use strict';

var path = require('path');
var argv = require('yargs').argv;

var env = process.env.NODE_ENV || argv.env || 'production';
var isProduction = env === 'production';

module.exports = {
    HOST: process.env.OPENSHIFT_NODEJS_IP || 'localhost',
    PORT: process.env.OPENSHIFT_NODEJS_PORT || 8080,

    LOG_DIR: path.join(__dirname, 'log'),
    PUBLIC_DIR: path.join(__dirname, 'public'),
    BUILD_DIR: path.join(__dirname, 'build'),
    SASS_SRC_DIR: path.join(__dirname, 'src/scss'),
    SASS_BUILD_DIR: path.join(__dirname, 'build/css'),
    JS_SRC_DIR: path.join(__dirname, 'src/js/client'),
    JS_BUILD_DIR: path.join(__dirname, 'build/js'),

    COMPRESS_CSS: isProduction,
    COMPRESS_JS: isProduction,
    ENV: env
};
