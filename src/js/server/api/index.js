'use strict';

var q = require('q');
var imagemagick = require('imagemagick');
var loader = require('./loader');

// Values in mm/3h
var BINS = [
    { r: 255, g: 255, b: 255, value: 0.00 },
    { r: 226, g: 226, b: 226, value: 0.25 },
    { r: 188, g: 188, b: 188, value: 0.50 },
    { r: 166, g: 254, b: 255, value: 1.00 },
    { r: 7, g: 189, b: 255, value: 2.00 },
    { r: 46, g: 130, b: 255, value: 3.00 },
    { r: 140, g: 255, b: 144, value: 5.00 },
    { r: 86, g: 214, b: 125, value: 10.00 },
    { r: 85, g: 170, b: 0, value: 15.00 },
    { r: 0, g: 116, b: 0, value: 20.00 },
    { r: 214, g: 255, b: 33, value: 25.00 },
    { r: 248, g: 255, b: 41, value: 30.00 },
    { r: 255, g: 229, b: 29, value: 35.00 },
    { r: 255, g: 170, b: 127, value: 40.00 },
    { r: 255, g: 85, b: 0, value: 45.00 },
    { r: 255, g: 0, b: 0, value: 50.00 },
    { r: 200, g: 0, b: 0, value: 60.00 },
    { r: 160, g: 0, b: 0, value: 100.00 },
    { r: 116, g: 0, b: 0, value: 200.00 },
    { r: 85, g: 0, b: 127, value: 300.00 }
];

// FIXME These numbers do not represent current image dimensions
function latLngToXY(lat, lng) {
    return {
        x: 95.59367504 * lng - 1583.767468,
        y: - 148.2418007 * lat + 7398.862704
    };
}

function toRGB(string) {
    var values = string.trim().split(',');

    return {
        r: values[0],
        g: values[1],
        b: values[2]
    };
}

function toValue(rgb) {
    return BINS.reduce(function(closest, bin) {
        var dr = bin.r - rgb.r;
        var dg = bin.g - rgb.g;
        var db = bin.b - rgb.b;

        var distance = Math.sqrt(dr * dr + dg * dg + db * db);

        if (distance < closest.distance) return { distance: distance, value: bin.value };

        return closest;
    }, { distance: Number.MAX_VALUE }).value;
}

function getData(time, lat, lng) {
    var coords = latLngToXY(lat, lng);
    var cellSize = 4;
    var x = Math.max(0, coords.x - cellSize / 2);
    var y = Math.max(0, coords.y - cellSize / 2);
    var dx = Math.min(cellSize, 600 - x);
    var dy = Math.min(cellSize, 370 - x);

    return loader.load(time).then(function(imagePath) {
        var command = [
            imagePath,
            '-crop', dx + 'x' + dy + '+' + x + '+' + y,
            '-scale', '1x1',
            '-format', '%[fx:int(255*r+.5)],%[fx:int(255*g+.5)],%[fx:int(255*b+.5)]',
            'info:-'
        ];

        return q.ninvoke(imagemagick, 'convert', command).then(function(output) {
            var rgb = toRGB(output[0]);
            var value = toValue(rgb);

            return value;
        });
    });
}

exports.preload = function(time) {
    return loader.load(time);
};

exports.clearCache = function() {
    return loader.clear();
};

exports.atCoordinates = function(time, lat, lng) {
    if (typeof(lat) !== 'number') throw new Error('Latitude must be a Number, got ' + typeof(lat) + ' instead');
    if (typeof(lng) !== 'number') throw new Error('Longitude must be a Number, got ' + typeof(lng) + ' instead');

    if (lat < 47.6 || lat > 49.6) throw new Error('Latitude out of bounds, got ' + lat);
    if (lng < 16.7 || lng > 22.7) throw new Error('Longitude out of bounds, got ' + lng);

    return getData(time, lat, lng);
};
