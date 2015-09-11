'use strict';

var express = require('express');
var serveStatic = require('serve-static');

var config = require('./config');
var app = express();

app.use(serveStatic(config.PUBLIC_DIR));
app.use(serveStatic(config.BUILD_DIR));

app.listen(config.PORT, config.HOST, function serverStartCallback() {
    console.info('server started on http://' + config.HOST + ':' + config.PORT);
});
