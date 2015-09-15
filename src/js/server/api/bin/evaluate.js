#!/usr/bin/env node

'use strict';

var xyRgb = process.argv[2].split(',');
var x = xyRgb[0];
var y = xyRgb[1];
var r = xyRgb[2];
var g = xyRgb[3];
var b = xyRgb[4];

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

var minDistance = Number.MAX_VALUE;
var value = 0;
var bin;
var dr;
var dg;
var db;

for (var i = 0, n = BINS.length; i < n; i++) {
    bin = BINS[i];
    dr = bin.r - r;
    dg = bin.g - g;
    db = bin.b - b;

    var distance = dr * dr + dg * dg + db * db;

    if (distance < minDistance) {
        minDistance = distance;
        value = bin.value;
    }
}

console.log([x, y, value].join(','));
