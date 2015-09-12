'use strict';

var express = require('express');
var serveStatic = require('serve-static');

var config = require('./config');
var app = express();
var api = require('./src/js/server/api');

app.use(serveStatic(config.PUBLIC_DIR));
app.use(serveStatic(config.BUILD_DIR));

app.get('/forecast/coordinates', function(req, res) {
    var lat = req.params.lat || null;
    var lng = req.params.lng || null;

    api.atCoordinates(lat, lng).then(function(forecast) {
        res.json(forecast);
    }, function(error) {
        res.json({ error: error });
    });
});

app.listen(config.PORT, config.HOST, function serverStartCallback() {
    console.info('server started on http://' + config.HOST + ':' + config.PORT);
});
