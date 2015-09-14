'use strict';

var express = require('express');
var serveStatic = require('serve-static');

var config = require('./config');
var app = express();
var api = require('./src/js/server/api');
var logger = require('./src/js/server/logger').http;

app.use(serveStatic(config.PUBLIC_DIR));
app.use(serveStatic(config.BUILD_DIR));

app.get('/forecast/coordinates', function(req, res) {
    var lat = req.params.lat || null;
    var lng = req.params.lng || null;
    var time = Number(req.params.timestamp) || new Date();

    logger.log('info', 'Requesting for [%s,%s] @ %s', lat, lng, time);

    api.atCoordinates(time, lat, lng).then(function(forecast) {
        res.json(forecast);
    }, function(error) {
        res.json({ error: error });
    });
});

app.listen(config.PORT, config.HOST, function serverStartCallback() {
    logger.log('info', 'Server started at http://%s:%s', config.HOST, config.PORT);
});
