'use strict';

// Radar image coordinates
// 46.56,17.70 x 50.9,24.30

var url = require('url');
var fs = require('fs');
var q = require('q');
var path = require('path');
var moment = require('moment');
var imagemagick = require('imagemagick');
var request = require('request');

function download(uri, filePath) {
    var deferred = q.defer();
    var stream = fs.createWriteStream(filePath);

    request(uri).pipe(stream)
        .on('close', deferred.resolve)
        .on('error', deferred.reject);

    return deferred.promise.then(function() {
        stream.end();
    });
}

function getData(time) {
    var quantizedTime = moment(time);
    quantizedTime.hours(quantizedTime.hours() - quantizedTime.hours() % 3 + 9);
    // var imageName = 'zrazky_' + quantizedTime.format('DDMMYYYY-HH') + '.png';
    var imageName = 'zrazky_15092015-03.png';
    var imagePath = path.join(__dirname, imageName);

    var apiUrl = url.format({
        protocol: 'http',
        hostname: 'www.shmu.sk',
        pathname: path.join('data/datanwp/zrazky/', imageName)
    });

    return download(apiUrl, imagePath).then(function() {
        var background = path.join(__dirname, 'api.v2.reference.png');
        var overlay = imagePath;
        var subtracted = path.join(__dirname, 'subtracted.png');
        var deedged = path.join(__dirname, 'deedged.png');
        var blurred = path.join(__dirname, 'blurred.png');

        return q.ninvoke(imagemagick, 'convert', [background, overlay, '-compose', 'difference', '-composite',  subtracted]).then(function() {
            return q.ninvoke(imagemagick, 'convert', [subtracted, '-trim', deedged]);
        }).then(function() {
            return q.ninvoke(imagemagick, 'convert', [deedged, '-gaussian-blur', '9x3', blurred]);
        });
    });
}

exports.atCoordinates = function(lat, lng) {
    if (typeof(lat) !== 'number') throw new Error('Latitude must be a Number, got ' + typeof(lat) + ' instead');
    if (typeof(lng) !== 'number') throw new Error('Longitude must be a Number, got ' + typeof(lng) + ' instead');

    return getData().then(function() {
        console.log('done');
    }, function(error) {
        console.error(error);
    });
};
